import type { Metadata } from "next";
import ShortsPage from "@/components/portal/ShortsPage";

export const metadata: Metadata = { title: "Shorts" };

export default function ShortsRoute() { return <ShortsPage />; }
