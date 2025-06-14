import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IncidenteDocument = Incidente & Document;

@Schema({ timestamps: true })
export class Incidente {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  wa_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  message_id: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  tipo: string;

  @Prop({ default: 'pendiente', enum: ['pendiente', 'en_proceso', 'resuelto'] })
  estado: string;

  @Prop()
  latitude?: number;

  @Prop()
  longitude?: number;

  @Prop({ default: 'alta', enum: ['baja', 'media', 'alta', 'critica'] })
  prioridad: string;

  @Prop()
  recursos_asignados?: string[];

  @Prop()
  observaciones?: string;

  @Prop({ required: true })
  score_clasificacion: number;

  @Prop({ type: [String] })
  factores_aplicados: string[];

  @Prop()
  tiempo_respuesta_sugerido: string;
}

export const IncidenteSchema = SchemaFactory.createForClass(Incidente);