import { IsNumber, Min, Max } from 'class-validator';

export class CreateReadingDto {
  @IsNumber()
  @Min(35.0)
  @Max(39.5)
  temperature: number;

  @IsNumber()
  @Min(40)
  @Max(80)
  humidity: number;
}
