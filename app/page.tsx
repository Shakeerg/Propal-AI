"use client";

import Link from "next/link";
import { useTheme } from "@/app/components/ThemeContext";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function HomePage() {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <Head>
        <title>Welcome to PROPAL AI Internship</title>
        <meta
          name="description"
          content="Join the PROPAL AI Internship to learn cutting-edge technologies like React, Next.js, and Tailwind CSS while building real-world projects."
        />
      </Head>

      <main
        className={`min-h-screen bg-black flex items-center justify-center px-4 transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            🚀 Welcome to <span className="text-blue-600">PROPAL AI</span> Internship
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Your journey into frontend engineering starts here.
          </p>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Learn cutting-edge technologies like React, Next.js, and Tailwind CSS while building real-world projects with industry-level guidance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-md"
            >
              Login
            </Link>
            <Link
              href="/login/signup"
              className="px-6 py-3 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-md"
            >
              Signup
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
