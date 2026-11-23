import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-product.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { UpdateOldProductDto } from './dto/update-old-product.dto';
import { CreateOldProductDto } from './dto/create-old-product.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productsService: ProductService
  ) { }

  @Get()
  async findAll(@Query() query: FilterProductsDto) {
    return await this.productsService.filterProducts(query, '');
  }

  @Get('services') findServices() { return this.productsService.findPublicServices(); }
  @Get('services/:id') findService(@Param('id', ParseIntPipe) id: number) { return this.productsService.findPublicService(id); }
  @Get('old/:id') findOld(@Param('id', ParseIntPipe) id: number) { return this.productsService.findOldProduct(id); }

  /**
   * API: Xem chi tiết một sản phẩm
   * Dành cho: Tất cả mọi người
   * GET /products/5
   */
  

  /**
   * API: Thêm sản phẩm mới (Máy mới/cũ, linh kiện)
   * Dành cho: Chủ cửa hàng (Owner) hoặc Admin
   * POST /products
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('OWNER', 'ADMIN')
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  /**
   * API: Cập nhật thông tin sản phẩm hoặc tồn kho
   * Dành cho: Chủ cửa hàng hoặc Admin
   * PATCH /products/5
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('OWNER', 'ADMIN')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  /**
   * API: Xóa sản phẩm
   * Dành cho: Admin
   * DELETE /products/5
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.remove(id);
  }

  /**
   * API: Kiểm tra nhanh tình trạng tồn kho
   * Thường dùng cho trang đặt hàng nhanh hoặc giỏ hàng
   * GET /products/5/stock?quantity=2
   */
  @Get(':id/stock')
  async checkStock(
    @Param('id', ParseIntPipe) id: number,
    @Query('quantity', ParseIntPipe) quantity: number
  ) {
    const isAvailable = await this.productsService.checkStock(id, quantity);
    return { id, isAvailable, requestedQuantity: quantity };
  }

  //Old product
  @UseGuards(JwtAuthGuard, RoleGuard) @Roles('OWNER', 'ADMIN')
  @Post('old')
  async createOld(@Body() dto: CreateOldProductDto) {
    // Trả về dữ liệu OldProduct đã liên kết thành công hoặc báo lỗi 404/400
    return await this.productsService.createOldProduct(dto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard) @Roles('OWNER', 'ADMIN')
  @Patch('old/:id')
  async updateOld(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOldProductDto
  ) {
    return await this.productsService.updateOldProduct(id, dto);
  }

  @Get('brand')
  getAllBrand() {
    return this.productsService.getAllBrand();
  }

  @Get('brand/:id')
  getOneBrand(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOneBrand(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard) @Roles('OWNER', 'ADMIN')
  @Post('brand')
  createBrand(@Body() dto: CreateBrandDto) {
    return this.productsService.createBrand(dto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard) @Roles('OWNER', 'ADMIN')
  @Patch('brand/:id')
  updateBrand(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
    return this.productsService.updateBrand(id, dto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard) @Roles('OWNER', 'ADMIN')
  @Delete('brand/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteBrand(id);
  }

  // Category
  // Đặt trước các route product để tránh conflict
  @Get('category')
  getAllCategories() {
    return this.productsService.getAllCategories();
  }

  @Get('category/:id')
  getOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOneCategory(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard) @Roles('OWNER', 'ADMIN')
  @Post('category')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.productsService.createCategory(dto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard) @Roles('OWNER', 'ADMIN')
  @Patch('category/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.productsService.updateCategory(id, dto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard) @Roles('OWNER', 'ADMIN')
  @Delete('category/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteCategory(id);
  }

@Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.findOneProduct(id);
  }
}
