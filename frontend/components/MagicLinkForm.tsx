'use client';

import { useState } from 'react';
import axios from 'axios';

interface MagicLinkFormProps {
  email: string;
  setEmail: (email: string) => void;
  onCancel: () => void;
}

export default function MagicLinkForm({ email, setEmail, onCancel }: MagicLinkFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/v1/magic_link/request', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Magic link sent! Check your email for a login link.</p>
          <p className="mt-2 text-sm">
            Didn't receive an email? Check your spam folder or try again.
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="magicLinkEmail" className="block text-gray-700 font-bold mb-2">
                Email
              </label>
              <input
                id="magicLinkEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        </>
      )}
      
      <div className="flex justify-center">
        <button
          onClick={onCancel}
          className="text-blue-500 hover:text-blue-700"
        >
          {success ? 'Back to Login' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}