export class ServerFiltering {
  page: number;
  pageSize: number;
  sort?: string;
  sortDirection?: string;
  filter?: {
    [key: string]: string | number | boolean | Date;
  };
}
