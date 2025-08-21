import React, { useState, useEffect } from 'react';
import { Spinner } from '@heroui/react';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'react-toastify';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function RequestReset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const useDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(useDark);
    document.documentElement.classList.toggle('dark', useDark);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    console.log('🔵 [FRONTEND] Submitting reset request for:', email);

    try {
      const res = await fetch('/api/reset/requestReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      console.log('🟡 [FRONTEND] Response status:', res.status);

      let data: any = {};
      try {
        data = await res.json();
        console.log('🟡 [FRONTEND] Response JSON:', data);
      } catch (jsonErr) {
        console.warn('⚠️ [FRONTEND] Failed to parse JSON response:', jsonErr);
      }

      if (res.ok) {
        toast.success('✅ Reset link sent to your email.');
        setEmail('');
      } else {
        toast.error(data?.message || '❌ Failed to send reset link.');
      }
    } catch (err: any) {
      console.error('❌ [FRONTEND] Network or fetch error:', err);
      toast.error('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <AnimatedBackground theme={isDark ? 'dark' : 'light'} />
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-xl">Request Password Reset</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <Spinner className="w-4 h-4" /> Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/" className="text-blue-600 hover:underline">
              Login here
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
}
