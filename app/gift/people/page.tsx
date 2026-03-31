'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import { getProfiles, deleteProfile } from '@/lib/profiles';
import type { RecipientProfile, ChatSignals } from '@/lib/types';

export default function PeoplePage() {
  const router = useRouter();
  const { updateFormData, resetAll, setChatSignals } = useGift();
  const [profiles, setProfiles] = useState<RecipientProfile[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setProfiles(getProfiles());
  }, []);

  const handleGiftAgain = (profile: RecipientProfile) => {
    resetAll();
    updateFormData({
      relationship: profile.relationship,
    });
    // Restore saved chat signals if available
    if (profile.signals && Object.keys(profile.signals).length > 0) {
      setChatSignals(profile.signals as ChatSignals);
    }
    router.push('/gift/start');
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    setProfiles(getProfiles());
    setDeleteConfirm(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-orange-100 text-orange-700',
    'bg-teal-100 text-teal-700',
    'bg-rose-100 text-rose-700',
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Your People
        </h1>
        <p className="text-muted">
          Saved recipients from past gift sessions. Gift them again with one tap.
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            No saved recipients yet
          </h2>
          <p className="text-muted mb-6 max-w-sm mx-auto">
            After getting gift recommendations, tap &ldquo;Save this person&rdquo; to build your gifting network.
          </p>
          <button
            onClick={() => router.push('/gift/start')}
            className="h-12 px-8 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-all shadow-md"
          >
            Find a gift
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profiles.map((profile, idx) => (
            <div
              key={profile.id}
              className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-shadow relative group"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${COLORS[idx % COLORS.length]}`}>
                  {getInitials(profile.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg leading-tight truncate">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-muted">{profile.relationship}</p>
                  
                  {/* Gift history count */}
                  {profile.giftHistory?.length > 0 && (
                    <p className="text-xs text-muted mt-1">
                      {profile.giftHistory.length} past gift{profile.giftHistory.length > 1 ? 's' : ''}
                    </p>
                  )}

                  {/* Portrait snippet */}
                  {profile.portrait && (
                    <p className="text-xs text-foreground/60 mt-2 line-clamp-2 leading-relaxed">
                      {profile.portrait}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                <button
                  onClick={() => handleGiftAgain(profile)}
                  className="flex-1 h-9 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  Gift again
                </button>
                {deleteConfirm === profile.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(profile.id!)}
                      className="h-9 px-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="h-9 px-3 rounded-lg text-xs text-muted hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(profile.id!)}
                    className="w-9 h-9 rounded-lg border border-border bg-surface text-muted flex items-center justify-center hover:text-red-500 hover:border-red-200 transition-colors"
                    aria-label={`Delete ${profile.name}`}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
