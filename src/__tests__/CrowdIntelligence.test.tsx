import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CrowdIntelligence } from '../components/CrowdIntelligence';
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

describe('CrowdIntelligence Component', () => {
  it('renders crowd intelligence engine dashboard', () => {
    renderWithProviders(<CrowdIntelligence />);

    expect(screen.getByText(/Crowd Intelligence Engine/i)).toBeInTheDocument();
  });
});
