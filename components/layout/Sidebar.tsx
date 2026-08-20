'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Clapperboard,
  Camera,
  Sparkles,
  Radio,
  MonitorSpeaker,
  CreditCard,
  ListVideo,
  Compass,
  Crown,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'VR VIDEOS', icon: Clapperboard, href: '/' },
  { label: 'VR PHOTOS', icon: Camera, href: '/' },
  { label: 'AI & CLIPS', icon: Sparkles, href: '/' },
  { label: 'LIVE', icon: Radio, href: '/' },
  { label: 'OPERATOR', icon: MonitorSpeaker, href: '/operator' },
  { label: 'SUBSCRIPTIONS', icon: CreditCard, href: '/' },
  { label: 'PLAYLISTS', icon: ListVideo, href: '/' },
  { label: 'EXPLORE', icon: Compass, href: '/' },
  { label: 'PREMIUM', icon: Crown, href: '/' },
];

interface ToggleProps {
  label: string;
  defaultOn?: boolean;
}

function Toggle({ label, defaultOn = false }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className="flex w-full items-center justify-between py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
    >
      <span className="text-xs">{label}</span>
      <div
        className={`relative h-4 w-8 rounded-full transition-colors ${
          on ? 'bg-accent-purple' : 'bg-border-light'
        }`}
      >
        <div
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
            on ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-bg-secondary border-r border-border p-3">
      <Link href="/" className="flex items-center gap-2 px-3 py-4 mb-2">
        <div className="h-8 w-8 rounded-lg bg-accent-purple flex items-center justify-center font-bold text-sm">
          H
        </div>
        <span className="font-bold text-lg tracking-tight">HOMINSU</span>
      </Link>

      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent-purple/15 text-accent-purple font-medium'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-3 space-y-1">
        <Toggle label="8K" />
        <Toggle label="VR만 보기" />
        <Toggle label="Show Flat" />
        <Toggle label="성인 콘텐츠 숨기기" defaultOn />
      </div>
    </aside>
  );
}
