import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digistore24 Automation Suite',
  description: 'Complete automation suite for Digistore24 with Next.js 14, TypeScript, and real-time webhooks',
  keywords: 'Digistore24, automation, webhooks, sales dashboard, Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  🚀 Digistore24 Automation
                </h1>
              </div>
              <div className="flex gap-4">
                <a
                  href="/"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </a>
                <a
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-600 text-sm">
              Built with ❤️ for the Digistore24 community
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
