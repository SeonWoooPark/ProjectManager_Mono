/* removed Next types */
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
/* removed @vercel/analytics (Next-only) */
import './globals.css'

/* metadata removed for React */


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        /* Analytics removed */
      </body>
    </html>
  )
}
