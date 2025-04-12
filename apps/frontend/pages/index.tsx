import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-3xl font-bold">Welcome to EnviroPlot 👋</h1>
      <p className="text-lg text-gray-600">Start exploring environmental data tools.</p>
      <Link href="/login" className="text-blue-600 underline">
        Go to Login →
      </Link>
    </div>
  );
}
