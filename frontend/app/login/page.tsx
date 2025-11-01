'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/lib/auth/auth-provider';
import IrisCapture from '@/components/IrisCapture';
import MagicLinkForm from '@/components/MagicLinkForm';

export default function Login() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showIrisCapture, setShowIrisCapture] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (!isLoading && user) {
      router.push('/');
    }
    
    // Check if there's a token in the URL (from magic link)
    if (token) {
      verifyMagicLink(token);
    }
  }, [user, isLoading, router, token]);

  const verifyMagicLink = async (token: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`/api/v1/magic_link/verify?token=${token}`);
      
      // Login user
      login(response.data.access_token, {
        id: response.data.user_id,
        email: response.data.email,
      });

      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired magic link.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setShowIrisCapture(true);
  };

  const handleIrisLogin = async (irisData: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/v1/auth/login', {
        email,
        iris_data: irisData,
      });

      // Login user
      login(response.data.access_token, {
        id: response.data.user_id,
        email: response.data.email,
      });

      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
      setShowIrisCapture(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleMagicLink = () => {
    setShowMagicLink(!showMagicLink);
    setShowIrisCapture(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-3xl font-bold text-zinc-900 dark:text-white">
          Login
        </h1>
        
        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        
        {!showIrisCapture && !showMagicLink && (
          <form onSubmit={handleContinue} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block font-bold text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:ring-blue-500 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`focus:shadow-outline w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 focus:outline-none ${
                loading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              Continue with Iris
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMagicLink}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Login with Magic Link
              </button>
            </div>
          </form>
        )}
        
        {showIrisCapture && (
          <IrisCapture onCapture={handleIrisLogin} onCancel={() => setShowIrisCapture(false)} />
        )}
        
        {showMagicLink && (
          <MagicLinkForm 
            email={email} 
            setEmail={setEmail} 
            onCancel={toggleMagicLink} 
          />
        )}
        
        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}