import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

const TestComponent: React.FC = () => {
  const { lang, setLang, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{lang}</span>
      <span data-testid="translated-title">{t('menu.overview')}</span>
      <button data-testid="change-es" onClick={() => setLang('es')}>
        Switch to Spanish
      </button>
      <button data-testid="change-fr" onClick={() => setLang('fr')}>
        Switch to French
      </button>
    </div>
  );
};

describe('LanguageContext', () => {
  it('provides default English language and translations', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('translated-title')).toHaveTextContent('Overview');
  });

  it('allows switching to Spanish and updates translation strings', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByTestId('change-es'));

    expect(screen.getByTestId('current-lang')).toHaveTextContent('es');
    expect(screen.getByTestId('translated-title')).toHaveTextContent('Resumen');
  });

  it('allows switching to French', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByTestId('change-fr'));

    expect(screen.getByTestId('current-lang')).toHaveTextContent('fr');
    expect(screen.getByTestId('translated-title')).toHaveTextContent("Vue d'ensemble");
  });
});
