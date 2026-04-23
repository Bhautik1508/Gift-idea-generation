'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface FeedbackEntry {
  landing: string;
  note: string;
  timestamp: number;
  date: string;
}

export default function AdminPage() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Admin — Feedback | GiftSense';
    fetch('/api/feedback')
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load feedback data.');
        setLoading(false);
      });
  }, []);

  const loved = entries.filter((e) => e.landing === 'They loved it').length;
  const liked = entries.filter((e) => e.landing === 'They liked it').length;
  const missed = entries.filter((e) => e.landing === 'Missed').length;
  const total = entries.length;
  const withNotes = entries.filter((e) => e.note && e.note.trim().length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">Loading feedback data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
          Feedback Dashboard
        </h1>
        <Link href="/" className="text-sm text-accent hover:text-accent-hover underline underline-offset-2">
          ← Back to app
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-foreground">{total}</p>
          <p className="text-xs text-muted uppercase tracking-wide mt-1">Total</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-success">{loved}</p>
          <p className="text-xs text-muted uppercase tracking-wide mt-1">Loved it</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-accent">{liked}</p>
          <p className="text-xs text-muted uppercase tracking-wide mt-1">Liked it</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-error">{missed}</p>
          <p className="text-xs text-muted uppercase tracking-wide mt-1">Missed</p>
        </div>
      </div>

      {/* Satisfaction bar */}
      {total > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Satisfaction</h2>
          <div className="flex h-4 rounded-full overflow-hidden bg-border/50">
            {loved > 0 && (
              <div className="bg-success transition-all" style={{ width: `${(loved / total) * 100}%` }} title={`Loved: ${loved}`} />
            )}
            {liked > 0 && (
              <div className="bg-accent transition-all" style={{ width: `${(liked / total) * 100}%` }} title={`Liked: ${liked}`} />
            )}
            {missed > 0 && (
              <div className="bg-error transition-all" style={{ width: `${(missed / total) * 100}%` }} title={`Missed: ${missed}`} />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-muted mt-1.5">
            <span>Loved {total > 0 ? Math.round((loved / total) * 100) : 0}%</span>
            <span>Liked {total > 0 ? Math.round((liked / total) * 100) : 0}%</span>
            <span>Missed {total > 0 ? Math.round((missed / total) * 100) : 0}%</span>
          </div>
        </div>
      )}

      {/* Entries with notes */}
      {withNotes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
            Feedback with notes ({withNotes.length})
          </h2>
          <div className="space-y-3">
            {withNotes.slice().reverse().map((entry, idx) => (
              <div
                key={idx}
                className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                  entry.landing === 'They loved it' ? 'bg-success/10 text-success' :
                  entry.landing === 'They liked it' ? 'bg-accent/10 text-accent' :
                  'bg-error/10 text-error'
                }`}>
                  {entry.landing}
                </span>
                <p className="text-sm text-foreground/80 flex-1">{entry.note}</p>
                <span className="text-[10px] text-muted shrink-0">
                  {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-16">
          <p className="text-muted text-lg">No feedback yet.</p>
          <p className="text-sm text-muted/60 mt-2">Feedback will appear here as users submit it.</p>
        </div>
      )}
    </div>
  );
}
