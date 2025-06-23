import { ClasificacionService } from './clasificacion.service';

describe('ClasificacionService', () => {
  let service: ClasificacionService;

  beforeEach(() => {
    service = new ClasificacionService();
  });

  it('calcula prioridad básica de incendio', () => {
    const result = service.calcularPrioridad({
      text: 'incendio en casa',
      tipo: 'incendio'
    } as any);
    expect(result.prioridad).toMatch(/alta|critica|media|baja/);
    expect(result.tipoEmergencia).toBe('incendio');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.tiempoRespuestaSugerido).toBeDefined();
  });

  it('detecta palabras intensificadoras y múltiples personas', () => {
    // Usa palabras INTENSIFICADORAS que estén realmente en tu config
    const result = service.calcularPrioridad({
      text: 'hay muchos heridos, urgente por favor incendio',
      tipo: 'incendio'
    } as any);
    expect(result.factoresAplicados.some(f => f.toLowerCase().includes('palabras urgentes'))).toBeTruthy();
    expect(result.factoresAplicados.some(f => f.toLowerCase().includes('múltiples personas'))).toBeTruthy();
  });

  it('retorna general si no logra clasificar', () => {
    const result = service.calcularPrioridad({
      text: 'mensaje raro', tipo: ''
    } as any);
    expect(result.tipoEmergencia).toBe('general');
  });

  it('obtenerEstadisticasClasificacion funciona', async () => {
    const stats = await service.obtenerEstadisticasClasificacion();
    expect(stats).toHaveProperty('reglasActivas');
    expect(stats).toHaveProperty('tiposEmergencia');
    expect(stats).toHaveProperty('umbralesActuales');
    expect(stats).toHaveProperty('modificadoresActivos');
  });
});