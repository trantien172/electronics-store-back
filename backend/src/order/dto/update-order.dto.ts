import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsNotEmpty()
  @IsOptional()
  @IsEnum(['pending', 'paid', 'shipped', 'completed', 'cancelled'])
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
}