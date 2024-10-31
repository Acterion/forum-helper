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
        await createSubmission({ id: v6(), userId: user.id, nda: true });
        router.push(`/study/${user.id}/${v6()}`);
      } else {
        setError('Email not found in our database');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="mb-4">
        <label htmlFor="email" className="block mb-2">
          Email:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded text-gray-900"
          required
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Start Study
      </button>
    </form>
  );
}