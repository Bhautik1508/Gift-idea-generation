/**
 * Tests for lib/analytics.ts — typed event tracking wrapper
 */

import { track } from '@vercel/analytics';
import { trackEvent } from '@/lib/analytics';
import type { AnalyticsEvent } from '@/lib/analytics';

// The global mock from jest.setup.ts handles @vercel/analytics
const mockTrack = track as jest.MockedFunction<typeof track>;

describe('analytics', () => {
  beforeEach(() => {
    mockTrack.mockClear();
  });

  it('calls track() with the event name and properties', () => {
    trackEvent('flow_start', { source: 'main' });
    expect(mockTrack).toHaveBeenCalledWith('flow_start', { source: 'main' });
  });

  it('tracks step_complete_start with correct properties', () => {
    trackEvent('step_complete_start', {
      relationship: 'Parent',
      occasion: 'Birthday',
      budget_count: 2,
    });
    expect(mockTrack).toHaveBeenCalledWith('step_complete_start', {
      relationship: 'Parent',
      occasion: 'Birthday',
      budget_count: 2,
    });
  });

  it('tracks step_complete_about with boolean properties', () => {
    trackEvent('step_complete_about', {
      personality_count: 3,
      has_interests: true,
      has_wished: false,
    });
    expect(mockTrack).toHaveBeenCalledWith('step_complete_about', {
      personality_count: 3,
      has_interests: true,
      has_wished: false,
    });
  });

  it('tracks card_find_click with product details', () => {
    trackEvent('card_find_click', {
      product_name: 'Kindle Paperwhite',
      category: 'Product',
    });
    expect(mockTrack).toHaveBeenCalledWith('card_find_click', {
      product_name: 'Kindle Paperwhite',
      category: 'Product',
    });
  });

  it('tracks card_reject with reason', () => {
    trackEvent('card_reject', {
      product_name: 'Cooking Class',
      reason: 'Too expensive',
    });
    expect(mockTrack).toHaveBeenCalledWith('card_reject', {
      product_name: 'Cooking Class',
      reason: 'Too expensive',
    });
  });

  it('tracks feedback_submitted', () => {
    trackEvent('feedback_submitted', { landing: 'They loved it' });
    expect(mockTrack).toHaveBeenCalledWith('feedback_submitted', { landing: 'They loved it' });
  });

  it('tracks events with empty props (start_over, refine_same_person)', () => {
    trackEvent('start_over', {});
    expect(mockTrack).toHaveBeenCalledWith('start_over', {});

    trackEvent('refine_same_person', {});
    expect(mockTrack).toHaveBeenCalledWith('refine_same_person', {});
  });

  it('silently handles errors from track()', () => {
    mockTrack.mockImplementationOnce(() => {
      throw new Error('Network error');
    });

    // Should not throw
    expect(() => {
      trackEvent('flow_start', { source: 'main' });
    }).not.toThrow();
  });

  it('exports all expected event types', () => {
    const events: AnalyticsEvent[] = [
      'flow_start',
      'step_complete_start',
      'step_complete_about',
      'step_complete_upload',
      'results_viewed',
      'card_find_click',
      'card_share_click',
      'card_reject',
      'copy_all_ideas',
      'refine_same_person',
      'start_over',
      'share_session',
      'feedback_submitted',
    ];
    expect(events).toHaveLength(13);
  });
});
