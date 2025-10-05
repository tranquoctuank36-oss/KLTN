import { User } from "./user";

export type RegisterPayload = {
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  data: {
    accessToken: string;
    user: User;
  };
  meta?: {
    requestId: string;
    timestamp: string;
  };
};
