import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Logger,
  Patch,
} from '@nestjs/common';
import { IncubatorService } from './incubator.service';
import { IncubatorGateway } from './incubator.gateway';
import { CreateReadingDto } from './dto/create-reading.dto';
import { ApiKeyGuard } from '../auth/auth.guard';

@Controller('api/incubator')
export class IncubatorController {
  private readonly logger = new Logger(IncubatorController.name);

  constructor(
    private readonly incubatorService: IncubatorService,
    private readonly incubatorGateway: IncubatorGateway,
  ) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  async createReading(@Body() dto: CreateReadingDto) {
    this.logger.log(
      `Received reading: temp=${dto.temperature}°C, humidity=${dto.humidity}%`,
    );

    const reading = await this.incubatorService.createReading(dto);
    const status = this.incubatorService.getStatus(reading.temperature);

    // Broadcast to all connected WebSocket clients
    this.incubatorGateway.broadcastReading({
      reading: reading as unknown as Record<string, unknown>,
      status,
    });

    return {
      success: true,
      data: reading,
      status,
    };
  }

  @Get('latest')
  async getLatest() {
    const reading = await this.incubatorService.getLatest();
    if (!reading) {
      return { success: true, data: null, status: null };
    }
    const status = this.incubatorService.getStatus(reading.temperature);
    return {
      success: true,
      data: reading,
      status,
    };
  }

  @Get('history')
  async getHistory(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    const readings = await this.incubatorService.getHistory(parsedLimit);
    return {
      success: true,
      data: readings,
      count: readings.length,
    };
  }

  @Get('settings')
  getSettings() {
    return {
      success: true,
      data: this.incubatorService.getSettings(),
    };
  }

  @Patch('settings')
  @UseGuards(ApiKeyGuard)
  updateSettings(
    @Body() body: { targetTemperature?: number; targetHumidity?: number },
  ) {
    const settings = this.incubatorService.updateSettings(body);
    this.incubatorGateway.broadcastSettings(
      settings as unknown as Record<string, unknown>,
    );
    return {
      success: true,
      data: settings,
    };
  }
}
