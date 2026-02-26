import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SkyEnergy - Grupo Skyline',
  description: 'Sistema de reconhecimento de equipes com feedbacks e premiação mensal',
  icons: {
    icon: 'https://nvbkwbfmv6sookij.public.blob.vercel-storage.com/icon.ico',
    apple: 'https://nvbkwbfmv6sookij.public.blob.vercel-storage.com/icon.ico',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Galano:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
