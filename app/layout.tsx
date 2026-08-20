import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOMINSU - VR Content Platform",
  description: "Immersive 360° VR video streaming and fleet management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
