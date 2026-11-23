import { PartialType } from '@nestjs/mapped-types';
import { CreateOldProductDto } from './create-old-product.dto';

export class UpdateOldProductDto extends PartialType(CreateOldProductDto) {}
