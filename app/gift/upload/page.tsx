'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import JSZip from 'jszip';
import type { ChatSignals } from '@/lib/types';

const ACCEPTED_EXTENSIONS = ['.txt', '.zip'];

function isAcceptedFile(name: string): boolean {
  return ACCEPTED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));
}

async function extractTextFromFile(file: File): Promise<string> {
  if (file.name.toLowerCase().endsWith('.zip')) {
    const zip = await JSZip.loadAsync(file);
    // Find the first .txt file inside the zip
    const txtFile = Object.values(zip.files).find(
      (f) => !f.dir && f.name.toLowerCase().endsWith('.txt')
    );
    if (!txtFile) {
      throw new Error('No .txt file found inside the zip. Please export the chat without media.');
    }
    return txtFile.async('string');
  }
  return file.text();
}

export default function UploadPage() {
  const router = useRouter();
  const { setChatSignals } = useGift();

  const [file, setFile] = useState<File | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const [signals, setSignals] = useState<ChatSignals | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && isAcceptedFile(dropped.name)) {
      setFile(dropped);
      setError('');
    } else {
      setError('Please upload a .txt or .zip file (WhatsApp export)');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && isAcceptedFile(selected.name)) {
      setFile(selected);
      setError('');
    } else if (selected) {
      setError('Please upload a .txt or .zip file (WhatsApp export)');
    }
  };

  const handleExtract = async () => {
    if (!file || !recipientName.trim()) return;

    setIsExtracting(true);
    setError('');

    try {
      const chatText = await extractTextFromFile(file);

      const res = await fetch('/api/parse-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatText, recipientName: recipientName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to extract signals');
      }

      const extractedSignals: ChatSignals = await res.json();
      setSignals(extractedSignals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirm = () => {
    if (signals) {
      setChatSignals(signals);
    }
    router.push('/gift/thinking');
  };

  const handleSkip = () => {
    router.push('/gift/thinking');
  };

  const handleReUpload = () => {
    setFile(null);
    setSignals(null);
    setError('');
    setRecipientName('');
  };

  const canExtract = !!file && !!recipientName.trim() && !isExtracting;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          WhatsApp Signals
        </h1>
        <p className="text-muted">
          Optional — upload a WhatsApp chat export with this person for deeper, more personal recommendations.
        </p>
        <p className="text-xs text-muted/60 mt-2">
          Your chat is never stored. It&apos;s processed once and discarded.
        </p>
      </div>

      {!signals ? (
        // ─── Upload & Extract Phase ───
        <div className="space-y-6">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-accent/50 transition-colors"
            role="button"
            aria-label="Upload chat file"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.zip"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="file-input"
            />
            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-50 text-success rounded-full flex items-center justify-center mx-auto">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="font-medium text-foreground">Drop a WhatsApp export here</p>
                <p className="text-sm text-muted">or click to browse — .txt or .zip</p>
              </div>
            )}
          </div>

          {/* Recipient Name */}
          {file && (
            <div className="animate-fade-in">
              <label className="block mb-2">
                <span className="text-sm font-medium text-foreground">
                  Who is the recipient in this chat?
                </span>
                <span className="text-xs text-muted block mt-0.5">
                  Type their name exactly as it appears in WhatsApp
                </span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Priya, Mom, Rahul Sharma"
                className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                data-testid="recipient-input"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleSkip}
              className="h-14 px-8 rounded-full border border-border text-foreground font-medium hover:bg-black/5 transition-colors cursor-pointer"
            >
              Skip this step
            </button>
            <button
              type="button"
              disabled={!canExtract}
              onClick={handleExtract}
              className={`flex-1 h-14 rounded-full font-medium text-lg transition-all ${
                canExtract
                  ? 'bg-accent text-white hover:bg-accent-hover shadow-md cursor-pointer'
                  : 'bg-muted/10 text-muted cursor-not-allowed'
              }`}
            >
              {isExtracting ? 'Extracting signals…' : 'Extract signals'}
            </button>
          </div>
        </div>
      ) : (
        // ─── Signal Preview Phase ───
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                signals.confidence === 'high' ? 'bg-success' :
                signals.confidence === 'medium' ? 'bg-amber-400' : 'bg-gray-400'
              }`} />
              <span className="text-xs font-medium text-muted uppercase tracking-wide">
                {signals.confidence} confidence signals
              </span>
            </div>

            {/* Standout Signal */}
            <div className="bg-accent/5 border border-accent/15 rounded-xl p-4">
              <h3 className="text-[10px] uppercase font-bold tracking-wider text-accent mb-1.5">
                Standout signal
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {signals.standout_signal}
              </p>
            </div>

            {/* Signal Sections */}
            {signals.expressed_desires.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">
                  They&apos;ve expressed wanting
                </h4>
                <div className="flex flex-wrap gap-2">
                  {signals.expressed_desires.map((d, i) => (
                    <span key={i} className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {signals.excitement_signals.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">
                  Excited about
                </h4>
                <div className="flex flex-wrap gap-2">
                  {signals.excitement_signals.map((s, i) => (
                    <span key={i} className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {signals.frustrations.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">
                  Frustrated by
                </h4>
                <div className="flex flex-wrap gap-2">
                  {signals.frustrations.map((f, i) => (
                    <span key={i} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {signals.life_context && (
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">
                  Life context
                </h4>
                <p className="text-sm text-foreground/80">{signals.life_context}</p>
              </div>
            )}
          </div>

          <p className="text-sm text-muted text-center">
            Does this feel right? These signals will sharpen the recommendations.
          </p>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleReUpload}
              className="h-14 px-8 rounded-full border border-border text-foreground font-medium hover:bg-black/5 transition-colors cursor-pointer"
            >
              Try different chat
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 h-14 rounded-full bg-accent text-white font-medium text-lg hover:bg-accent-hover shadow-md cursor-pointer transition-all"
            >
              Looks good — continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
