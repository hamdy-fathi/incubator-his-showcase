import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncubatorController } from './incubator.controller';
import { IncubatorService } from './incubator.service';
import { IncubatorGateway } from './incubator.gateway';
import { IncubatorData } from './incubator.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([IncubatorData]), AuthModule],
  controllers: [IncubatorController],
  providers: [IncubatorService, IncubatorGateway],
})
export class IncubatorModule {}
