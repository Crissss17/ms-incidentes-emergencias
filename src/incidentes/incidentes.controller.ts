import { Controller, Get, Post, Body, Patch, Param, Query, Logger } from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { CreateIncidenteDto } from '../dto/create-incidente.dto';
import { Incidente } from '../schemas/incidente.schema';

@Controller('incidentes')
export class IncidentesController {
  private readonly logger = new Logger(IncidentesController.name);

  constructor(private readonly incidentesService: IncidentesService) {}

  @Post()
  async create(@Body() createIncidenteDto: CreateIncidenteDto) {
    this.logger.log(`POST /incidentes - Body recibido: ${JSON.stringify(createIncidenteDto)}`);
    return this.incidentesService.createIncidente(createIncidenteDto);
  }

  /**
   * Listar incidentes filtrando por estado, tipo y/o prioridad (AND implícito).
   */
  @Get()
  async findAll(
    @Query('estado') estado?: string,
    @Query('tipo') tipo?: string,
    @Query('prioridad') prioridad?: string
  ): Promise<Incidente[]> {
    const filtro: any = {};
    if (estado) filtro.estado = estado;
    if (tipo) filtro.tipo = tipo;
    if (prioridad) filtro.prioridad = prioridad;

    this.logger.log(`GET /incidentes - Filtro recibido: ${JSON.stringify(filtro)}`);
    return this.incidentesService.findByFiltro(filtro);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Incidente | null> {
    this.logger.log(`GET /incidentes/${id}`);
    return this.incidentesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Incidente>,
  ): Promise<Incidente | null> {
    this.logger.log(`PATCH /incidentes/${id} - Body: ${JSON.stringify(updateData)}`);
    return this.incidentesService.updateIncidente(id, updateData);
  }

  @Get('stats/resumen')
  async getStats() {
    this.logger.log('GET /incidentes/stats/resumen');
    const incidentes = await this.incidentesService.findAll();
    const stats = {
      total: incidentes.length,
      porEstado: {
        pendiente: incidentes.filter(i => i.estado === 'pendiente').length,
        en_proceso: incidentes.filter(i => i.estado === 'en_proceso').length,
        resuelto: incidentes.filter(i => i.estado === 'resuelto').length,
      },
      porTipo: {},
      porPrioridad: {
        baja: incidentes.filter(i => i.prioridad === 'baja').length,
        media: incidentes.filter(i => i.prioridad === 'media').length,
        alta: incidentes.filter(i => i.prioridad === 'alta').length,
        critica: incidentes.filter(i => i.prioridad === 'critica').length,
      },
    };

    // Conteo por tipo
    incidentes.forEach(incidente => {
      stats.porTipo[incidente.tipo] = (stats.porTipo[incidente.tipo] || 0) + 1;
    });

    return stats;
  }

  @Get('health')
  health() {
    this.logger.log('GET /incidentes/health');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ms-incidentes'
    };
  }
}