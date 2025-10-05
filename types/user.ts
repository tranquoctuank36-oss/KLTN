export type User = {
  id: string;
  email: string;
  name?: string;      // có thể thêm nếu BE trả về
  role?: string;      // admin | user
  createdAt?: string;
  updatedAt?: string;
};
