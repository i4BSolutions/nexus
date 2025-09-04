export interface PersonInterface {
  id: number;
  name: string;
  email?: string;
  department?: string;
  rank?: string;
}

export interface PersonResponse {
  items: PersonInterface[];
  total: number;
  page: number;
  pageSize: number;
}
