import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-800 text-white p-4 flex justify-between">
        <Link href="/">Home</Link>
        <Link href="/login">Login</Link>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
