import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IncidentesService } from './incidentes.service';
import { IncidentesController } from './incidentes.controller';
import { Incidente, IncidenteSchema } from '../schemas/incidente.schema';
import { ClasificacionService } from '../services/clasificacion.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Incidente.name, schema: IncidenteSchema }
    ]),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'emergencias',
            type: 'direct',
          },
          {
            name: 'recursos',
            type: 'direct',
          },
        ],
        uri: configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [IncidentesController],
  providers: [IncidentesService, ClasificacionService],
  exports: [IncidentesService],
})
export class IncidentesModule {}