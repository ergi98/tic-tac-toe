import React from 'react';
import { render, screen } from '../../../../test_utils';

import InternetConnectionStatus from './InternetConnectionStatus';

describe('InternetConnectionStatus', () => {
  it('should not render if user is online', () => {
    render(<InternetConnectionStatus isOnline={true} />);

    const statusIndicator = screen.queryByTitle('disconnected-image');

    expect(statusIndicator).not.toBeInTheDocument();
  });

  it('should render if user is offline', () => {
    render(<InternetConnectionStatus isOnline={false} />);

    const statusIndicator = screen.queryByTitle('disconnected-image');

    expect(statusIndicator).toBeInTheDocument();
  });
});
