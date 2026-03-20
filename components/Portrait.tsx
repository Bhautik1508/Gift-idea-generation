'use client';

import React from 'react';

interface PortraitProps {
  text: string;
  relationship?: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceReason: string;
}

export default function Portrait({ text, relationship, confidence, confidenceReason }: PortraitProps) {
  const confidenceLabel = {
    high: 'Strong signal',
    medium: 'Good signal',
    low: 'Some gaps',
  }[confidence];

  const confidenceColor = {
    high: 'text-success',
    medium: 'text-warning',
    low: 'text-muted',
  }[confidence];

  return (
    <div className="animate-fade-in text-center max-w-2xl mx-auto mb-12">
      {/* Heading */}
      <h2
        className="text-2xl md:text-3xl font-semibold text-foreground mb-6"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Here&apos;s how we read{' '}
        {relationship ? (
          <span className="text-accent">your {relationship.toLowerCase()}</span>
        ) : (
          'them'
        )}
      </h2>

      {/* Portrait text */}
      <p
        className="text-lg md:text-xl text-foreground/90 leading-relaxed italic"
        style={{ fontFamily: 'var(--font-heading)', fontWeight: 400 }}
      >
        &ldquo;{text}&rdquo;
      </p>

      {/* Confidence badge */}
      <div className="mt-6 inline-flex items-center gap-2 group relative">
        <span className={`text-sm font-medium ${confidenceColor}`}>
          {confidenceLabel}
        </span>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {confidenceReason}
        </div>
      </div>
    </div>
  );
}
