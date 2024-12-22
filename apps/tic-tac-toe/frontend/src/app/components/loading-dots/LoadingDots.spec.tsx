import React from 'react';
import { render, screen } from '../../../../test_utils';

import LoadingDots from './LoadingDots';

describe('LoadingDots', () => {
  it('should render successfully', () => {
    render(<LoadingDots />);

    const dots = screen.getByRole('img');

    expect(dots).toBeInTheDocument();
  });
});
