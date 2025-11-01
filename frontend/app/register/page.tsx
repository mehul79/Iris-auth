'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/lib/auth/auth-provider';
import IrisCapture from '@/components/IrisCapture';

export default function Register() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [showIrisCapture, setShowIrisCapture] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (!isLoading && user && !registered) {
      router.push('/');
    }
  }, [user, isLoading, router, registered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/v1/auth/register', {
        email,
        full_name: fullName,
      });

      // Login user
      login(response.data.access_token, {
        id: response.data.user_id,
        email: response.data.email,
      });

      // Set registered to true to show iris capture
      setRegistered(true);
      setShowIrisCapture(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIrisCapture = async (irisData: string) => {
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/v1/auth/capture', 
        { iris_data: irisData },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to capture iris. Please try again.');
      setShowIrisCapture(false);
    } finally {
      setLoading(false);
    }
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
          {showIrisCapture ? 'Capture Iris' : 'Register'}
        </h1>
        
        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        
        {!registered && !showIrisCapture && (
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div>
              <label htmlFor="fullName" className="mb-2 block font-bold text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
        
        {showIrisCapture && (
          <IrisCapture 
            onCapture={handleIrisCapture} 
            onCancel={() => router.push('/')} 
          />
        )}
        
        {!showIrisCapture && (
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}