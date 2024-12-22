import React from 'react';
import { render, screen } from '@testing-library/react';

import TurnIndicator from './TurnIndicator';

describe('TurnIndicator', () => {
  it('should render successfully', () => {
    render(<TurnIndicator turn="X" mySymbol="X" />);

    const container = screen.getByRole('heading', { level: 6 });

    expect(container).toBeInTheDocument();
  });

  it('should have correct color on player turn', () => {
    render(<TurnIndicator turn="X" mySymbol="X" />);

    const container = screen.getByRole('heading', { level: 6 });

    expect(container).toHaveClass('text-stone-300');
  });

  it('should have correct color on opponent turn', () => {
    render(<TurnIndicator turn="X" mySymbol="O" />);

    const container = screen.getByRole('heading', { level: 6 });

    expect(container).toHaveClass('text-stone-500');
  });

  it('should display correct svg on X turn', () => {
    render(<TurnIndicator turn="X" mySymbol="O" />);

    const svg = screen.getByTitle('X');

    expect(svg).toBeInTheDocument();
  });

  it('should display correct svg on O turn', () => {
    render(<TurnIndicator turn="O" mySymbol="O" />);

    const svg = screen.getByTitle('O');

    expect(svg).toBeInTheDocument();
  });
});
