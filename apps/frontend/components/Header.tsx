// apps/frontend/components/Header.tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link href="/" className="text-xl font-bold">
          EnviroPlot
        </Link>
        <nav className="space-x-4">
          <Link href="/projects" className="text-gray-700 hover:text-gray-900">
            Projects
          </Link>
          <Link href="/projects/new" className="text-gray-700 hover:text-gray-900">
            New Project
          </Link>
          <Link href="/samples" className="text-gray-700 hover:text-gray-900">
            Samples
          </Link>
          <Link href="/reports" className="text-gray-700 hover:text-gray-900">
            Reports
          </Link>
          <Link href="/criteria" className="text-gray-700 hover:text-gray-900">
            Criteria
          </Link>
        </nav>
      </div>
    </header>
  )
}
