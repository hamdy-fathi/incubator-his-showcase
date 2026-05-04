import { Injectable, UnauthorizedException, ConflictException, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /** Seed default admin on first startup */
  async onModuleInit() {
    const adminExists = await this.userRepo.findOne({
      where: { email: 'admin@hospital.com' },
    });
    if (!adminExists) {
      const hashed = await bcrypt.hash('admin123', 10);
      await this.userRepo.save({
        email: 'admin@hospital.com',
        password: hashed,
        fullName: 'System Admin',
        role: UserRole.ADMIN,
      });
      this.logger.log('🔑 Default admin seeded: admin@hospital.com / admin123');
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      ...dto,
      password: hashed,
    });
    const saved = await this.userRepo.save(user);

    return {
      id: saved.id,
      email: saved.email,
      fullName: saved.fullName,
      role: saved.role,
    };
  }

  async findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }
}
