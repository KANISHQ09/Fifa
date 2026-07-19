import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SustainabilityDashboard } from '../components/SustainabilityDashboard';
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

describe('SustainabilityDashboard Component', () => {
  it('renders ESG green metrics and waste management dashboard', () => {
    renderWithProviders(<SustainabilityDashboard />);

    expect(screen.getByText(/Sustainability & ESG Dashboard/i)).toBeInTheDocument();
  });
});
