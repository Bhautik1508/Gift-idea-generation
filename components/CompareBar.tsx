'use client';

import React from 'react';
import type { GiftRecommendation } from '@/lib/types';

interface CompareBarProps {
  items: GiftRecommendation[];
  onRemove: (name: string) => void;
  onClear: () => void;
}

export default function CompareBar({ items, onRemove, onClear }: CompareBarProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <div className="bg-surface border border-border rounded-2xl shadow-xl p-4">
            {!expanded ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto">
                  {items.map((item) => (
                    <div key={item.product_name} className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-full px-3 py-1.5 flex-shrink-0">
                      <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
                        {item.product_name}
                      </span>
                      <button
                        onClick={() => onRemove(item.product_name)}
                        className="text-muted hover:text-foreground transition-colors"
                        aria-label={`Remove ${item.product_name} from comparison`}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpanded(true)}
                    disabled={items.length < 2}
                    className={`h-10 px-6 rounded-full text-sm font-medium transition-all ${
                      items.length >= 2
                        ? 'bg-accent text-white hover:bg-accent-hover shadow-md'
                        : 'bg-muted/10 text-muted cursor-not-allowed'
                    }`}
                  >
                    Compare ({items.length})
                  </button>
                  <button onClick={onClear} className="text-xs text-muted hover:text-foreground transition-colors px-2">
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                    Side by side
                  </h3>
                  <button
                    onClick={() => setExpanded(false)}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    Collapse ↓
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted font-bold w-24">Field</th>
                        {items.map((item) => (
                          <th key={item.product_name} className="text-left py-2 px-3 min-w-[180px]">
                            <span className="font-semibold text-foreground">{item.product_name}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 text-xs uppercase tracking-wider text-muted font-bold">Price</td>
                        {items.map((item) => (
                          <td key={item.product_name} className="py-2 px-3 font-medium text-accent">{item.price_range}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 text-xs uppercase tracking-wider text-muted font-bold">Category</td>
                        {items.map((item) => (
                          <td key={item.product_name} className="py-2 px-3">{item.category}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 text-xs uppercase tracking-wider text-muted font-bold">Confidence</td>
                        {items.map((item) => (
                          <td key={item.product_name} className="py-2 px-3 capitalize">{item.confidence}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-xs uppercase tracking-wider text-muted font-bold align-top">Why it fits</td>
                        {items.map((item) => (
                          <td key={item.product_name} className="py-2 px-3 text-foreground/80 leading-relaxed">{item.why_it_fits}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
