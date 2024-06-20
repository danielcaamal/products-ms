import { Product } from '@prisma/client';
import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { PaginationDto } from 'src/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create_product' })
  async create(
    @Payload() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return await this.productsService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'find_all_products' })
  async findAll(@Payload() paginationDto: PaginationDto): Promise<{
    data: Product[];
    meta: PaginationDto;
  }> {
    return await this.productsService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_product' })
  async findOne(@Payload('id', ParseIntPipe) id: number): Promise<Product> {
    return await this.productsService.findOne(+id);
  }

  @MessagePattern({ cmd: 'update_product' })
  async update(
    @Payload() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productsService.update(
      updateProductDto.id,
      updateProductDto,
    );
  }

  @MessagePattern({ cmd: 'remove_product' })
  async remove(@Payload('id', ParseIntPipe) id: number): Promise<Product> {
    return await this.productsService.remove(+id);
  }

  @MessagePattern({ cmd: 'validate_products' })
  async validateProducts(@Payload() productIds: number[]): Promise<Product[]> {
    return await this.productsService.validateProducts(productIds);
  }
}
