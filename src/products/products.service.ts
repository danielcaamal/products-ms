import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createProductDto: CreateProductDto) {
    return await this.product.create({
      data: {
        name: createProductDto.name,
        price: createProductDto.price,
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    paginationDto.total = await this.product.count({
      where: {
        available: true,
      },
    });
    paginationDto.lastPage = Math.ceil(
      paginationDto.total / paginationDto.limit,
    );
    const data = await this.product.findMany({
      where: {
        available: true,
      },
      take: paginationDto.limit,
      skip: paginationDto.skip,
    });

    return {
      data,
      meta: paginationDto,
    };
  }

  async findOne(id: number) {
    const result = await this.product.findUnique({
      where: {
        id,
        available: true,
      },
    });
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return result;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    return await this.product.update({
      where: {
        id,
      },
      data: {
        name: updateProductDto.name,
        price: updateProductDto.price,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Hard delete
    // return await this.product.delete({
    //   where: {
    //     id,
    //   },
    // });
    // Soft delete
    return await this.product.update({
      where: {
        id,
      },
      data: {
        available: false,
      },
    });
  }
}
