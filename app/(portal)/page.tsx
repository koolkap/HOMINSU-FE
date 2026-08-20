import type { Metadata } from "next";
import PortalHome from "@/components/portal/PortalHome";

export const metadata: Metadata = { title: "Discover immersive worlds" };

export default function HomePage() {
  return <PortalHome />;
}
