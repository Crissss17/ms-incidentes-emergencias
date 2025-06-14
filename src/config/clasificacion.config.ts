export interface ReglaClasificacion {
  tipo: string;
  keywords: string[];
  basePriority: number; // 1-10, donde 10 es más crítico
  factoresModificadores: {
    ubicacion?: boolean; // Si tiene coordenadas GPS
    horaDelDia?: 'dia' | 'noche' | 'cualquiera';
    palabrasIntensificadoras?: string[];
    contextoUrbano?: boolean;
  };
}

export interface ConfigClasificacion {
  reglas: ReglaClasificacion[];
  modificadores: {
    conUbicacion: number; // +2 puntos si tiene GPS
    horaNocturna: number; // +1 punto si es de noche (22:00-06:00)
    palabrasUrgentes: number; // +1 punto por palabra urgente
    zonaUrbana: number; // +1 punto si es zona urbana
  };
  umbrales: {
    critica: number; // >= 8 puntos
    alta: number; // >= 6 puntos
    media: number; // >= 4 puntos
    baja: number; // < 4 puntos
  };
}

export const CLASIFICACION_CONFIG: ConfigClasificacion = {
  reglas: [
    // 🔥 EMERGENCIAS CRÍTICAS (Riesgo de vida inmediato)
    {
      tipo: 'incendio',
      keywords: ['incendio', 'fuego', 'humo', 'quemando', 'llamas', 'ardiendo'],
      basePriority: 9,
      factoresModificadores: {
        ubicacion: true,
        horaDelDia: 'cualquiera',
        palabrasIntensificadoras: ['grande', 'edificio', 'personas', 'atrapados', 'explosion'],
        contextoUrbano: true
      }
    },
    {
      tipo: 'medica',
      keywords: ['infarto', 'paro', 'cardiaco', 'respirar', 'inconsciente', 'sangre', 'herido'],
      basePriority: 10,
      factoresModificadores: {
        ubicacion: true,
        horaDelDia: 'cualquiera',
        palabrasIntensificadoras: ['grave', 'mucho', 'sangre', 'inconsciente', 'no respira'],
        contextoUrbano: false
      }
    },
    {
      tipo: 'terremoto',
      keywords: ['terremoto', 'temblor', 'sismo', 'tiembla', 'edificio', 'cayendo'],
      basePriority: 10,
      factoresModificadores: {
        ubicacion: true,
        horaDelDia: 'cualquiera',
        palabrasIntensificadoras: ['fuerte', 'derrumbe', 'atrapados', 'grietas'],
        contextoUrbano: true
      }
    },

    // ⚠️ EMERGENCIAS ALTAS (Riesgo significativo)
    {
      tipo: 'accidente',
      keywords: ['accidente', 'choque', 'atropello', 'volcadura', 'colision'],
      basePriority: 7,
      factoresModificadores: {
        ubicacion: true,
        horaDelDia: 'noche', // Más peligroso de noche
        palabrasIntensificadoras: ['heridos', 'carretera', 'velocidad', 'ambulancia'],
        contextoUrbano: true
      }
    },
    {
      tipo: 'inundacion',
      keywords: ['inundacion', 'inundado', 'agua', 'lluvia', 'desborde', 'rio'],
      basePriority: 6,
      factoresModificadores: {
        ubicacion: true,
        horaDelDia: 'cualquiera',
        palabrasIntensificadoras: ['casa', 'atrapados', 'corriente', 'subiendo'],
        contextoUrbano: true
      }
    },
    {
      tipo: 'rescate',
      keywords: ['rescate', 'atrapado', 'perdido', 'montaña', 'bosque', 'cueva'],
      basePriority: 6,
      factoresModificadores: {
        ubicacion: true,
        horaDelDia: 'noche', // Más peligroso de noche
        palabrasIntensificadoras: ['solo', 'frio', 'herido', 'sin comunicacion'],
        contextoUrbano: false
      }
    },

    // 🟡 EMERGENCIAS MEDIAS (Seguridad personal)
    {
      tipo: 'robo',
      keywords: ['robo', 'asalto', 'ladron', 'robando', 'amenaza', 'pistola'],
      basePriority: 5,
      factoresModificadores: {
        ubicacion: true,
        horaDelDia: 'noche',
        palabrasIntensificadoras: ['armado', 'pistola', 'cuchillo', 'violento'],
        contextoUrbano: true
      }
    },
    {
      tipo: 'violencia',
      keywords: ['golpes', 'pelea', 'agresion', 'violencia', 'amenaza'],
      basePriority: 4,
      factoresModificadores: {
        ubicacion: true,
        horaDelDia: 'noche',
        palabrasIntensificadoras: ['arma', 'sangre', 'herido', 'familiar'],
        contextoUrbano: true
      }
    },

    // 🔵 EMERGENCIAS BAJAS (Situaciones menores)
    {
      tipo: 'disturbios',
      keywords: ['ruido', 'molestia', 'musica', 'gritos', 'alboroto'],
      basePriority: 2,
      factoresModificadores: {
        ubicacion: false,
        horaDelDia: 'noche',
        palabrasIntensificadoras: ['muchas personas', 'violento'],
        contextoUrbano: true
      }
    },
    {
      tipo: 'infraestructura',
      keywords: ['poste', 'cable', 'luz', 'agua', 'gas', 'alcantarilla'],
      basePriority: 3,
      factoresModificadores: {
        ubicacion: true,
        horaDelDia: 'cualquiera',
        palabrasIntensificadoras: ['peligro', 'roto', 'fuga', 'electrico'],
        contextoUrbano: true
      }
    }
  ],

  modificadores: {
    conUbicacion: 2,
    horaNocturna: 1,
    palabrasUrgentes: 1,
    zonaUrbana: 1
  },

  umbrales: {
    critica: 8,
    alta: 6,
    media: 4,
    baja: 0
  }
};