"use client";

import Link from "next/link";
import { Check, Coins, CreditCard, Gift, Sparkles } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const plans = [["Starter", 500, "₩5,000"], ["Explorer", 1200, "₩10,000"], ["Voyager", 3000, "₩25,000"]] as const;

export default function PointsPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const updatePoints = useAuthStore((state) => state.updatePoints);
  const [busy, setBusy] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  async function purchase(points: number, amount: number, index: number) {
    setBusy(index); setNotice("");
    try { if (token) { const result = await api.points.recharge(token, amount, "demo"); updatePoints(result.new_balance); } else updatePoints((user?.points ?? 0) + points); setNotice(`${points.toLocaleString()} points have been added to your balance.`); } catch { setNotice("Sign in to connect a real payment method."); } finally { setBusy(null); }
  }
  return <div className="utility-page points-page"><div className="utility-heading"><p className="eyebrow"><Coins size={14} />POINTS WALLET</p><h1>Power your<br /><em>next escape.</em></h1><p>Use points to unlock premium 360 experiences, creator drops, and live events.</p></div><div className="balance-card"><div><span className="balance-label">CURRENT BALANCE</span><strong>{(user?.points ?? 0).toLocaleString()} <small>POINTS</small></strong></div><Coins className="balance-coin" size={48} /></div><div className="plans-heading"><h2>Choose a pack</h2><span><Sparkles size={15} />Best value includes bonus points</span></div><div className="point-plans">{plans.map(([name, points, amount], index) => <article className={index === 1 ? "point-plan featured" : "point-plan"} key={name}>{index === 1 && <span className="plan-badge">MOST POPULAR</span>}<Gift size={20} /><h3>{name}</h3><strong>{points.toLocaleString()}P</strong><p>{amount}</p><button type="button" className={index === 1 ? "button button-cyan" : "button button-ghost"} onClick={() => purchase(points, Number(amount.replace(/\D/g, "")), index)} disabled={busy !== null}>{busy === index ? "Adding…" : <><CreditCard size={15} />Add points</>}</button></article>)}</div>{notice && <p className="success-notice"><Check size={16} />{notice}</p>}<p className="utility-footnote">Payments are simulated in this preview. Connect the backend payment provider before production.</p><Link href="/" className="back-link">Continue exploring</Link></div>;
}
