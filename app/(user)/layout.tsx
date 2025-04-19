import '@/app/globals.css';

export const metadata = {
  title: 'Scarlet Navigator',
  description: 'A tool for planning your Rutgers academic career',
  icons: {
    icon: '/rutgers.png',
    apple: '/rutgers.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
