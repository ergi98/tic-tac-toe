import React from 'react';
import { render, screen, act, waitFor } from '../../../../test_utils';

import userEvent from '@testing-library/user-event';

import OnlinePlayFooter from './OnlinePlayFooter';

import { MotionGlobalConfig } from 'framer-motion';

MotionGlobalConfig.skipAnimations = true;

describe('OnlinePlayFooter', () => {
  it('should render successfully', () => {
    render(<OnlinePlayFooter onDisconnect={jest.fn()} />);

    const disconnectButton = screen.getByRole('button');

    expect(disconnectButton).toBeInTheDocument();
  });

  it('should open modal on disconnect press successfully', async () => {
    render(<OnlinePlayFooter onDisconnect={jest.fn()} />);
    const user = userEvent.setup();

    const disconnectButton = screen.getByRole('button');

    await act(async () => {
      await user.click(disconnectButton);
    });

    const dialog = screen.getByRole('dialog');

    expect(dialog).toBeInTheDocument();
  });

  it('should call disconnect callback when confirming', async () => {
    const disconnectHandler = jest.fn();
    render(<OnlinePlayFooter onDisconnect={disconnectHandler} />);
    const user = userEvent.setup();

    const disconnectButton = screen.getByRole('button');

    await act(async () => {
      await user.click(disconnectButton);
    });

    const confirmButton = screen.getByRole('button', {
      name: /leave party/i,
    });

    await act(async () => {
      await user.click(confirmButton);
    });

    await waitFor(() => {
      expect(disconnectHandler).toHaveBeenCalledTimes(1);
    });
  });
});
