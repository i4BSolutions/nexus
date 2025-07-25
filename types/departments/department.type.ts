export type DepartmentInterface = {
  id: number;
  name: string;
  created_at?: string;
};

export type DepartmentResponse = {
  data: DepartmentInterface[];
};
