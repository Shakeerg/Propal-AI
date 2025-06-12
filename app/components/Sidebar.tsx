'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeContext";
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'; // Ensure these are correctly imported

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, userEmail } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    // Sidebar background is var(--ui-bg-sidebar) which you can set in global.css
    // All primary text in sidebar now uses var(--ui-green-accent)
    <aside className="w-64 min-h-screen bg-[var(--ui-bg-sidebar)] text-[var(--ui-green-accent)] shadow-lg flex flex-col border-r border-[var(--ui-border-color)]">
      <div className="flex flex-col gap-6 px-6 pt-10 pb-6 flex-1">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-[var(--ui-green-accent)] p-2 rounded-xl flex items-center justify-center">
            <svg width="28" height="28" fill="none"><circle cx="14" cy="14" r="14" fill="#32CD32" /></svg>
          </div>
          <span className="text-2xl font-extrabold tracking-wide text-[var(--ui-green-accent)]">PROPAL AI</span>
        </div>
        {/* Nav */}
        <nav className="flex-1"> {/* Flex-1 to push content to bottom */}
          <ul className="flex flex-col gap-2"> {/* Increased gap for better spacing */}
            {[
              { name: "Agent", href: "/dashboard/agent" },
              { name: "Profile", href: "/dashboard/profile" },
            ].map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ease-in-out
                    ${pathname === item.href
                      ? "bg-[var(--ui-green-accent)]/20 text-[var(--ui-green-accent)] font-semibold shadow-inner" // More pronounced active state
                      : "text-gray-300 hover:bg-white/10 hover:text-[var(--ui-green-accent)]" // Improved hover for non-active
                    }
                  `}
                >
                  {/* You can add icons here for each nav item */}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-white/10 my-6" /> {/* Separator */}
        {/* User summary */}
        <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-1 text-xs">
          <div className="font-semibold text-[var(--ui-green-accent)]">Signed in as</div>
          <div className="font-bold truncate text-white">{userEmail ? `User_${userEmail.split("@")[0]}` : "N/A"}</div> {/* Make user name white */}
          <div className="text-[var(--ui-green-accent)]/80 truncate">{userEmail || "N/A"}</div>
        </div>
      </div>
      {/* Bottom Controls */}
      <div className="px-6 py-6 flex flex-col gap-3">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-[var(--ui-green-accent)]/20 transition text-sm font-medium text-[var(--ui-green-accent)]"
        >
          {theme === 'light'
            ? (<><MoonIcon className="w-5 h-5" /> Dark Mode</>)
            : (<><SunIcon className="w-5 h-5" /> Light Mode</>)
          }
        </button>
        <button
          type="button"
          onClick={logout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 transition text-white text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 012-2V7a2 2 0 012-2h4a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Log out
        </button>
      </div>
    </aside>
  );
}