import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UserDomainEntity } from '../../domain/entities/user.domain-entity';
import { IUserApplicationPort } from '../ports/inbound/user-application.port';
import { APPLICATION_PORTS } from '../tokens/ports';

@Injectable()
export class AuthApplicationService {
  constructor(
    @Inject(APPLICATION_PORTS.USER)
    private readonly userApplicationService: IUserApplicationPort,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDomainEntity | null> {
    const user = await this.userApplicationService.findByEmail(email);
    if (user && (await user.validatePassword(password, bcrypt))) {
      return user;
    }
    return null;
  }

  login(user: UserDomainEntity): {
    access_token: string;
    refresh_token: string;
  } {
    const payload = { email: user.email, sub: user.id, role: user.roleId };
    const refreshPayload = { sub: user.id, type: 'refresh' };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15000d' }), // Token de acceso con duración maxima
      refresh_token: this.jwtService.sign(refreshPayload, { expiresIn: '7d' }), // Refresh token con duración larga
    };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      // Verificar que es un refresh token válido
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Obtener el usuario para generar un nuevo token
      const user = await this.userApplicationService.findById(decoded.sub);
      if (!user) {
        throw new Error('User not found');
      }
      console.log('it got here');
      // Generar nuevos tokens
      return this.login(user);
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async getCurrentUser(userId: number): Promise<UserDomainEntity | null> {
    return this.userApplicationService.findById(userId);
  }
}
