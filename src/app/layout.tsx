"use client";

import { useEffect, useState } from "react";
import {
  getTokens,
  getUserRole,
  isTokenExpired,
  refreshAccessToken,
  clearTokens,
} from "@/lib/auth";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { access_token, refresh_token } = getTokens();

      if (!access_token || !refresh_token) {
        clearTokens();
        router.push("/login");
        return;
      }

      if (isTokenExpired(access_token)) {
        try {
          const new_access_token = await refreshAccessToken();
          setUserRole(getUserRole(new_access_token));
        } catch (error) {
          clearTokens();
          router.push("/login");
        }
      } else {
        setUserRole(getUserRole(access_token));
      }
    };
    checkAuth();

    const originalFetch = window.fetch;
    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const { access_token } = getTokens();
      if (access_token) {
        init = init || {};
        init.headers = {
          ...init.headers,
          Authorization: `Bearer ${access_token}`,
        };
      }
      return originalFetch.call(window, input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {userRole ? <main>{children}</main> : <main>{children}</main>}
      </body>
    </html>
  );
}
