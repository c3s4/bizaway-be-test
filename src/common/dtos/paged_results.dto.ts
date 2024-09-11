import { IsNumber, IsOptional, Min } from 'class-validator';

export class PagedRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  itemsPerPage?: number;
}

export abstract class PagedResponseDto<T> {
  items: T[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}
