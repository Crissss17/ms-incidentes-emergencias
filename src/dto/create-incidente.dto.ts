import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, IsDateString } from 'class-validator';

export class CreateIncidenteDto {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  wa_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  message_id: string;

  @IsDateString()
  timestamp: string; // <-- debe ser string, no Date

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsEnum(['pendiente', 'en_proceso', 'resuelto'])
  @IsOptional()
  estado?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsEnum(['baja', 'media', 'alta', 'critica'])
  @IsOptional()
  prioridad?: string;

  @IsArray()
  @IsOptional()
  recursos_asignados?: string[];

  @IsString()
  @IsOptional()
  observaciones?: string;
}