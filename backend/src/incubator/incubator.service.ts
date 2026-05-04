import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncubatorData } from './incubator.entity';
import { CreateReadingDto } from './dto/create-reading.dto';

export interface IncubatorSettings {
  targetTemperature: number;
  targetHumidity: number;
}

@Injectable()
export class IncubatorService {
  private settings: IncubatorSettings = {
    targetTemperature: 37.0,
    targetHumidity: 55,
  };

  constructor(
    @InjectRepository(IncubatorData)
    private readonly incubatorRepository: Repository<IncubatorData>,
  ) {}

  async createReading(dto: CreateReadingDto): Promise<IncubatorData> {
    const reading = this.incubatorRepository.create(dto);
    return this.incubatorRepository.save(reading);
  }

  async getLatest(): Promise<IncubatorData | null> {
    return this.incubatorRepository.findOne({
      where: {},
      order: { timestamp: 'DESC' },
    });
  }

  async getHistory(limit = 100): Promise<IncubatorData[]> {
    return this.incubatorRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  getSettings(): IncubatorSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<IncubatorSettings>): IncubatorSettings {
    if (settings.targetTemperature !== undefined) {
      this.settings.targetTemperature = settings.targetTemperature;
    }
    if (settings.targetHumidity !== undefined) {
      this.settings.targetHumidity = settings.targetHumidity;
    }
    return { ...this.settings };
  }

  getStatus(temperature: number): {
    status: 'normal' | 'warning' | 'critical';
    message: string;
  } {
    if (temperature > 38.5 || temperature < 35.5) {
      return {
        status: 'critical',
        message:
          temperature > 38.5
            ? `CRITICAL: Temperature too high (${temperature}°C)`
            : `CRITICAL: Temperature too low (${temperature}°C)`,
      };
    }
    if (temperature > 38 || temperature < 36) {
      return {
        status: 'warning',
        message:
          temperature > 38
            ? `WARNING: Temperature elevated (${temperature}°C)`
            : `WARNING: Temperature low (${temperature}°C)`,
      };
    }
    return { status: 'normal', message: 'All vitals normal' };
  }
}
