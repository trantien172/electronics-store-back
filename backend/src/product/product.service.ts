import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entity/Product.entity'
import { In, Repository } from 'typeorm'
import { FilterProductsDto } from './dto/filter-product.dto';
import { Category } from './entity/Category.entity'
import { Brand } from './entity/Brand.entity'
import { Service } from './entity/Service.entity'
import { OldProduct } from './entity/OldProduct.entity';
import { CreateOldProductDto } from './dto/create-old-product.dto';
import { UpdateOldProductDto } from './dto/update-old-product.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Service) private serviceRepo: Repository<Service>,
    @InjectRepository(OldProduct) private oldProductRepo: Repository<OldProduct>,

  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productRepo.create(createProductDto as any);
    return await this.productRepo.save(newProduct as any);
  }

  async filterProducts(attribute: FilterProductsDto, role: string): Promise<any> {
    const qb = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brands', 'brand')
      .leftJoinAndSelect('product.oldProducts', 'oldProduct')
      .where('product.isActive = :active', { active: true })
      .andWhere('NOT EXISTS (SELECT 1 FROM service_product sp WHERE sp.product_id = product.id)');
    if (attribute.name) qb.andWhere('(product.name LIKE :term OR product.model LIKE :term)', { term: `%${attribute.name}%` });
    if (attribute.model) qb.andWhere('product.model LIKE :model', { model: `%${attribute.model}%` });
    if (attribute.manufactureYear) qb.andWhere('product.manufactureYear = :year', { year: attribute.manufactureYear });
    if (attribute.categoryId?.length) qb.andWhere('category.id IN (:...categoryIds)', { categoryIds: attribute.categoryId });
    if (attribute.brandsId?.length) qb.andWhere('brand.id IN (:...brandIds)', { brandIds: attribute.brandsId });
    if (attribute.minSellingPrice !== undefined) qb.andWhere('product.sellingPrice >= :minPrice', { minPrice: attribute.minSellingPrice });
    if (attribute.maxSellingPrice !== undefined) qb.andWhere('product.sellingPrice <= :maxPrice', { maxPrice: attribute.maxSellingPrice });
    if (attribute.type === 'new') qb.andWhere('oldProduct.id IS NULL');
    if (attribute.type === 'old') qb.andWhere('oldProduct.id IS NOT NULL');
    if (attribute.oldProductStatus) qb.andWhere('oldProduct.status = :oldStatus', { oldStatus: attribute.oldProductStatus });
    if (attribute.conditionStatus) qb.andWhere('oldProduct.conditionStatus = :condition', { condition: attribute.conditionStatus });
    const page = Math.max(1, Number(attribute.page || 1));
    const limit = Math.min(100, Math.max(1, Number(attribute.limit || attribute.quantity || 20)));
    qb.orderBy('product.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    // Legacy filtering implementation retained below for readable migration context.
    const {
      name,
      brandsId, // Giả định đây là mảng các ID hoặc tên brand
      manufactureYear,
      categoryId,
      isActive,
      model,
      maxBasePrice,
      minBasePrice,
      maxSellingPrice,
      minSellingPrice,
      quantity,
      type,
      oldProductStatus,
      conditionStatus

    } = attribute;

    const qbProducts = this.productRepo.createQueryBuilder('product');
    // 1. Join các bảng liên quan để có thể lọc và lấy dữ liệu
    // Theo ERD: product có category (n-1) và brands (n-n)
    qbProducts.leftJoin('product.category', 'category');
    qbProducts.leftJoin('product.brands', 'brand');


    // 2. Lọc theo các điều kiện cơ bản


    if (name) {
      qbProducts.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }

    if (model) {
      qbProducts.andWhere('product.model LIKE :model', { model: `%${model}%` });
    }

    if (manufactureYear) {
      qbProducts.andWhere('product.manufactureYear = :year', { year: manufactureYear });
    }

    if (isActive !== undefined) {
      qbProducts.andWhere('product.isActive = :isActive', { isActive });
    }

    // 3. Lọc theo khoảng giá (Dựa trên base_price trong ERD)
    if (minSellingPrice) {
      qbProducts.andWhere('product.sellingPrice >= :minSellingPrice', { minSellingPrice });
    }
    if (maxSellingPrice) {
      qbProducts.andWhere('product.sellingPrice <= :maxSellingPrice', { maxSellingPrice });
    }
    if (minBasePrice) {
      qbProducts.andWhere('product.basePrice >= :minBasePrice', { minBasePrice });
    }
    if (maxBasePrice) {
      qbProducts.andWhere('product.basePrice <= :maxBasePrice', { maxBasePrice });
    }
    // 4. Lọc theo Category (Sử dụng ID hoặc Name)
    if (categoryId) {
      qbProducts.andWhere('category.categoryId = :categoryName', { categoryName: categoryId });
    }

    // 5. Lọc theo Brands (Quan hệ n-n)
    if (brandsId?.length) {
      // Nếu brands là mảng các ID: [1, 2, 3]
      qbProducts.andWhere('brand.brandId IN (:...brandIds)', { brandsId });
    }

    // Phân loại cũ mới
    if (type == "old") {
      qbProducts.innerJoin('product.oldProducts', 'oldProduct');
      if (oldProductStatus)
        qbProducts.andWhere('oldProduct.status = :oldProductStatus', { oldProductStatus });
      if (conditionStatus)
        qbProducts.andWhere('oldProduct.conditionStatus = :conditionStatus', { conditionStatus });
    }
    if (type == "both") {
      const conditions: string[] = [];
      const params: Record<string, any> = {};

      if (oldProductStatus) {
        conditions.push('oldProduct.status = :oldProductStatus');
        params.oldProductStatus = oldProductStatus;
      }

      if (conditionStatus) {
        conditions.push('oldProduct.conditionStatus = :conditionStatus');
        params.conditionStatus = conditionStatus;
      }

      const condition = conditions.length ? conditions.join(' AND ') : undefined;

      qbProducts.leftJoin(
        'product.oldProducts',
        'oldProduct',
        condition,
        params
      );

    }
    // 6. Giới hạn số lượng kết quả (quantity)
    if (quantity) {
      qbProducts.take(quantity);
    } else
      qbProducts.take(10);


    qbProducts.select([
      'product.productId',
      'product.name',
      'product.sellingPrice',
      'product.manufactureYear',
      'product.model',
      'brand.name',
      'category.name',
    ])
    if (type !== "new")
      qbProducts.addSelect([
        'oldProduct.oldProductId',
        'oldProduct.conditionStatus',
        'oldProduct.sellingPrice',
        'oldProduct.warrantyMonths',
      ])
    if (role == "shop_owner" || role == "admin") {
      qbProducts.addSelect([
        'product.basePrice',
        'product.isActive',
        'product.stock',
      ])
      if (type !== "new")
        qbProducts.addSelect([
          'oldProduct.serialNumber',
          'oldProduct.status',
          'oldProduct.createdAt'
        ])
    }
    if (role == "admin") {
      qbProducts.addSelect([
        'product.createdAt',
        'product.updatedAt',

      ]);
      if (type !== "new")
        qbProducts.addSelect([
          'oldProduct.updatedAt'
        ]);

    }
    qbProducts.orderBy('product.created_at', 'DESC');

    return await qbProducts.getMany();
  }

  async findOneProduct(id: number): Promise<Product> {
    const isServicePart = await this.productRepo.manager.query('SELECT 1 FROM service_product WHERE product_id=? LIMIT 1', [id]);
    if (isServicePart.length) throw new NotFoundException(`Product #${id} is a service component and is not publicly listed`);
    const product = await this.productRepo.findOne({ where: { id, isActive: true }, relations: { category: true, brands: true, oldProducts: true } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async findPublicServices() { return this.serviceRepo.find({ relations: { category: true }, order: { name: 'ASC' } }); }
  async findPublicService(id: number) {
    const service = await this.serviceRepo.findOne({ where: { id }, relations: { category: true } });
    if (!service) throw new NotFoundException(`Service #${id} not found`);
    return service;
  }
  async findOldProduct(id: number) {
    const row = await this.oldProductRepo.findOne({ where: { id }, relations: { product: { category: true, brands: true } } });
    if (!row) throw new NotFoundException(`Used product #${id} not found`);
    return { id: row.id, name: row.product.name, model: row.product.model, manufactureYear: row.product.manufactureYear, sellingPrice: row.sellingPrice, warrantyMonths: row.warrantyMonths, status: row.status, conditionStatus: row.conditionStatus, note: row.note, category: row.product.category, brands: row.product.brands, product: row.product };
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    // 1. Kiểm tra sản phẩm có tồn tại hay không trước khi cập nhật
    const product = await this.productRepo.findOne({
      where: { id }
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID ${id} không tồn tại`);
    }

    // 2. Hợp nhất dữ liệu cũ và dữ liệu mới từ DTO
    // TypeORM sẽ tự động nhận diện các thay đổi
    const updatedProduct = this.productRepo.merge(product, updateProductDto as any);

    // 3. Lưu vào database
    return await this.productRepo.save(updatedProduct);
  }

  async remove(id: number): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID ${id} không tồn tại`);
    }

    // Thay vì xóa bản ghi, ta chỉ cập nhật trạng thái hoạt động
    product.isActive = false;
    await this.productRepo.save(product);
  }

  async checkStock(id: number, quantityNeeded: number) {
    // 1. Tìm sản phẩm trong DB (chỉ lấy cột quantity để tối ưu performance)
    const product = await this.productRepo.findOne({
      where: { id },
      select: ['id', 'name', 'quantity', 'isActive']
    });

    // 2. Nếu không tìm thấy sản phẩm
    if (!product) {
      throw new NotFoundException(`Sản phẩm mã số ${id} không tồn tại trong hệ thống.`);
    }

    // 3. Nếu sản phẩm đã bị ngừng kinh doanh (is_active = false)
    if (!product.isActive) {
      throw new BadRequestException(`Sản phẩm "${product.name}" hiện đã ngừng kinh doanh.`);
    }

    // 4. So sánh số lượng
    const hasEnough = product.quantity || 0 >= quantityNeeded;

    return {
      productId: id,
      productName: product.name,
      hasEnough: hasEnough,
      availableQuantity: product.quantity,
      requestedQuantity: quantityNeeded,
      message: hasEnough
        ? 'Đủ hàng trong kho'
        : `Không đủ hàng. Trong kho còn ${product.quantity}, thiếu ${quantityNeeded - (product.quantity || 0)}`
    };
  }

  //Old Product
  async createOldProduct(dto: CreateOldProductDto): Promise<OldProduct> {
    // 1. Kiểm tra xem Product gốc có tồn tại trong DB không
    const existingProduct = await this.productRepo.findOne({
      where: { id: dto.productId },
    });

    // 2. Nếu không có Product đó, báo lỗi và dừng thao tác ngay lập tức
    if (!existingProduct) {
      throw new NotFoundException(
        `Thêm thất bại: Không tìm thấy sản phẩm gốc với mã ID ${dto.productId}. Vui lòng tạo sản phẩm trước.`
      );
    }

    // 4. Tiến hành tạo bản ghi máy cũ liên kết với Product đã tìm thấy
    const newOldProduct = this.oldProductRepo.create(dto as any);

    // 5. Lưu và trả về kết quả
    return await this.oldProductRepo.save(newOldProduct as any);
  }

  async updateOldProduct(id: number, updateOldProductDto: UpdateOldProductDto): Promise<OldProduct> {
    // 1. Kiểm tra sản phẩm có tồn tại hay không trước khi cập nhật
    const product = await this.oldProductRepo.findOne({
      where: { id }
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID ${id} không tồn tại`);
    }

    // 2. Hợp nhất dữ liệu cũ và dữ liệu mới từ DTO
    // TypeORM sẽ tự động nhận diện các thay đổi
    const updatedProduct = this.oldProductRepo.merge(product, updateOldProductDto as any);

    // 3. Lưu vào database
    return await this.productRepo.save(updatedProduct);
  }


  async getAllBrand(): Promise<Brand[]> {
    return await this.brandRepo.find();
  }

  async getOneBrand(id: number): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException(`Brand ${id} không tồn tại`);
    return brand;
  }

  async createBrand(dto: CreateBrandDto): Promise<Brand> {
    const existing = await this.brandRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Brand "${dto.name}" đã tồn tại`);

    const brand = this.brandRepo.create(dto);
    return await this.brandRepo.save(brand);
  }

  async updateBrand(brandId: number, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.getOneBrand(brandId);
    Object.assign(brand, dto);
    return await this.brandRepo.save(brand);
  }

  async deleteBrand(brandId: number): Promise<void> {
    const brand = await this.getOneBrand(brandId);
    await this.brandRepo.remove(brand);
  }
  async getCategories(): Promise<Category[]> {
    return await this.categoryRepo.find();
  }

  // category
  async getAllCategories(): Promise<Category[]> {
    return await this.categoryRepo.find({relations: ["services"]});
  }

  async getOneCategory(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category ${id} không tồn tại`);
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Category "${dto.name}" đã tồn tại`);

    const category = this.categoryRepo.create(dto);
    return await this.categoryRepo.save(category);
  }

  async updateCategory(categoryId: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.getOneCategory(categoryId);
    Object.assign(category, dto);
    return await this.categoryRepo.save(category);
  }

  async deleteCategory(categoryId: number): Promise<void> {
    const category = await this.getOneCategory(categoryId);
    await this.categoryRepo.remove(category);
  }

  // 1. TẠO MỚI SERVICE
  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    const { name, productIds, categoryId, description } = createServiceDto;

    // Kiểm tra trùng tên (Vì trường name có thuộc tính unique và index)
    const existedService = await this.serviceRepo.findOne({ where: { name } });
    if (existedService) {
      throw new ConflictException(`Service với tên "${name}" đã tồn tại!`);
    }

    // Tạo đối tượng instance mới
    const newService = this.serviceRepo.create({
      name,
      categoryId,
      description,
    });

    // Nếu có truyền mảng productIds lên, tiến hành tìm và gán quan hệ ManyToMany
    if (productIds && productIds.length > 0) {
      const products = await this.productRepo.findByIds(productIds);
      newService.products = products;
    }

    return await this.serviceRepo.save(newService);
  }

  // 2. LẤY TẤT CẢ SERVICES (Có phân trang cơ bản)
  async findAllService(): Promise<Service[]> {
    return await this.serviceRepo.find({
      relations: ['category', 'products'], // Tự động join để lấy thông tin Category và danh sách Products
      order: { createdAt: 'DESC' }, // Sắp xếp mới nhất lên đầu
    });
  }

  // 3. LẤY CHI TIẾT 1 SERVICE THEO ID
  async findOneService(id: number): Promise<Service> {
    const service = await this.serviceRepo.findOne({
      where: { id },
      relations: ['category', 'products'],
    });

    if (!service) {
      throw new NotFoundException(`Không tìm thấy Service với ID = ${id}`);
    }
    return service;
  }

  async updateService(id: number, updateServiceDto: UpdateServiceDto): Promise<Service | null> {
    const { name, productIds, ...restData } = updateServiceDto;

    // 1. Dùng QueryBuilder để kiểm tra Service có tồn tại hay không
    const service = await this.serviceRepo
      .createQueryBuilder('service')
      .where('service.id = :id', { id })
      .getOne();

    if (!service) {
      throw new NotFoundException(`Không tìm thấy Service với ID = ${id}`);
    }

    // 2. Nếu có đổi tên, dùng QueryBuilder check xem tên mới đã bị thằng khác lấy chưa
    if (name && name !== service.name) {
      const existedName = await this.serviceRepo
        .createQueryBuilder('service')
        .where('service.name = :name', { name })
        .getOne();

      if (existedName) {
        throw new ConflictException(`Tên dịch vụ "${name}" đã bị trùng!`);
      }
    }

    // 3. CẬP NHẬT CÁC TRƯỜNG CƠ BẢN (name, description, categoryId) BẰNG QUERY BUILDER
    // Gom tất cả các dữ liệu cần update vào một Object
    const updateData: any = { ...restData };
    if (name) updateData.name = name;

    // Chỉ thực hiện UPDATE nếu Object có dữ liệu để tránh chạy câu lệnh SQL rỗng
    if (Object.keys(updateData).length > 0) {
      await this.serviceRepo
        .createQueryBuilder()
        .update(Service)
        .set(updateData)
        .where('id = :id', { id })
        .execute();
    }

    // 4. XỬ LÝ QUAN HỆ MANY-TO-MANY (PRODUCTIDS) BẰNG .RELATION()
    if (productIds) {
      // Lấy danh sách các Product IDs hiện tại đang liên kết với Service này (để so sánh)
      const currentProductIds = await this.serviceRepo
        .createQueryBuilder()
        .relation(Service, 'products')
        .of(id)
        .loadMany<number>() // Trả về mảng các ID dạng [1, 2, 3]
        .then(products => products.map(p => (p as any).id));

      // Tìm ra những ID cần xóa: Có trong database cũ nhưng không có trong mảng productIds mới gửi lên
      const idsToRemove = currentProductIds.filter(pid => !productIds.includes(pid));

      // Tìm ra những ID cần thêm: Có trong mảng productIds mới gửi lên nhưng database cũ chưa có
      const idsToAdd = productIds.filter(pid => !currentProductIds.includes(pid));

      // Thực hiện xóa bớt liên kết cũ
      if (idsToRemove.length > 0) {
        await this.serviceRepo
          .createQueryBuilder()
          .relation(Service, 'products')
          .of(id)
          .remove(idsToRemove);
      }

      // Thực hiện thêm liên kết mới (Sửa luôn cái lỗi findByIds cũ bằng cách tìm bằng In)
      if (idsToAdd.length > 0) {
        const productsToAdd = await this.productRepo.findBy({ id: In(idsToAdd) });

        await this.serviceRepo
          .createQueryBuilder()
          .relation(Service, 'products')
          .of(id)
          .add(productsToAdd);
      }
    }

    // 5. Trả về dữ liệu mới nhất sau khi update kèm các quan hệ để khớp với kiểu Promise<Service>
    return await this.serviceRepo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.products', 'product')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.id = :id', { id })
      .getOne();
  }

  // 5. XÓA SERVICE
  async removeService(id: number): Promise<{ message: string }> {
    const service = await this.findOneService(id); // Kiểm tra tồn tại trước khi xóa

    // Khi xóa một Entity có quan hệ ManyToMany, TypeORM sẽ tự động xóa các bản ghi liên kết 
    // trong bảng trung gian (bảng junction) cho bạn.
    await this.serviceRepo.remove(service);

    return { message: `Xóa thành công dịch vụ có ID = ${id}` };
  }
}
