import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CommandCenter } from '../components/CommandCenter';
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

describe('CommandCenter Component', () => {
  it('renders operations command center and simulation control panel', () => {
    renderWithProviders(<CommandCenter />);

    expect(screen.getByText(/Operations Command Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulation Engine/i)).toBeInTheDocument();
  });
});
