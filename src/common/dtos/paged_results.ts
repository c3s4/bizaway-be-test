export abstract class PagedResults<T> {
export abstract class PagedResponse<T> {
export abstract class PagedResponseDto<T> {
  items: T[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}
