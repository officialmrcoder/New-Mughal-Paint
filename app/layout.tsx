import type {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://newmughalpaint.vercel.app'),
  title: 'New Mughal Paint | Premium Royal Paints & Finishes',
  description: 'Experience the timeless grandeur of royal colours with New Mughal Paint. Premium silk wall emulsions, all-weather protection, and luxury metallic finishes.',
  keywords: ['New Mughal Paint', 'Mughal Paint', 'premium paints', 'wall paint', 'paint colors', 'paint visualizer', 'buy paint online'],
  openGraph: {
    title: 'New Mughal Paint | Premium Royal Paints & Finishes',
    description: 'Experience the timeless grandeur of royal colours with New Mughal Paint.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'eSgTZYPZxmS7tZXCEVh7_PpQZyejuzIY2lQ2cjrKNFA',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-[#FDFBF7] text-[#2C2520] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
