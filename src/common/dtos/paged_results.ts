export abstract class PagedResults<T> {
  items: T[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}
