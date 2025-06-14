import { Injectable, Logger } from '@nestjs/common';
import { CLASIFICACION_CONFIG, ReglaClasificacion } from '../config/clasificacion.config';
import { CreateIncidenteDto } from '../dto/create-incidente.dto';

export interface ResultadoClasificacion {
  prioridad: string;
  score: number;
  tipoEmergencia: string;
  factoresAplicados: string[];
  tiempoRespuestaSugerido: string;
}

@Injectable()
export class ClasificacionService {
  private readonly logger = new Logger(ClasificacionService.name);

  calcularPrioridad(incidente: CreateIncidenteDto): ResultadoClasificacion {
    const horaActual = new Date();
    const textoNormalizado = incidente.text.toLowerCase();
    
    const { tipo, scoreBase, regla } = this.detectarTipoEmergencia(textoNormalizado);
    
    const factoresAplicados: string[] = [`Tipo: ${tipo} (${scoreBase} pts)`];
    let scoreTotal = scoreBase;

    if (incidente.latitude && incidente.longitude) {
      scoreTotal += CLASIFICACION_CONFIG.modificadores.conUbicacion;
      factoresAplicados.push(`GPS disponible (+${CLASIFICACION_CONFIG.modificadores.conUbicacion} pts)`);
    }

    const hora = horaActual.getHours();
    const esNocturno = hora >= 22 || hora < 6;
    if (esNocturno && regla?.factoresModificadores?.horaDelDia !== 'dia') {
      scoreTotal += CLASIFICACION_CONFIG.modificadores.horaNocturna;
      factoresAplicados.push(`Horario nocturno (+${CLASIFICACION_CONFIG.modificadores.horaNocturna} pt)`);
    }

    if (regla?.factoresModificadores?.palabrasIntensificadoras) {
      const palabrasEncontradas = this.buscarPalabrasIntensificadoras(
        textoNormalizado,
        regla.factoresModificadores.palabrasIntensificadoras
      );
      
      if (palabrasEncontradas.length > 0) {
        scoreTotal += CLASIFICACION_CONFIG.modificadores.palabrasUrgentes;
        factoresAplicados.push(
          `Palabras urgentes: ${palabrasEncontradas.join(', ')} (+${CLASIFICACION_CONFIG.modificadores.palabrasUrgentes} pt)`
        );
      }
    }

    const multiplePersonas = this.detectarMultiplesPersonas(textoNormalizado);
    if (multiplePersonas) {
      scoreTotal += 1;
      factoresAplicados.push('Múltiples personas afectadas (+1 pt)');
    }

    const prioridad = this.obtenerPrioridadPorScore(scoreTotal);
    const tiempoRespuesta = this.obtenerTiempoRespuesta(prioridad);

    this.logger.log(
      `🎯 Clasificación completada: Tipo=${tipo}, Score=${scoreTotal}, Prioridad=${prioridad}, ` +
      `Factores=[${factoresAplicados.length}]`
    );

    return {
      prioridad,
      score: scoreTotal,
      tipoEmergencia: tipo,
      factoresAplicados,
      tiempoRespuestaSugerido: tiempoRespuesta
    };
  }

  private detectarTipoEmergencia(texto: string): { tipo: string; scoreBase: number; regla?: ReglaClasificacion } {
    for (const regla of CLASIFICACION_CONFIG.reglas) {
      const coincide = regla.keywords.some(keyword => texto.includes(keyword));
      
      if (coincide) {
        return {
          tipo: regla.tipo,
          scoreBase: regla.basePriority,
          regla
        };
      }
    }

    this.logger.warn(`⚠️ No se pudo clasificar el mensaje: "${texto.substring(0, 50)}..."`);
    return {
      tipo: 'general',
      scoreBase: 3
    };
  }

  private buscarPalabrasIntensificadoras(texto: string, palabras: string[]): string[] {
    return palabras.filter(palabra => texto.includes(palabra.toLowerCase()));
  }

  private detectarMultiplesPersonas(texto: string): boolean {
    const indicadoresMultiples = [
      'nosotros', 'familia', 'personas', 'gente', 'varios', 
      'muchos', 'todos', 'niños', 'adultos', 'heridos'
    ];
    
    return indicadoresMultiples.some(indicador => texto.includes(indicador));
  }

  private obtenerPrioridadPorScore(score: number): string {
    const { umbrales } = CLASIFICACION_CONFIG;
    
    if (score >= umbrales.critica) return 'critica';
    if (score >= umbrales.alta) return 'alta';
    if (score >= umbrales.media) return 'media';
    return 'baja';
  }

  private obtenerTiempoRespuesta(prioridad: string): string {
    const tiempos = {
      critica: '<5 minutos',
      alta: '<15 minutos',
      media: '<30 minutos',
      baja: 'Cuando sea posible'
    };
    
    return tiempos[prioridad] || 'No determinado';
  }

  async obtenerEstadisticasClasificacion(): Promise<any> {
    return {
      reglasActivas: CLASIFICACION_CONFIG.reglas.length,
      tiposEmergencia: CLASIFICACION_CONFIG.reglas.map(r => r.tipo),
      umbralesActuales: CLASIFICACION_CONFIG.umbrales,
      modificadoresActivos: Object.keys(CLASIFICACION_CONFIG.modificadores)
    };
  }
}