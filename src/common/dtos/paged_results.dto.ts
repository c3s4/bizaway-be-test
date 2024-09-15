import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';

export const ApiOkResponsePaginated = <DataDto extends Type<unknown>>(dataDto: DataDto) =>
  applyDecorators(
    ApiExtraModels(PagedResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PagedResponseDto) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );

export class PagedRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({ name: 'items_per_page' })
  @Expose({ name: 'items_per_page' })
  itemsPerPage?: number;
}

export abstract class PagedResponseDto<T> {
  @ApiProperty()
  items: T[];
  @ApiProperty({ name: 'current_page' })
  @Expose({ name: 'current_page' })
  currentPage: number;
  @ApiProperty({ name: 'items_per_pag' })
  @Expose({ name: 'items_per_page' })
  itemsPerPage: number;
  @ApiProperty({ name: 'total_pages' })
  @Expose({ name: 'total_pages' })
  totalPages: number;
  @ApiProperty({ name: 'total_items' })
  @Expose({ name: 'total_items' })
  totalItems: number;

  constructor(pagedResponse: PagedResponseDto<T>) {
    this.items = pagedResponse.items;
    this.currentPage = pagedResponse.currentPage;
    this.itemsPerPage = pagedResponse.itemsPerPage;
    this.totalPages = pagedResponse.totalPages;
    this.totalItems = pagedResponse.totalItems;
  }
}
