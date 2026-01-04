import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auto Transport Carrier Verification Tool",
  description: "Verify FMCSA status for auto transport carriers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-800 min-h-screen flex flex-col`}
      >
        {/* Header */}
        <header className="bg-white text-slate-900 py-4 px-6 border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="font-bold text-2xl tracking-tighter flex items-center gap-1">
                <span className="text-slate-900">Intercity</span>
                <span className="text-slate-400 font-light">Lines</span>
              </div>
            </div>
            <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-slate-900 transition-colors">1-800-221-3936</a>
            </div>
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer className="bg-white text-slate-400 py-12 text-center text-sm mt-auto border-t border-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <p className="font-medium text-slate-300">&copy; {new Date().getFullYear()} Intercity Lines Inc.</p>
            <p className="mt-2 text-xs text-slate-200">FMCSA verification tool.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
