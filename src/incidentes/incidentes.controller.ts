import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { CreateIncidenteDto } from '../dto/create-incidente.dto';
import { Incidente } from '../schemas/incidente.schema';

@Controller('incidentes')
export class IncidentesController {
  constructor(private readonly incidentesService: IncidentesService) {}

  @Post()
  async create(@Body() createIncidenteDto: CreateIncidenteDto) {
    return this.incidentesService.createIncidente(createIncidenteDto);
  }

  @Get()
  async findAll(
    @Query('estado') estado?: string,
    @Query('tipo') tipo?: string,
  ): Promise<Incidente[]> {
    if (estado) {
      return this.incidentesService.findByEstado(estado);
    }
    
    if (tipo) {
      return this.incidentesService.findByTipo(tipo);
    }
    
    return this.incidentesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Incidente | null> {
    return this.incidentesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Incidente>,
  ): Promise<Incidente | null> {
    return this.incidentesService.updateIncidente(id, updateData);
  }

  @Get('stats/resumen')
  async getStats() {
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

    incidentes.forEach(incidente => {
      stats.porTipo[incidente.tipo] = (stats.porTipo[incidente.tipo] || 0) + 1;
    });

    return stats;
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ms-incidentes'
    };
  }
}