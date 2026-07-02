export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

export type UserSaveData = Omit<User, 'id' | 'avatar'>;

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
}
