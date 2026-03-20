import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { GiftProvider, useGift } from '@/lib/GiftContext';

// Helper component to access context values in tests
function TestConsumer() {
  const { formData, result, isLoading, updateFormData, setResult, setIsLoading, resetAll } = useGift();

  return (
    <div>
      <span data-testid="relationship">{formData.relationship}</span>
      <span data-testid="occasion">{formData.occasion}</span>
      <span data-testid="budget">{formData.budget}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="has-result">{String(!!result)}</span>
      <button data-testid="update-relationship" onClick={() => updateFormData({ relationship: 'Parent' })}>
        Update
      </button>
      <button data-testid="update-multiple" onClick={() => updateFormData({ occasion: 'Diwali', budget: ['₹3k–7.5k'] })}>
        Update Multiple
      </button>
      <button data-testid="toggle-loading" onClick={() => setIsLoading(!isLoading)}>
        Toggle Loading
      </button>
      <button
        data-testid="set-result"
        onClick={() =>
          setResult({
            portrait: 'Test portrait',
            recommendations: [],
            gift_intention: 'test intention',
            confidence_overall: 'high',
            confidence_reason: 'test',
          })
        }
      >
        Set Result
      </button>
      <button data-testid="reset" onClick={resetAll}>
        Reset
      </button>
    </div>
  );
}

describe('GiftContext', () => {
  test('provides default empty form data', () => {
    render(
      <GiftProvider>
        <TestConsumer />
      </GiftProvider>,
    );

    expect(screen.getByTestId('relationship')).toHaveTextContent('');
    expect(screen.getByTestId('occasion')).toHaveTextContent('');
    expect(screen.getByTestId('budget')).toHaveTextContent('');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('has-result')).toHaveTextContent('false');
  });

  test('updates individual form fields', () => {
    render(
      <GiftProvider>
        <TestConsumer />
      </GiftProvider>,
    );

    act(() => {
      screen.getByTestId('update-relationship').click();
    });

    expect(screen.getByTestId('relationship')).toHaveTextContent('Parent');
  });

  test('updates multiple fields at once', () => {
    render(
      <GiftProvider>
        <TestConsumer />
      </GiftProvider>,
    );

    act(() => {
      screen.getByTestId('update-multiple').click();
    });

    expect(screen.getByTestId('occasion')).toHaveTextContent('Diwali');
    expect(screen.getByTestId('budget')).toHaveTextContent('₹3k–7.5k');
  });

  test('toggles loading state', () => {
    render(
      <GiftProvider>
        <TestConsumer />
      </GiftProvider>,
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');

    act(() => {
      screen.getByTestId('toggle-loading').click();
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  test('sets result', () => {
    render(
      <GiftProvider>
        <TestConsumer />
      </GiftProvider>,
    );

    act(() => {
      screen.getByTestId('set-result').click();
    });

    expect(screen.getByTestId('has-result')).toHaveTextContent('true');
  });

  test('resetAll clears form and result', () => {
    render(
      <GiftProvider>
        <TestConsumer />
      </GiftProvider>,
    );

    // Set some data first
    act(() => {
      screen.getByTestId('update-relationship').click();
      screen.getByTestId('set-result').click();
      screen.getByTestId('toggle-loading').click();
    });

    // Now reset
    act(() => {
      screen.getByTestId('reset').click();
    });

    expect(screen.getByTestId('relationship')).toHaveTextContent('');
    expect(screen.getByTestId('has-result')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  test('throws error when used outside provider', () => {
    // Suppress console.error for this test since React will log the error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useGift must be used within a GiftProvider');

    consoleSpy.mockRestore();
  });
});
