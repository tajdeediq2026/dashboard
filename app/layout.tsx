import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import './responsive.css'

const alJazeera = localFont({
  src: [
    {
      path: './fonts/Al-Jazeera-Arabic-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Al-Jazeera-Arabic-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Al-Jazeera-Arabic-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Al-Jazeera-Arabic-Bold-1.ttf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-aljazeera',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dashboard App',
  description: 'NextJS Dashboard with RTL support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={alJazeera.variable}>{children}</body>
    </html>
  )
}
