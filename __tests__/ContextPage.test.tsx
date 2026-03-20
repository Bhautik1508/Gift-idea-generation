import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextPage from '@/app/gift/context/page';
import { GiftProvider } from '@/lib/GiftContext';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ContextPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
    jest.clearAllMocks();
  });

  test('renders step 3 heading', () => {
    render(
      <GiftProvider>
        <ContextPage />
      </GiftProvider>,
    );
    expect(screen.getByText('The Context')).toBeInTheDocument();
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
  });

  test('submit button disabled until social visibility is selected', () => {
    render(
      <GiftProvider>
        <ContextPage />
      </GiftProvider>,
    );
    const submitBtn = screen.getByRole('button', { name: /Find their perfect gift/i });
    expect(submitBtn).toBeDisabled();

    // Select a visibility option
    const radio = screen.getByLabelText('Close family');
    fireEvent.click(radio);
    expect(submitBtn).not.toBeDisabled();
  });

  test('submitting form changes button state and navigates to thinking page', () => {
    render(
      <GiftProvider>
        <ContextPage />
      </GiftProvider>,
    );
    
    // Select required field
    fireEvent.click(screen.getByLabelText('Close family'));
    
    // Submit
    const submitBtn = screen.getByRole('button', { name: /Find their perfect gift/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/gift/thinking');
  });
});
