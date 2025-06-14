import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmqpConnection, RabbitSubscribe, RabbitPayload } from '@golevelup/nestjs-rabbitmq';
import { Incidente, IncidenteDocument } from '../schemas/incidente.schema';
import { CreateIncidenteDto } from '../dto/create-incidente.dto';
import { ClasificacionService } from '../services/clasificacion.service';

@Injectable()
export class IncidentesService {
  private readonly logger = new Logger(IncidentesService.name);

  constructor(
    @InjectModel(Incidente.name) private incidenteModel: Model<IncidenteDocument>,
    private readonly amqpConnection: AmqpConnection,
    private readonly clasificacionService: ClasificacionService,
  ) {}

  @RabbitSubscribe({
    exchange: 'emergencias',
    routingKey: 'mensaje.clasificado',
    queue: 'incidentes.queue',
  })
  async handleEmergencyMessage(@RabbitPayload() payload: CreateIncidenteDto) {
    try {
      this.logger.log(`📨 Mensaje recibido desde WhatsApp: ${JSON.stringify(payload)}`);
      
      const incidente = await this.createIncidente(payload);
      await this.publishToRecursos(incidente);
      
      this.logger.log(`✅ Incidente procesado exitosamente: ${incidente._id}`);
      
    } catch (error) {
      this.logger.error(`❌ Error procesando mensaje de emergencia: ${error.message}`);
      throw error;
    }
  }

  async createIncidente(createIncidenteDto: CreateIncidenteDto): Promise<IncidenteDocument> {
    const clasificacion = this.clasificacionService.calcularPrioridad(createIncidenteDto);
    
    const incidente = new this.incidenteModel({
      ...createIncidenteDto,
      prioridad: clasificacion.prioridad,
      estado: 'pendiente',
      score_clasificacion: clasificacion.score,
      factores_aplicados: clasificacion.factoresAplicados,
      tiempo_respuesta_sugerido: clasificacion.tiempoRespuestaSugerido,
    });

    const savedIncidente = await incidente.save();
    
    this.logger.log(
      `💾 Incidente guardado - ID: ${savedIncidente._id}, ` +
      `Tipo: ${clasificacion.tipoEmergencia}, ` +
      `Prioridad: ${clasificacion.prioridad}, ` +
      `Score: ${clasificacion.score}, ` +
      `Tiempo respuesta: ${clasificacion.tiempoRespuestaSugerido}`
    );
    
    return savedIncidente;
  }

  async findAll(): Promise<Incidente[]> {
    return this.incidenteModel.find().sort({ timestamp: -1 }).exec();
  }

  async findByEstado(estado: string): Promise<Incidente[]> {
    return this.incidenteModel.find({ estado }).sort({ timestamp: -1 }).exec();
  }

  async findByTipo(tipo: string): Promise<Incidente[]> {
    return this.incidenteModel.find({ tipo }).sort({ timestamp: -1 }).exec();
  }

  async findOne(id: string): Promise<Incidente | null> {
    return this.incidenteModel.findById(id).exec();
  }

  async updateIncidente(id: string, updateData: Partial<Incidente>): Promise<Incidente | null> {
    const updatedIncidente = await this.incidenteModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updatedIncidente) {
      this.logger.warn(`⚠️ Incidente no encontrado: ${id}`);
      return null;
    }
    
    this.logger.log(`🔄 Incidente actualizado: ${id}`);
    
    if (updateData.estado) {
      await this.publishStatusUpdate(updatedIncidente);
    }
    
    return updatedIncidente;
  }

  private async publishToRecursos(incidente: IncidenteDocument) {
    const payload = {
      incidenteId: String(incidente._id),
      tipo: incidente.tipo,
      prioridad: incidente.prioridad,
      latitude: incidente.latitude,
      longitude: incidente.longitude,
      timestamp: incidente.timestamp,
    };

    try {
      await this.amqpConnection.publish(
        'recursos',
        'incidente.nuevo',
        payload
      );
      
      this.logger.log(`📤 Evento publicado a recursos: ${payload.incidenteId}`);
    } catch (error) {
      this.logger.error(`❌ Error publicando a recursos: ${error.message}`);
      throw error;
    }
  }

  private async publishStatusUpdate(incidente: IncidenteDocument) {
    const payload = {
      incidenteId: String(incidente._id),
      estado: incidente.estado,
      recursos_asignados: incidente.recursos_asignados,
      timestamp: new Date(),
    };

    try {
      await this.amqpConnection.publish(
        'recursos',
        'incidente.actualizado',
        payload
      );
      
      this.logger.log(`📤 Actualización de estado publicada: ${payload.incidenteId}`);
    } catch (error) {
      this.logger.error(`❌ Error publicando actualización: ${error.message}`);
    }
  }
}