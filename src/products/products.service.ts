import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/paginatio.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  onModuleInit() {
    this.$connect();
    console.log('db connected');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalPages = await this.product.count({
      where: { available: true },
    });

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
        where: { available: true },
      }),
      metadata: {
        total: totalPages,
        page,
        limit,
        lastPage: Math.ceil(totalPages / limit),
      }
    }
  }

  findOne(id: number) {
    const product = this.product.findUnique({
      where: { id, available: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...data } = updateProductDto;

    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    const productExists = this.product.findUnique({
      where: { id },
    });

    if (!productExists) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return await this.product.update({
      where: { id },
      data: { available: false }, // Soft delete
    });
  }
}
