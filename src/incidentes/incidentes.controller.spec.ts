import { Test, TestingModule } from '@nestjs/testing';
import { IncidentesController } from './incidentes.controller';
import { IncidentesService } from './incidentes.service';

const mockIncidentesService = {
  createIncidente: jest.fn(),
  findByFiltro: jest.fn(),
  findOne: jest.fn(),
  updateIncidente: jest.fn(),
  findAll: jest.fn(),
};

describe('IncidentesController', () => {
  let controller: IncidentesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentesController],
      providers: [
        { provide: IncidentesService, useValue: mockIncidentesService },
      ],
    }).compile();

    controller = module.get<IncidentesController>(IncidentesController);
    jest.clearAllMocks();
  });

  it('crea un incidente', async () => {
    mockIncidentesService.createIncidente.mockResolvedValue({ id: '1' });
    const result = await controller.create({ text: 'incendio' } as any);
    expect(result).toEqual({ id: '1' });
  });

  it('findAll filtra por estado/tipo/prioridad', async () => {
    mockIncidentesService.findByFiltro.mockResolvedValue([{ id: '2' }]);
    const result = await controller.findAll('resuelto', 'incendio', 'alta');
    expect(result).toEqual([{ id: '2' }]);
    expect(mockIncidentesService.findByFiltro).toHaveBeenCalledWith({
      estado: 'resuelto', tipo: 'incendio', prioridad: 'alta'
    });
  });

  it('findOne retorna incidente por id', async () => {
    mockIncidentesService.findOne.mockResolvedValue({ id: '3' });
    const result = await controller.findOne('3');
    expect(result).toEqual({ id: '3' });
  });

  it('update actualiza incidente', async () => {
    mockIncidentesService.updateIncidente.mockResolvedValue({ id: '4' });
    const result = await controller.update('4', { estado: 'resuelto' });
    expect(result).toEqual({ id: '4' });
  });

  it('getStats calcula estadísticas', async () => {
    mockIncidentesService.findAll.mockResolvedValue([
      { estado: 'pendiente', tipo: 'incendio', prioridad: 'alta' },
      { estado: 'resuelto', tipo: 'robo', prioridad: 'media' }
    ]);
    const stats = await controller.getStats();
    expect(stats.total).toBe(2);
    expect(stats.porEstado.pendiente).toBe(1);
    expect(stats.porEstado.resuelto).toBe(1);
    expect(typeof stats.porTipo['incendio']).toBe('number');
    expect(typeof stats.porPrioridad['alta']).toBe('number');
  });

  it('health endpoint responde ok', () => {
    const result = controller.health();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('ms-incidentes');
  });
});