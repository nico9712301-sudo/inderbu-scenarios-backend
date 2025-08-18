import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import {
  AuthTokensDto,
  UserDto,
  RefreshTokenDto,
} from '../dtos/auth/auth-response.dto';
import { AuthApplicationService } from 'src/core/application/services/auth.service';
import { UserDomainEntity } from 'src/core/domain/entities/user.domain-entity';
import { LoginDto } from '../dtos/auth/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthApplicationService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Inicia sesión con correo electrónico y contraseña',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    type: AuthTokensDto,
  })
  @ApiBody({
    description: 'Credenciales de inicio de sesión',
    type: LoginDto,
  })
  async login(@Body() body: LoginDto): Promise<AuthTokensDto> {
    const user: UserDomainEntity | null = await this.authService.validateUser(
      body.email,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renueva el token de acceso usando el refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado exitosamente',
    type: AuthTokensDto,
  })
  @ApiBody({
    description: 'Refresh token para renovación',
    type: RefreshTokenDto,
  })
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthTokensDto> {
    console.log('Refreshing token with body:', body);
    return await this.authService.refreshToken(body.refresh_token);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Obtiene la información del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario obtenida exitosamente',
    type: UserDto,
  })
  async getCurrentUser(@Request() req: any): Promise<UserDto> {
    const user = await this.authService.getCurrentUser(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return UserDto.fromDomainEntity(user);
  }

  // Endpoint protegido que requiere un JWT válido (mantener para compatibilidad)
  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Obtiene el perfil del usuario (deprecated - usar /me)',
  })
  getProfile(@Request() req: any) {
    return req.user;
  }
}
