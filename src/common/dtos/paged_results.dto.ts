import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PagedRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Expose({ name: 'items_per_page' })
  itemsPerPage?: number;
}

export abstract class PagedResponseDto<T> {
  @ApiProperty()
  items: T[];
  @Expose({ name: 'current_page' })
  currentPage: number;
  @Expose({ name: 'items_per_page' })
  itemsPerPage: number;
  @Expose({ name: 'total_pages' })
  totalPages: number;
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
