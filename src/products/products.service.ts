import { PrismaClient, Product } from '@prisma/client';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PaginationDto } from 'src/common';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return await this.product.create({
      data: {
        name: createProductDto.name,
        price: createProductDto.price,
      },
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Product[];
    meta: PaginationDto;
  }> {
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

  async findOne(id: number): Promise<Product> {
    const result = await this.product.findUnique({
      where: {
        id,
        available: true,
      },
    });
    if (!result) {
      throw new RpcException({
        message: 'Product not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return result;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
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

  async remove(id: number): Promise<Product> {
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

  async validateProducts(productIds: number[]): Promise<Product[]> {
    const ids = Array.from(new Set(productIds));
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
        available: true,
      },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'One or more products are not available',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }
}
