// apps/frontend/app/layout.tsx
import '@/styles/globals.css'
import { ReactNode } from 'react'
import Header from '@/components/Header'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="container mx-auto py-6 px-6">{children}</main>
      </body>
    </html>
  )
}
