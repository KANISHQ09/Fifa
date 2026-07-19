import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReportsAnalytics } from '../components/ReportsAnalytics';
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

describe('ReportsAnalytics Component', () => {
  it('renders tournament analytics & export reports dashboard', () => {
    renderWithProviders(<ReportsAnalytics />);

    expect(screen.getByText(/Reports & Tournament Analytics/i)).toBeInTheDocument();
  });
});
