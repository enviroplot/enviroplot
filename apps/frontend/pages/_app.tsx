// apps/frontend/pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Header from '@/components/Header'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <main className="container mx-auto py-6 px-6">
        <Component {...pageProps} />
      </main>
    </>
  )
}
