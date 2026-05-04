import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEnum(UserRole)
  role: UserRole;
}
