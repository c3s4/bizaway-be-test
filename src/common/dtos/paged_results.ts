export class PagedRequestDto {
  page: number;
  itemsPerPage: number;
}

export abstract class PagedResponseDto<T> {
  items: T[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}
