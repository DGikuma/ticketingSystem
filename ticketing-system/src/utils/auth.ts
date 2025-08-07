import { jwtDecode } from 'jwt-decode';

interface DecodedUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
  exp: number;
}

export const getUserFromToken = (): DecodedUser | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return jwtDecode<DecodedUser>(token);  // ✅ Decodes token
  } catch {
    return null;
  }
};