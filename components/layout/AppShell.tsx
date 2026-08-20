import type { ReactNode } from "react";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PortalHeader from "@/components/layout/PortalHeader";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return <div className="portal-shell"><PortalHeader /><Sidebar /><main className="portal-main">{children}</main><MobileBottomNav /></div>;
}
