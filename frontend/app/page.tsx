'use client';

import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-3xl font-bold text-zinc-900 dark:text-white">
          Iris Authentication
        </h1>
        
        <div className="mb-6 rounded-lg bg-green-100 p-4 dark:bg-green-900/30">
          <p className="text-center text-green-800 dark:text-green-200">
            You are logged in as <span className="font-semibold">{user.email}</span>
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={logout}
            className="w-full rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
          
          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              This is a secure authentication system using iris biometrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
