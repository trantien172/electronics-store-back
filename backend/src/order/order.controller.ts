import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../user/enum/role.enum';

@Controller('order')
@UseGuards(JwtAuthGuard, RoleGuard)
export class OrderController {
  constructor(private readonly ordersService: OrderService) {}

  // POST /orders
  @Post()
  @Roles(Role.ADMIN, Role.OWNER, Role.CLIENT)
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // GET /orders?status=&userId=
  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.WORKER)
  findAll(
    @Query('status') status?: string,
    @Query('userId') userId?: number,
  ) {
    return this.ordersService.findAll(status, userId);
  }

  // GET /orders/stats
  @Get('stats')
  @Roles(Role.OWNER, Role.ADMIN)
  getStats() {
    return this.ordersService.getStats();
  }

  // GET /orders/my — Client xem đơn hàng của mình
  @Get('my')
  @Roles(Role.CLIENT)
  findMine(@Request() req) {
    return this.ordersService.findByUser(req.user.userId);
  }

  // GET /orders/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // PATCH /orders/:id/status
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.OWNER, Role.WORKER)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  // ─── Order Items ──────────────────────────────────────────────────────────────

  // GET /orders/:id/items
  @Get(':id/items')
  getItems(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getItems(id);
  }

  // POST /orders/:id/items
  @Post(':id/items')
  @Roles(Role.ADMIN, Role.OWNER, Role.CLIENT)
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateOrderItemDto,
  ) {
    return this.ordersService.addItem(id, dto);
  }

  // PATCH /orders/:id/items/:itemId
  @Patch(':id/items/:itemId')
  @Roles(Role.ADMIN, Role.OWNER)
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateItem(id, itemId, dto);
  }

  // DELETE /orders/:id/items/:itemId
  @Delete(':id/items/:itemId')
  @Roles(Role.ADMIN, Role.OWNER)
  removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.ordersService.removeItem(id, itemId);
  }
}