import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationApplicationPort } from '../../../../../core/application/ports/inbound/notification-application.port';
import {
  CreateNotificationDto,
  NotificationResponseDto,
  MarkAsReadDto,
  NotificationTypeDto,
} from '../dtos/notifications';
import { APPLICATION_PORTS } from '../../../../providers/billing/application-ports';
import { Inject } from '@nestjs/common';

@ApiTags('Notifications')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/notifications')
export class NotificationController {
  constructor(
    @Inject(APPLICATION_PORTS.NOTIFICATION)
    private readonly notificationService: NotificationApplicationPort,
  ) {}

  @Post()
  // @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createNotification(
    @Body() createDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    try {
      const result = await this.notificationService.createNotification({
        type: createDto.type as any,
        title: createDto.title,
        message: createDto.message,
        reservationId: createDto.reservationId,
        metadata: createDto.metadata,
      });

      return this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Notification found',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotificationById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationResponseDto> {
    const result = await this.notificationService.getNotificationById(id);

    if (!result) {
      throw new NotFoundException('Notification not found');
    }

    return this.mapToResponseDto(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications with pagination' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async getAllNotifications(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: NotificationResponseDto[]; total: number; page: number; limit: number }> {
    const result = await this.notificationService.getAllNotifications(page, limit);

    return {
      data: result.data.map(notification => this.mapToResponseDto(notification)),
      total: result.total,
      page,
      limit,
    };
  }

  @Get('unread/all')
  @ApiOperation({ summary: 'Get all unread notifications' })
  @ApiResponse({ status: 200, description: 'List of unread notifications' })
  async getUnreadNotifications(): Promise<NotificationResponseDto[]> {
    const results = await this.notificationService.getUnreadNotifications();
    return results.map(notification => this.mapToResponseDto(notification));
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get notifications by type' })
  @ApiParam({ name: 'type', enum: NotificationTypeDto })
  @ApiResponse({ status: 200, description: 'List of notifications by type' })
  async getNotificationsByType(
    @Param('type') type: NotificationTypeDto,
  ): Promise<NotificationResponseDto[]> {
    const results = await this.notificationService.getNotificationsByType(type as any);
    return results.map(notification => this.mapToResponseDto(notification));
  }

  @Get('reservation/:reservationId')
  @ApiOperation({ summary: 'Get notifications for a reservation' })
  @ApiParam({ name: 'reservationId', type: 'number' })
  @ApiResponse({ status: 200, description: 'List of notifications for reservation' })
  async getNotificationsByReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
  ): Promise<NotificationResponseDto[]> {
    const results = await this.notificationService.getNotificationsByReservation(reservationId);
    return results.map(notification => this.mapToResponseDto(notification));
  }

  @Get('recent/:hours')
  @ApiOperation({ summary: 'Get recent notifications' })
  @ApiParam({ name: 'hours', type: 'number', example: 24 })
  @ApiResponse({ status: 200, description: 'List of recent notifications' })
  async getRecentNotifications(
    @Param('hours', ParseIntPipe) hours: number,
  ): Promise<NotificationResponseDto[]> {
    const results = await this.notificationService.getRecentNotifications(hours);
    return results.map(notification => this.mapToResponseDto(notification));
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: NotificationResponseDto })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationResponseDto> {
    try {
      const result = await this.notificationService.markAsRead(id);

      if (!result) {
        throw new NotFoundException('Notification not found');
      }

      return this.mapToResponseDto(result);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Put('read/multiple')
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiResponse({ status: 200, description: 'Number of notifications marked as read' })
  async markMultipleAsRead(
    @Body() markAsReadDto: MarkAsReadDto,
  ): Promise<{ count: number }> {
    try {
      const count = await this.notificationService.markMultipleAsRead(markAsReadDto.ids);
      return { count };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Count unread notifications' })
  @ApiResponse({ status: 200, description: 'Number of unread notifications' })
  async countUnreadNotifications(): Promise<{ count: number }> {
    const count = await this.notificationService.countUnreadNotifications();
    return { count };
  }

  @Delete(':id')
  // @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const success = await this.notificationService.deleteNotification(id);

    if (!success) {
      throw new NotFoundException('Notification not found or could not be deleted');
    }
  }

  @Delete('old/:days')
  // @Roles('admin')
  @ApiOperation({ summary: 'Delete old read notifications' })
  @ApiParam({ name: 'days', type: 'number', example: 30 })
  @ApiResponse({ status: 200, description: 'Number of notifications deleted' })
  async deleteOldReadNotifications(
    @Param('days', ParseIntPipe) days: number,
  ): Promise<{ deleted: number }> {
    const deleted = await this.notificationService.deleteOldReadNotifications(days);
    return { deleted };
  }

  @Get('statistics/overview')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Notification statistics' })
  async getNotificationStatistics() {
    return await this.notificationService.getNotificationStatistics();
  }

  private mapToResponseDto(entity: any): NotificationResponseDto {
    return {
      id: entity.id!,
      type: entity.type as any,
      title: entity.title,
      message: entity.message,
      reservationId: entity.fkReservationId,
      paymentProofId: entity.fkPaymentProofId,
      receiptId: entity.fkReceiptId,
      isRead: entity.isRead,
      readAt: entity.readAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

