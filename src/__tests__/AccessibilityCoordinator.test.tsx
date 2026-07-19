import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AccessibilityCoordinator } from '../components/AccessibilityCoordinator';
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

describe('AccessibilityCoordinator Component', () => {
  it('renders accessibility request management dashboard', () => {
    renderWithProviders(<AccessibilityCoordinator />);

    expect(screen.getByText(/Accessibility Concierge Dispatch/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Intake Requests/i)).toBeInTheDocument();
  });
});
