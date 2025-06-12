// app/dashboard/layout.tsx
'use client';

import { useState, useEffect } from 'react'; // Import useState and useEffect
import Sidebar from '@/app/components/Sidebar';
import { useTheme } from '@/app/components/ThemeContext'; // Import useTheme

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme(); // Get current theme
  const [isClient, setIsClient] = useState(false); // State to track if on client

  useEffect(() => {
    setIsClient(true); // Set to true once component mounts on client
  }, []);

  // Determine the background class
  // On server, it will be 'bg-[var(--ui-bg-dark)]' (or any consistent default)
  // On client, after hydration, it will correctly pick based on 'theme'
  const backgroundClass = isClient
    ? (theme === 'dark' ? 'bg-[var(--ui-bg-dark)]' : 'bg-[var(--ui-bg-primary)]')
    : 'bg-[var(--ui-bg-dark)]'; // Keep a consistent value for initial server render

  return (
    // Apply dynamic background based on theme directly to the layout
    <div className={`flex h-screen overflow-hidden ${backgroundClass}`}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}