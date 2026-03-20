'use client';

import React from 'react';
import type { GiftDirection } from '@/lib/types';

interface DirectionCardProps {
  direction: GiftDirection;
  index: number;
  onSelect?: () => void;
  onDismiss?: () => void;
  selected?: boolean;
  dismissed?: boolean;
}

export default function DirectionCard({
  direction,
  index,
  onSelect,
  onDismiss,
  selected = false,
  dismissed = false,
}: DirectionCardProps) {
  if (dismissed) return null;

  const confidenceColor = {
    high: 'bg-success',
    medium: 'bg-warning',
    low: 'border-2 border-muted bg-transparent',
  }[direction.confidence];

  const confidenceLabel = {
    high: 'Strong signal',
    medium: 'Good signal',
    low: 'Some gaps',
  }[direction.confidence];

  const territoryColors: Record<string, string> = {
    experience: 'bg-blue-50 text-blue-700 border-blue-200',
    object: 'bg-amber-50 text-amber-700 border-amber-200',
    consumable: 'bg-green-50 text-green-700 border-green-200',
    skill: 'bg-purple-50 text-purple-700 border-purple-200',
    time: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const territoryStyle =
    territoryColors[direction.territory.toLowerCase()] ||
    'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div
      className={`animate-fade-in relative rounded-2xl border p-6 md:p-8 transition-all duration-300 ${
        selected
          ? 'border-accent bg-blue-50/30 shadow-lg'
          : 'border-border bg-surface hover:shadow-md'
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Watermark number */}
      <span
        className="absolute top-4 right-6 text-7xl font-bold text-foreground/[0.04] select-none pointer-events-none"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Title */}
      <h3
        className="text-xl md:text-2xl font-semibold text-foreground mb-3 pr-16"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {direction.title}
      </h3>

      {/* Territory badge + confidence */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${territoryStyle}`}>
          {direction.territory}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className={`w-2.5 h-2.5 rounded-full ${confidenceColor}`} />
          {confidenceLabel}
        </span>
      </div>

      {/* Why this fits */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">
          Why this fits
        </h4>
        <p className="text-foreground leading-relaxed">{direction.why}</p>
      </div>

      {/* Examples */}
      <div className="mb-4 pl-4 border-l-2 border-border">
        <p className="text-foreground/80 italic leading-relaxed">{direction.examples}</p>
      </div>

      {/* Occasion fit */}
      <p className="text-sm text-muted mb-6">{direction.occasion_fit}</p>

      {/* Actions */}
      {!selected && (
        <div className="flex gap-3">
          <button
            onClick={onSelect}
            className="flex-1 h-11 rounded-full bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors cursor-pointer"
          >
            This feels right
          </button>
          <button
            onClick={onDismiss}
            className="h-11 px-5 rounded-full border border-border text-muted text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Not quite
          </button>
        </div>
      )}

      {selected && (
        <div className="flex items-center gap-2 text-accent font-medium text-sm">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.1" />
            <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          You chose this direction
        </div>
      )}
    </div>
  );
}
