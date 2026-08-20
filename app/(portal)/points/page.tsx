import type { Metadata } from "next";
import PointsPage from "@/components/portal/PointsPage";

export const metadata: Metadata = { title: "Points wallet" };

export default function PointsRoute() { return <PointsPage />; }
