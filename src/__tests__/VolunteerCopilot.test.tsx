import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VolunteerCopilot } from '../components/VolunteerCopilot';
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

describe('VolunteerCopilot Component', () => {
  it('renders volunteer copilot assistant and active stadium select', () => {
    renderWithProviders(<VolunteerCopilot />);

    expect(screen.getByText(/Volunteer & Staff Copilot/i)).toBeInTheDocument();
    expect(screen.getByText(/Identify Volunteer Role/i)).toBeInTheDocument();
  });

  it('allows changing volunteer role selection', () => {
    renderWithProviders(<VolunteerCopilot />);

    const select = screen.getByDisplayValue('Carlos Ruiz');
    fireEvent.change(select, { target: { value: 'Sarah Jenkins' } });

    expect(select).toHaveValue('Sarah Jenkins');
  });
});
