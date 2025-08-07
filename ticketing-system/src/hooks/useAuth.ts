import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {jwtDecode} from 'jwt-decode';

interface DecodedUser {
  id: number;
  name?: string; // May be optional in token
  email: string;
  role: 'admin' | 'agent' | 'user';
}

export const useAuth = () => {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Not authenticated');

        const data = await res.json(); // { token: string }

        // ✅ Decode the JWT to get user info
        const decoded: DecodedUser = jwtDecode(data.token);

        // ✅ Store in state and localStorage
        setUser(decoded);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(decoded));
      } catch (err) {
        console.error('Auth error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  const logout = async () => {
    await fetch('http://localhost:4000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    localStorage.clear();
    setUser(null);
    toast.success('Logged out');
    navigate('/login');
  };

  return { user, loading, logout };
};
