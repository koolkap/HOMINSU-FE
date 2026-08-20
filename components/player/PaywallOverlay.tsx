"use client";

import { useEffect, useState } from "react";
import { Check, Coins, LockKeyhole, Play, Sparkles, X } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

type State = "choice" | "ad" | "claiming" | "deducting" | "unlocked" | "error";

export default function PaywallOverlay({ contentId, price, onUnlocked, onDismiss }: { contentId: string; price: number; onUnlocked: () => void; onDismiss: () => void }) {
  const [state, setState] = useState<State>("choice");
  const [countdown, setCountdown] = useState(5);
  const [message, setMessage] = useState("");
  const token = useAuthStore((store) => store.token);
  const user = useAuthStore((store) => store.user);
  const updatePoints = useAuthStore((store) => store.updatePoints);

  useEffect(() => {
    if (state !== "ad") return;
    if (countdown === 0) { setState("claiming"); const timer = window.setTimeout(() => { setState("unlocked"); onUnlocked(); }, 700); return () => window.clearTimeout(timer); }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, onUnlocked, state]);

  async function unlockWithPoints() {
    setState("deducting"); setMessage("");
    try {
      if (token) {
        const result = await api.points.deduct(token, price, `Unlock ${contentId}`);
        updatePoints(result.new_balance);
      } else if ((user?.points ?? 0) < price) {
        throw new Error("You need more points to unlock this experience.");
      } else {
        updatePoints((user?.points ?? 0) - price);
      }
      setState("unlocked"); onUnlocked();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not unlock this content."); setState("error"); }
  }

  if (state === "unlocked") return null;
  return <div className="paywall-overlay"><div className="paywall-card"><button type="button" className="paywall-close" onClick={onDismiss} aria-label="Close"><X size={18} /></button><span className="paywall-icon">{state === "ad" || state === "claiming" ? <Play size={19} fill="currentColor" /> : <LockKeyhole size={19} />}</span>{state === "ad" || state === "claiming" ? <><p className="eyebrow"><Sparkles size={13} />REWARDED PREVIEW</p><h2>{state === "claiming" ? "Claiming your reward…" : `Your experience resumes in ${countdown}`}</h2><div className="ad-placeholder"><div className="ad-pulse" /><span>HOMINSU REWARD</span></div><p className="paywall-note">Watch this short sponsor message to unlock this experience at no cost.</p></> : <><p className="eyebrow"><LockKeyhole size={13} />PREMIUM EXPERIENCE</p><h2>Your preview has ended.</h2><p className="paywall-note">Unlock the full 360° experience and return whenever you like.</p><div className="unlock-price"><Coins size={18} /><strong>{price}P</strong><span>one-time access</span></div>{message && <p className="form-error">{message}</p>}<div className="paywall-actions"><button type="button" className="button button-purple" onClick={() => { setCountdown(5); setState("ad"); }} disabled={state === "deducting"}><Play size={16} fill="currentColor" />Watch ad</button><button type="button" className="button button-cyan" onClick={unlockWithPoints} disabled={state === "deducting"}>{state === "deducting" ? "Unlocking…" : <><Check size={16} />Use {price} points</>}</button></div><p className="paywall-footnote">Points are deducted only after the unlock is confirmed.</p></>}</div></div>;
}
