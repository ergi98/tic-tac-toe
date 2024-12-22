import React from 'react';
import { render, screen } from '../../../../test_utils';

import RippleLoader from './RippleLoader';

describe('RippleLoader', () => {
  it('should render successfully', () => {
    render(<RippleLoader />);

    const loader = screen.getByRole('img');

    expect(loader).toBeInTheDocument();
  });
});
