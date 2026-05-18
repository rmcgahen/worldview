import './globals.css'

export const metadata = {
  title: 'WorldView — International News for Americans',
  description: 'The world explained for American readers. AI-powered international news that tells you why it matters.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
