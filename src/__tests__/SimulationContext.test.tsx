import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SimulationProvider, useSimulation } from '../context/SimulationContext';

const SimulationTestConsumer: React.FC = () => {
  const { 
    stadiums, 
    timeStep, 
    incidents,
    reportIncident,
    accessibilityRequests,
    addAccessibilityRequest
  } = useSimulation();

  const activeMatch = stadiums[0]?.activeMatch;

  return (
    <div>
      <span data-testid="stadium-count">{stadiums.length}</span>
      <span data-testid="active-match">{activeMatch ? `${activeMatch.homeTeam} vs ${activeMatch.awayTeam}` : 'No Match'}</span>
      <span data-testid="time-step">{timeStep}</span>
      <span data-testid="incident-count">{incidents.length}</span>
      <span data-testid="accessibility-count">{accessibilityRequests.length}</span>

      <button 
        data-testid="add-inc" 
        onClick={() => reportIncident({ stadiumName: "MetLife Stadium", type: "Medical Incident", severity: "High", zone: "Gate A", description: "Fainted fan" })}
      >
        Add Incident
      </button>
      <button
        data-testid="add-acc"
        onClick={() => addAccessibilityRequest({ fanName: "Maria", type: "Wheelchair Escort", stadiumName: "MetLife Stadium", location: "Section 104", priority: "High", notes: "Gate 4 entrance" })}
      >
        Add Accessibility Request
      </button>
    </div>
  );
};

describe('SimulationContext', () => {
  it('provides initial stadium data and active match', () => {
    render(
      <SimulationProvider>
        <SimulationTestConsumer />
      </SimulationProvider>
    );

    expect(screen.getByTestId('stadium-count')).not.toHaveTextContent('0');
    expect(screen.getByTestId('active-match')).not.toHaveTextContent('No Match');
  });

  it('allows adding real-time incidents and accessibility requests', () => {
    render(
      <SimulationProvider>
        <SimulationTestConsumer />
      </SimulationProvider>
    );

    const initialIncCount = Number(screen.getByTestId('incident-count').textContent);
    const initialAccCount = Number(screen.getByTestId('accessibility-count').textContent);

    act(() => {
      fireEvent.click(screen.getByTestId('add-inc'));
      fireEvent.click(screen.getByTestId('add-acc'));
    });

    expect(Number(screen.getByTestId('incident-count').textContent)).toBe(initialIncCount + 1);
    expect(Number(screen.getByTestId('accessibility-count').textContent)).toBe(initialAccCount + 1);
  });
});
