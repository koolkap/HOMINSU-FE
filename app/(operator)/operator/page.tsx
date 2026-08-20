import type { Metadata } from "next";
import OperatorConsole from "@/components/operator/OperatorConsole";

export const metadata: Metadata = { title: "Operator Console" };

export default function OperatorPage() { return <OperatorConsole />; }
