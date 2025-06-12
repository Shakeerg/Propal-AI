"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { AuthProvider } from "./components/AuthProvider";
import { ThemeProvider } from "./components/ThemeContext";
import AuthRedirector from "./components/AuthRedirector";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <AuthRedirector />
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen bg-[var(--ui-bg-primary)] text-[var(--ui-text-primary)]">
                  Loading...
                </div>
              }
            >
              {children}
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}