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

  async populateProducts(): Promise<void> {
    await this.$executeRaw`
      INSERT INTO 
        Product 
      (name, price, createdAt, updatedAt) 
        VALUES
      ('Teclado', 75.25, 1709049027545, 1709049027545),
      ('Mouse', 150.0, 1709049041977, 1709049041977),
      ('Monitor', 150.0, 1709049047955, 1709049047955),
      ('Audífonos', 50.0, 1709049048406, 1709049048406),
      ('Laptop', 1000.0, 1709049048754, 1709049048754),
      ('Smartphone', 800.0, 1709049058406, 1709049058406),
      ('Tablet', 300.0, 1709049063205, 1709049063205),
      ('Impresora', 200.0, 1709049068123, 1709049068123),
      ('Altavoces', 150.0, 1709049073021, 1709049073021),
      ('Cámara', 400.0, 1709049077943, 1709049077943),
      ('Televisor', 700.0, 1709049082912, 1709049082912),
      ('Router', 80.0, 1709049087876, 1709049087876),
      ('Reproductor Blu-ray', 180.0, 1709049092805, 1709049092805),
      ('Teclado inalámbrico', 60.0, 1709049097701, 1709049097701),
      ('Mouse inalámbrico', 80.0, 1709049102663, 1709049102663),
      ('Webcam', 70.0, 1709049107602, 1709049107602),
      ('Tarjeta de video', 250.0, 1709049112487, 1709049112487),
      ('Memoria RAM', 120.0, 1709049117415, 1709049117415),
      ('Disco duro externo', 150.0, 1709049122337, 1709049122337),
      ('Tarjeta madre', 350.0, 1709049127245, 1709049127245),
      ('Procesador', 300.0, 1709049132156, 1709049132156),
      ('Gabinete para PC', 80.0, 1709049137078, 1709049137078),
      ('Fuente de poder', 100.0, 1709049141998, 1709049141998),
      ('Router inalámbrico', 50.0, 1709049146924, 1709049146924),
      ('Adaptador Wi-Fi USB', 30.0, 1709049151830, 1709049151830),
      ('Cargador portátil', 40.0, 1709049156726, 1709049156726),
      ('Batería de repuesto', 50.0, 1709049161615, 1709049161615),
      ('Mochila para laptop', 40.0, 1709049166562, 1709049166562),
      ('Estuche para tablet', 20.0, 1709049171487, 1709049171487),
      ('Cable HDMI', 10.0, 1709049176416, 1709049176416),
      ('Adaptador de corriente', 20.0, 1709049181319, 1709049181319),
      ('Soporte para monitor', 30.0, 1709049186250, 1709049186250),
      ('Base para laptop', 25.0, 1709049191148, 1709049191148),
      ('Teclado numérico', 15.0, 1709049196075, 1709049196075),
      ('Mouse ergonómico', 35.0, 1709049200976, 1709049200976),
      ('Auriculares con micrófono', 50.0, 1709049205910, 1709049205910),
      ('Control remoto universal', 20.0, 1709049210831, 1709049210831),
      ('Base para smartphone', 15.0, 1709049215765, 1709049215765),
      ('Adaptador de audio Bluetooth', 25.0, 1709049220648, 1709049220648),
      ('Lector de tarjetas de memoria', 15.0, 1709049225590, 1709049225590),
      ('Cable USB-C', 10.0, 1709049230512, 1709049230512),
      ('Cable Lightning', 10.0, 1709049235427, 1709049235427),
      ('Cable VGA', 10.0, 1709049240329, 1709049240329),
      ('Cable DisplayPort', 10.0, 1709049245243, 1709049245243),
      ('Cable de red Ethernet', 10.0, 1709049250141, 1709049250141),
      ('Bolsa para laptop', 25.0, 1709049255042, 1709049255042),
      ('Almohadilla para mouse', 15.0, 1709049259956, 1709049259956);
    `;
  }
}
