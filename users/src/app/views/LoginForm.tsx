'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserEmail } from '@/lib/auth';
import { v6 } from 'uuid';
import { createSubmission } from '@/actions/submissions';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await checkUserEmail(email);
      if (user) {
        const newSubmissionId = v6();
        await createSubmission({ id: newSubmissionId, userId: user.id, nda: true });
        router.push(`/study/${user.id}/${newSubmissionId}`);
      } else {
        setError('Email not found in our database');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
    }
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className= "p-8 rounded-md shadow-md w-full max-w-md border border-gray-300"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Welcome!</h2>
        <div className="mb-4">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start Survey
        </button>
      </form>
    </div>
  );
}