import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "System Design Review",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>System Design Review</h1>
          <nav>
            <Link href="/">New review</Link>
            <Link href="/history">History</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
