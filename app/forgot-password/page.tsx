// app/forgot-password/page.tsx
'use client'; // This will likely be a client component for form handling

import React, { useState } from 'react';
import Link from 'next/link';
// Import the Server Action you created for forgot password
import { forgotPassword } from '@/actions/auth'; // Assuming you added forgotPassword to actions/auth.ts
                                             // If you created a new file like actions/passwordReset.ts,
                                             // then the import would be: import { forgotPassword } from '@/actions/passwordReset';


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // THIS IS WHERE YOU ADD THE ACTUAL SERVER ACTION CALL
    try {
      // Call your actual Server Action here
      const result = await forgotPassword(email);

      if (result.success) {
        setMessage(result.message || 'If an account with that email exists, a password reset link has been sent.');
      } else {
        setError(result.error || 'Failed to send password reset link. Please try again.');
      }
    } catch (err: any) {
      console.error('Error calling forgotPassword Server Action:', err);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-white">
        <h1 className="text-3xl font-bold text-center mb-6">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
              placeholder="your@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && <p className="text-green-400 text-sm text-center">{message}</p>}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Remember your password?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}