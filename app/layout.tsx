import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "HOMINSU VR STUDIO", template: "%s | HOMINSU VR STUDIO" },
  description: "360-degree VR live streams, VOD, shorts, and operator control.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
