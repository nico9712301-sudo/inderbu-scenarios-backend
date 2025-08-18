import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { IUserApplicationPort } from 'src/core/application/ports/inbound/user-application.port';
import { UserResponseMapper } from 'src/infrastructure/mappers/user/user-response.mapper';
import { ResendConfirmationDto } from '../../dtos/user/resend-confirmation-request.dto';
import { UserWithRelationsDto } from '../../dtos/user/user-with-relations.dto';
import { UserResponseDto } from '../../dtos/user/create-user-response.dto';
import { CreateUserDto } from '../../dtos/user/create-user-request.dto';
import { UpdateUserDto } from '../../dtos/user/update-user.dto';
import { UserPageOptionsDto } from '../../dtos/user/user-page-options.dto';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { PageOptionsDto } from '../../dtos/common/page-options.dto';
import { PageDto } from '../../dtos/common/page.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(
    @Inject(APPLICATION_PORTS.USER)
    private readonly userApplicationService: IUserApplicationPort,
  ) {}

  @Get('/:userId/reservations')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all reservations for a given user' })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any /*ReservationResponseDto[]*/> {
    //   return this.reservationService.getReservationsByUser(userId);
    return null as unknown as any;
  }

  @Get('confirm')
  @HttpCode(200)
  async confirmEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    return this.userApplicationService.confirmUser(token);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista paginada de usuarios con relaciones y filtros avanzados',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Tamaño de página',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Búsqueda por nombre, email o dni',
  })
  @ApiQuery({
    name: 'roleId',
    required: false,
    type: [Number],
    description: 'Filtrar por ID de rol',
  })
  @ApiQuery({
    name: 'neighborhoodId',
    required: false,
    type: Number,
    description: 'Filtrar por ID de barrio',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo/inactivo',
  })
  @ApiResponse({ status: 200, type: PageDto })
  async getAllUsers(
    @Query() pageOptionsDto: UserPageOptionsDto,
  ): Promise<PageDto<UserWithRelationsDto>> {
    return this.userApplicationService.getAllUsers(pageOptionsDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtiene un usuario específico por ID con sus relaciones',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, type: UserWithRelationsDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserWithRelationsDto> {
    try {
      return await this.userApplicationService.getUserById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  @Post()
  @ApiOperation({
    summary:
      'Crea un nuevo usuario (validando contraseña y datos obligatorios)',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  @ApiBody({ description: 'Datos del usuario a crear', type: CreateUserDto })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const userDomain =
      await this.userApplicationService.createUser(createUserDto);
      console.log('userDomain', userDomain);
      
    const userDto: UserResponseDto =  UserResponseMapper.toDto(userDomain);
    console.log('userDto', userDto);
    return userDto;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualiza un usuario existente',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del usuario a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserWithRelationsDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBody({
    description: 'Datos del usuario a actualizar',
    type: UpdateUserDto,
  })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserWithRelationsDto> {
    try {
      return await this.userApplicationService.updateUser(id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  @Post('resend-confirmation')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reenviar token de confirmación por email' })
  @ApiResponse({ status: 200, description: 'Enlace reenviado' })
  @ApiBody({ type: ResendConfirmationDto })
  async resendConfirmation(
    @Body() { email }: ResendConfirmationDto,
  ): Promise<{ message: string }> {
    return this.userApplicationService.resendConfirmation(email);
  }

}
