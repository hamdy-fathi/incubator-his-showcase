import './globals.css';

export const metadata = {
  title: 'Smart Neonatal Incubator | Real-Time Monitoring System',
  description: 'Medical-grade neonatal incubator monitoring dashboard with real-time data visualization, 3D model integration, and intelligent alerting system.',
  keywords: ['neonatal', 'incubator', 'medical', 'monitoring', 'IoT', 'healthcare'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0e1a" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏥</text></svg>" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
