import './globals.css';

export const metadata = {
  title: 'Turn14 Auto Parts Catalog',
  description: 'Professional auto parts catalog powered by Turn14 Distribution',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
