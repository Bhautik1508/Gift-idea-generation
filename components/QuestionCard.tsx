'use client';

import React from 'react';

interface QuestionCardProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export default function QuestionCard({ label, description, children }: QuestionCardProps) {
  return (
    <div className="animate-fade-in mb-8">
      <label className="block mb-1">
        <span className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          {label}
        </span>
      </label>
      {description && (
        <p className="text-sm text-muted mb-3">{description}</p>
      )}
      <div className="mt-2">{children}</div>
    </div>
  );
}
