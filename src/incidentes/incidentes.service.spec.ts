import { Test, TestingModule } from '@nestjs/testing';
import { IncidentesService } from './incidentes.service';
import { getModelToken } from '@nestjs/mongoose';
import { ClasificacionService } from '../services/clasificacion.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

const mockIncidenteModel = {
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  save: jest.fn(),
};

const mockAmqpConnection = {
  publish: jest.fn(),
};

const mockClasificacionService = {
  calcularPrioridad: jest.fn().mockReturnValue({
    prioridad: 'alta',
    score: 8,
    tipoEmergencia: 'incendio',
    factoresAplicados: ['Tipo: incendio (8 pts)'],
    tiempoRespuestaSugerido: '<15 minutos'
  }),
};

describe('IncidentesService', () => {
  let service: IncidentesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentesService,
        { provide: getModelToken('Incidente'), useValue: mockIncidenteModel },
        { provide: AmqpConnection, useValue: mockAmqpConnection },
        { provide: ClasificacionService, useValue: mockClasificacionService },
      ],
    }).compile();

    service = module.get<IncidentesService>(IncidentesService);
    jest.clearAllMocks();
  });

  it('crea un incidente y publica a recursos', async () => {
    const saveMock = jest.fn().mockResolvedValue({
      _id: 'id123',
      tipo: 'incendio',
      prioridad: 'alta',
      latitude: 10,
      longitude: 10,
      timestamp: new Date(),
      recursos_asignados: ['bomberos'],
    });
    mockIncidenteModel.constructor = jest.fn().mockReturnValue({ save: saveMock });
    // Simula new this.incidenteModel()
    (service as any).incidenteModel = function(args) {
      return { ...args, save: saveMock };
    };

    const dto = {
      from: '1', wa_id: '1', name: 'n', message_id: 'mid', timestamp: new Date(),
      text: 'incendio', tipo: 'incendio',
    };

    const result = await service.createIncidente(dto as any);
    expect(result).toBeDefined();
    expect(mockClasificacionService.calcularPrioridad).toHaveBeenCalled();
    expect(mockAmqpConnection.publish).toHaveBeenCalled();
  });

  it('findAll debe retornar lista de incidentes', async () => {
    mockIncidenteModel.exec.mockResolvedValue([{ id: 1 }]);
    const items = await service.findAll();
    expect(items).toEqual([{ id: 1 }]);
    expect(mockIncidenteModel.find).toHaveBeenCalled();
  });

  it('findByFiltro filtra correctamente', async () => {
    mockIncidenteModel.exec.mockResolvedValue([{ id: 2 }]);
    const items = await service.findByFiltro({ estado: 'pendiente' });
    expect(items).toEqual([{ id: 2 }]);
    expect(mockIncidenteModel.find).toHaveBeenCalledWith({ estado: 'pendiente' });
  });

  it('findByTipo y findByEstado funcionan', async () => {
    mockIncidenteModel.exec.mockResolvedValue([{ id: 3 }]);
    await service.findByTipo('incendio');
    expect(mockIncidenteModel.find).toHaveBeenCalledWith({ tipo: 'incendio' });
    await service.findByEstado('pendiente');
    expect(mockIncidenteModel.find).toHaveBeenCalledWith({ estado: 'pendiente' });
  });

  it('findOne retorna incidente por id', async () => {
    mockIncidenteModel.findById.mockReturnValue({ exec: () => Promise.resolve({ id: 'X' }) });
    const found = await service.findOne('X');
    expect(found).toEqual({ id: 'X' });
  });

  it('updateIncidente actualiza y publica cambio si cambia estado', async () => {
    const updated = { _id: 'id1', estado: 'resuelto', recursos_asignados: ['bomberos'] };
    mockIncidenteModel.findByIdAndUpdate.mockReturnValue({
      exec: () => Promise.resolve(updated)
    });
    const result = await service.updateIncidente('id1', { estado: 'resuelto' });
    expect(result).toEqual(updated);
    expect(mockAmqpConnection.publish).toHaveBeenCalled();
  });

  it('updateIncidente retorna null si no encuentra', async () => {
    mockIncidenteModel.findByIdAndUpdate.mockReturnValue({
      exec: () => Promise.resolve(null)
    });
    const result = await service.updateIncidente('id_no', { estado: 'x' });
    expect(result).toBeNull();
  });
});