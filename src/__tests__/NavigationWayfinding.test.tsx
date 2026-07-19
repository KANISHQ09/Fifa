import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NavigationWayfinding } from '../components/NavigationWayfinding';
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

describe('NavigationWayfinding Component', () => {
  it('renders turn-by-turn navigation and stadium selection', () => {
    renderWithProviders(<NavigationWayfinding />);

    expect(screen.getByText(/Dynamic Wayfinding & Navigation/i)).toBeInTheDocument();
    expect(screen.getByText(/Accessible Route/i)).toBeInTheDocument();
  });

  it('allows selecting stadium for navigation', () => {
    renderWithProviders(<NavigationWayfinding />);

    const select = screen.getByDisplayValue(/MetLife Stadium/i);
    fireEvent.change(select, { target: { value: 'SoFi Stadium' } });

    expect(select).toHaveValue('SoFi Stadium');
  });
});
