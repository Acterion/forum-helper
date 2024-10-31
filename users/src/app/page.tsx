import LoginForm from '@/views/LoginForm';

export default function Home() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Forum Writing Study</h1>
      <LoginForm />
    </main>
  );
}