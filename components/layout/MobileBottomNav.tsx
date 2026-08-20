"use client";

import Link from "next/link";
import { Home, PlaySquare, Plus, UserRound, WalletCards } from "lucide-react";

export default function MobileBottomNav() {
  return <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
    <Link href="/"><Home size={20} /><span>Home</span></Link>
    <Link href="/shorts"><PlaySquare size={20} /><span>Shorts</span></Link>
    <Link href="/points" className="mobile-create"><Plus size={22} /></Link>
    <Link href="/points"><WalletCards size={20} /><span>Points</span></Link>
    <Link href="/profile"><UserRound size={20} /><span>Profile</span></Link>
  </nav>;
}
