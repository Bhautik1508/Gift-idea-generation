'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfiles } from '@/lib/profiles';
import { useGift } from '@/lib/GiftContext';
import type { RecipientProfile, ChatSignals } from '@/lib/types';

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
];

export default function PeopleShortcut() {
  const [profiles, setProfiles] = useState<RecipientProfile[]>([]);
  const router = useRouter();
  const { resetAll, updateFormData, setChatSignals } = useGift();

  useEffect(() => {
    const all = getProfiles();
    setProfiles(all.slice(0, 3)); // Top 3
  }, []);

  if (profiles.length === 0) return null;

  const handleClick = (profile: RecipientProfile) => {
    resetAll();
    updateFormData({
      relationship: profile.relationship,
      previousPortrait: profile.portrait || undefined,
      previousGiftHistory: profile.giftHistory?.length > 0 ? profile.giftHistory : undefined,
    });
    if (profile.signals && Object.keys(profile.signals).length > 0) {
      setChatSignals(profile.signals as ChatSignals);
    }
    router.push('/gift/start');
  };

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="mt-10 animate-fade-in">
      <p className="text-sm text-muted mb-3">Gift someone you know</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {profiles.map((p, i) => (
          <button
            key={p.id}
            onClick={() => handleClick(p)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-border bg-surface hover:border-accent/50 hover:shadow-sm transition-all text-sm font-medium text-foreground"
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
              {getInitials(p.name)}
            </span>
            {p.name}
          </button>
        ))}
        <Link
          href="/gift/people"
          className="text-xs text-muted hover:text-foreground transition-colors underline underline-offset-2"
        >
          View all
        </Link>
      </div>
    </div>
  );
}
