import './globals.css'

export const metadata = {
  title: 'The Global Record — International News for Americans',
  description: 'International news explained for American readers. Find out what is happening around the world and why it matters to you.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4891736456577425"
          crossOrigin="anonymous"
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-QSXZNG0BNH"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QSXZNG0BNH');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}