export interface User {
  _id?: string;
  email: string;
  name?: string;
  image?: string;
  role: 'admin' | 'user';
  status: 'active' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'admin' | 'user';
  status: 'active' | 'pending' | 'rejected';
}
