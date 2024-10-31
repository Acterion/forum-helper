import LoginForm from '@/views/LoginForm';
import initDB from './actions/initDB';

export default function Home() {
    initDB();
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Forum Writing Study</h1>
      <LoginForm />
    </main>
  );
}