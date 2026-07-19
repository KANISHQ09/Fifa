import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TransportationAssistant } from '../components/TransportationAssistant';
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

describe('TransportationAssistant Component', () => {
  it('renders multimodal transit & rideshare assistant', () => {
    renderWithProviders(<TransportationAssistant />);

    expect(screen.getByText(/Transportation & Parking Assistant/i)).toBeInTheDocument();
  });
});
