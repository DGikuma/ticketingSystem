import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'react-toastify';
import { Spinner } from '@heroui/react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const useDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(useDark);
    document.documentElement.classList.toggle('dark', useDark);
  }, []);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("❌ Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reset/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('✅ Password reset successful. Redirecting...');
        setTimeout(() => nav('/login'), 2500);
      } else {
        toast.error(data.message || '❌ Reset failed');
      }
    } catch {
      toast.error('❌ Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <AnimatedBackground theme={isDark ? 'dark' : 'light'} />
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-xl">Reset Password</CardTitle>
        </CardHeader>
        <form onSubmit={handleReset} className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner className="w-4 h-4" /> Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
