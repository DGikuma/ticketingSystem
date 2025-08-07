import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export default function useRedirectByRole() {
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  const redirectByRole = (role: string) => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    if (role === 'admin') navigate('/admin');
    else if (role === 'agent') navigate('/support');
    else navigate('/dashboard');
  };

  const resetRedirect = () => {
    hasNavigated.current = false;
  };

  return { redirectByRole, resetRedirect };
}
