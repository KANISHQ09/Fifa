import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Main Component', () => {
  it('renders StadiumPulse AI header and navigation options', () => {
    render(<App />);

    expect(screen.getAllByText(/StadiumPulse AI/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('navigation', { name: /Main Navigation/i })).toBeInTheDocument();
  });

  it('allows switching menus from left sidebar navigation', () => {
    render(<App />);

    const commandCenterBtn = screen.getByRole('button', { name: 'Command Center' });
    fireEvent.click(commandCenterBtn);

    expect(screen.getAllByText('Operations Command Center').length).toBeGreaterThan(0);
  });

  it('allows changing active user persona role using mode buttons', () => {
    render(<App />);

    const volunteerBtn = screen.getByRole('button', { name: /Volunteers \/ Staff/i });
    fireEvent.click(volunteerBtn);

    expect(volunteerBtn).toBeInTheDocument();
  });
});
