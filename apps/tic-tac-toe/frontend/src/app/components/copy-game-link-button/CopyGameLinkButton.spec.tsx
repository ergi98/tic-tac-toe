import React from 'react';
import { render, screen, act } from '../../../../test_utils';

import userEvent from '@testing-library/user-event';

import CopyGameLinkButton from './CopyGameLinkButton';

describe('CopyGameLinkButton', () => {
  beforeAll(() => {
    Object.defineProperty(navigator, 'share', {
      value: jest.fn().mockResolvedValue(undefined),
    });
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'group').mockImplementation(() => null);
    jest.spyOn(console, 'groupEnd').mockImplementation(() => null);
  });
  it('should render successfully', () => {
    const errorHandler = jest.fn();
    render(<CopyGameLinkButton lobbyId="1" onError={errorHandler} />);

    const button = screen.getByRole('button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/copy identifier/i);
  });

  it('should call error callback when no lobby identifier provided', async () => {
    const errorHandler = jest.fn();
    const user = userEvent.setup();

    render(<CopyGameLinkButton lobbyId={null} onError={errorHandler} />);

    const button = screen.getByRole('button');

    await act(async () => {
      await user.click(button);
    });

    // First one resets error state
    expect(errorHandler).toHaveBeenCalledTimes(2);
    expect(errorHandler).toHaveBeenNthCalledWith(1, false, undefined);
    expect(errorHandler).toHaveBeenNthCalledWith(2, true, 'generic');
  });

  it('should call error callback when clipboard is not supported', async () => {
    const errorHandler = jest.fn();
    const user = userEvent.setup();

    jest.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error());

    render(<CopyGameLinkButton lobbyId="1" onError={errorHandler} />);

    const button = screen.getByRole('button');

    await act(async () => {
      await user.click(button);
    });

    expect(errorHandler).toHaveBeenCalledTimes(2);
    expect(errorHandler).toHaveBeenNthCalledWith(1, false, undefined);
    expect(errorHandler).toHaveBeenNthCalledWith(2, true, 'copy');
  });

  it('should call error callback when share is not supported', async () => {
    const errorHandler = jest.fn();
    const user = userEvent.setup();

    jest.spyOn(navigator, 'share').mockRejectedValue(new Error());

    render(<CopyGameLinkButton lobbyId="1" onError={errorHandler} />);

    const button = screen.getByRole('button');

    await act(async () => {
      await user.click(button);
    });

    expect(errorHandler).toHaveBeenCalledTimes(2);
    expect(errorHandler).toHaveBeenNthCalledWith(1, false, undefined);
    expect(errorHandler).toHaveBeenNthCalledWith(2, true, 'share');
  });

  it('should not call error callback when share is canceled', async () => {
    const errorHandler = jest.fn();
    const user = userEvent.setup();

    jest
      .spyOn(navigator, 'share')
      .mockRejectedValue(new Error('Share canceled'));

    render(<CopyGameLinkButton lobbyId="1" onError={errorHandler} />);

    const button = screen.getByRole('button');

    await act(async () => {
      await user.click(button);
    });

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenNthCalledWith(1, false, undefined);
  });

  it('should copy lobby identifier to clipboard', async () => {
    const errorHandler = jest.fn();
    const user = userEvent.setup();

    render(<CopyGameLinkButton lobbyId="1" onError={errorHandler} />);

    const button = screen.getByRole('button');

    await act(async () => {
      await user.click(button);
    });

    const clipboardText = await navigator.clipboard.readText();

    expect(clipboardText).toBe('1');
  });
});
