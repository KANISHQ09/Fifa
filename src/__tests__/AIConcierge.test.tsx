import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AIConcierge } from '../components/AIConcierge';
import { SimulationProvider } from '../context/SimulationContext';
import { LanguageProvider } from '../context/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <SimulationProvider>
      <LanguageProvider>
        {ui}
      </LanguageProvider>
    </SimulationProvider>
  );
};

describe('AIConcierge Component', () => {
  it('renders initial welcome message and input field', () => {
    renderWithProviders(<AIConcierge />);

    expect(screen.getByText(/StadiumPulse AI Concierge/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask StadiumPulse AI\.\.\./i)).toBeInTheDocument();
  });

  it('handles user message submission', () => {
    renderWithProviders(<AIConcierge />);

    const input = screen.getByPlaceholderText(/Ask StadiumPulse AI\.\.\./i);
    const sendBtn = screen.getByRole('button', { name: /Send Message/i });

    fireEvent.change(input, { target: { value: 'Where is MetLife Stadium?' } });
    fireEvent.click(sendBtn);

    expect(screen.getByText('Where is MetLife Stadium?')).toBeInTheDocument();
  });
});
