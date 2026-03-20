import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadPage from '@/app/gift/upload/page';
import { GiftProvider } from '@/lib/GiftContext';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('UploadPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  test('renders the upload heading', () => {
    render(
      <GiftProvider>
        <UploadPage />
      </GiftProvider>
    );
    expect(screen.getByText('WhatsApp Signals')).toBeInTheDocument();
  });

  test('shows dropzone area', () => {
    render(
      <GiftProvider>
        <UploadPage />
      </GiftProvider>
    );
    expect(screen.getByText('Drop a WhatsApp export here')).toBeInTheDocument();
  });

  test('skip button navigates to thinking page', () => {
    render(
      <GiftProvider>
        <UploadPage />
      </GiftProvider>
    );
    const skipButton = screen.getByText('Skip this step');
    fireEvent.click(skipButton);
    expect(mockPush).toHaveBeenCalledWith('/gift/thinking');
  });

  test('extract button is disabled without file and name', () => {
    render(
      <GiftProvider>
        <UploadPage />
      </GiftProvider>
    );
    const extractButton = screen.getByText('Extract signals');
    expect(extractButton).toBeDisabled();
  });
});
