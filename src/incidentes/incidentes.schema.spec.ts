import { from } from "rxjs";
import { Incidente, IncidenteSchema } from '../schemas/incidente.schema';

describe('IncidenteSchema', () => {
  it('should define the schema and model', () => {
    expect(Incidente).toBeDefined();
    expect(IncidenteSchema).toBeDefined();
  });

  it('should have expected schema properties', () => {
    const schemaPaths = Object.keys(IncidenteSchema.paths);
    expect(schemaPaths).toEqual(
      expect.arrayContaining([
        'from',
        'wa_id',
        'name',
        'message_id',
        'timestamp',
        'text',
        'tipo',
        'estado',
        'latitude',
        'longitude',
        'prioridad',
        'recursos_asignados',
        'observaciones',
        'score_clasificacion',
        'factores_aplicados',
        'tiempo_respuesta_sugerido',
      ])
    );
  });
});