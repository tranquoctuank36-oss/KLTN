export type User = {
  id: string;
  email: string;
  firstName?: string;      
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  roles: string[];      
  createdAt?: string;
};
