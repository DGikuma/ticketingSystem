import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface DecodedUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'support-agent' | 'user';
  exp: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/auth/token', {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Not authenticated');
        const data = await res.json();
        const decoded: DecodedUser = jwtDecode(data.accessToken);

        setUser(decoded);
      } catch (err) {
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

    setUser(null);
    toast.success('Logged out');
    navigate('/login');
  };

  return { user, loading, logout };
};
