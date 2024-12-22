import React from 'react';

import { render, screen, waitFor, act } from '../../../../test_utils';

import SwitchRequestToast, {
  type ISwitchRequestToast,
} from './SwitchRequestToast';

import userEvent from '@testing-library/user-event';

let closeHandler = jest.fn();
let extraTimeHandler = jest.fn();
let regularTimeHandler = jest.fn();
let requestDecisionHandler = jest.fn();

describe('SwitchRequestToast', () => {
  beforeEach(() => {
    closeHandler = jest.fn();
    extraTimeHandler = jest.fn();
    regularTimeHandler = jest.fn();
    requestDecisionHandler = jest.fn();
  });
  it('should not render when closed', () => {
    const initiatorProps: ISwitchRequestToast = {
      isOpen: false,
      status: 'accepted',
      validUntil: null,
      isInitiator: true,
      onClose: closeHandler,
      onExtraTimeFinish: extraTimeHandler,
      onRegularTimeFinish: regularTimeHandler,
      onRequestDecision: requestDecisionHandler,
    };

    render(<SwitchRequestToast {...initiatorProps} />);

    const dialog = screen.queryByRole('dialog');

    expect(dialog).not.toBeInTheDocument();
  });

  describe('InitiatorToast', () => {
    it('should render in collapsed state initially', () => {
      const validUntil = new Date().getTime() + 10_000;
      const initiatorProps: ISwitchRequestToast = {
        validUntil,
        isOpen: true,
        status: 'pending',
        isInitiator: true,
        onClose: closeHandler,
        onExtraTimeFinish: extraTimeHandler,
        onRegularTimeFinish: regularTimeHandler,
        onRequestDecision: requestDecisionHandler,
      };

      render(<SwitchRequestToast {...initiatorProps} />);

      const dialog = screen.getByRole('dialog');

      const toast = dialog.querySelector('.initiator-status-toast');

      expect(toast).toHaveStyle('width: 64px; borderRadius: 99px');
    });

    it('should expand when clicked', async () => {
      const user = userEvent.setup();

      const validUntil = new Date().getTime() + 10_000;
      const initiatorProps: ISwitchRequestToast = {
        validUntil,
        isOpen: true,
        status: 'pending',
        isInitiator: true,
        onClose: closeHandler,
        onExtraTimeFinish: extraTimeHandler,
        onRegularTimeFinish: regularTimeHandler,
        onRequestDecision: requestDecisionHandler,
      };

      render(<SwitchRequestToast {...initiatorProps} />);

      const dialog = screen.getByRole('dialog');
      const expandButton = screen.getByRole('button', { name: 'expand' });
      const toast = dialog.querySelector('.initiator-status-toast');

      await act(async () => {
        await user.click(expandButton);
      });

      await waitFor(() => {
        expect(toast).toHaveStyle('width: 343px; borderRadius: 8px');
      });
    });

    it('should render pending state correctly', () => {
      const validUntil = new Date().getTime() + 10_000;
      const initiatorProps: ISwitchRequestToast = {
        validUntil,
        isOpen: true,
        status: 'pending',
        isInitiator: true,
        onClose: closeHandler,
        onExtraTimeFinish: extraTimeHandler,
        onRegularTimeFinish: regularTimeHandler,
        onRequestDecision: requestDecisionHandler,
      };

      render(<SwitchRequestToast {...initiatorProps} />);

      const heading = screen.getByRole('heading', { level: 1 });

      const closeButton = screen.queryByRole('button', { name: 'close' });

      expect(closeButton).not.toBeInTheDocument();
      expect(heading).toHaveTextContent(/waiting for approval/i);
    });

    it('should render timeout state correctly', () => {
      const validUntil = new Date().getTime() + 10_000;
      const initiatorProps: ISwitchRequestToast = {
        validUntil,
        isOpen: true,
        status: 'timeout',
        isInitiator: true,
        onClose: closeHandler,
        onExtraTimeFinish: extraTimeHandler,
        onRegularTimeFinish: regularTimeHandler,
        onRequestDecision: requestDecisionHandler,
      };

      render(<SwitchRequestToast {...initiatorProps} />);

      const heading = screen.getByRole('heading', { level: 1 });

      const closeButton = screen.queryByRole('button', { name: 'close' });

      expect(closeButton).toBeInTheDocument();
      expect(heading).toHaveTextContent(/no answer received!/i);
    });

    it('should render accepted state correctly', () => {
      const validUntil = new Date().getTime() + 10_000;
      const initiatorProps: ISwitchRequestToast = {
        validUntil,
        isOpen: true,
        status: 'accepted',
        isInitiator: true,
        onClose: closeHandler,
        onExtraTimeFinish: extraTimeHandler,
        onRegularTimeFinish: regularTimeHandler,
        onRequestDecision: requestDecisionHandler,
      };

      render(<SwitchRequestToast {...initiatorProps} />);

      const heading = screen.getByRole('heading', { level: 1 });

      const closeButton = screen.queryByRole('button', { name: 'close' });

      expect(closeButton).toBeInTheDocument();
      expect(heading).toHaveTextContent(/request accepted!/i);
    });

    it('should render rejected state correctly', () => {
      const validUntil = new Date().getTime() + 10_000;
      const initiatorProps: ISwitchRequestToast = {
        validUntil,
        isOpen: true,
        status: 'rejected',
        isInitiator: true,
        onClose: closeHandler,
        onExtraTimeFinish: extraTimeHandler,
        onRegularTimeFinish: regularTimeHandler,
        onRequestDecision: requestDecisionHandler,
      };

      render(<SwitchRequestToast {...initiatorProps} />);

      const heading = screen.getByRole('heading', { level: 1 });

      const closeButton = screen.queryByRole('button', { name: 'close' });

      expect(closeButton).toBeInTheDocument();
      expect(heading).toHaveTextContent(/request rejected!/i);
    });

    it('should automatically close when a decision has been made', async () => {
      const initiatorProps: ISwitchRequestToast = {
        isOpen: true,
        status: 'accepted',
        validUntil: null,
        isInitiator: true,
        onClose: closeHandler,
        onExtraTimeFinish: extraTimeHandler,
        onRegularTimeFinish: regularTimeHandler,
        onRequestDecision: requestDecisionHandler,
      };

      render(<SwitchRequestToast {...initiatorProps} />);

      await waitFor(
        () => {
          expect(closeHandler).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('ReceiverToast', () => {
    it('should render in expanded state initially', () => {
      const validUntil = new Date().getTime() + 10_000;
      const initiatorProps: ISwitchRequestToast = {
        validUntil,
        isOpen: true,
        status: 'pending',
        isInitiator: false,
        onClose: closeHandler,
        onExtraTimeFinish: extraTimeHandler,
        onRegularTimeFinish: regularTimeHandler,
        onRequestDecision: requestDecisionHandler,
      };

      render(<SwitchRequestToast {...initiatorProps} />);

      const dialog = screen.getByRole('dialog');

      const toast = dialog.querySelector('.receiver-status-toast');

      expect(toast).toHaveStyle('width: 343px; borderRadius: 8px');
    });

    it('calls decision callback with accept when a decision is made', async () => {
      const user = userEvent.setup();
      const validUntil = new Date().getTime() + 10_000;
      const initiatorProps: ISwitchRequestToast = {
        validUntil,
        isOpen: true,
        status: 'pending',
        isInitiator: false,
        onClose: closeHandler,
        onExtraTimeFinish: extraTimeHandler,
        onRegularTimeFinish: regularTimeHandler,
        onRequestDecision: requestDecisionHandler,
      };

      render(<SwitchRequestToast {...initiatorProps} />);

      const acceptButton = screen.getByRole('button', { name: 'Accept' });
      const rejectButton = screen.getByRole('button', { name: 'Reject' });

      await act(async () => {
        await user.click(acceptButton);
      });

      await act(async () => {
        await user.click(rejectButton);
      });

      expect(requestDecisionHandler).toHaveBeenCalledTimes(1);
      expect(requestDecisionHandler).toHaveBeenCalledWith('accept');
    });

    it('calls decision callback with reject when a decision is made', async () => {
      const user = userEvent.setup();
      const validUntil = new Date().getTime() + 10_000;
      const initiatorProps: ISwitchRequestToast = {
        validUntil,
        isOpen: true,
        status: 'pending',
        isInitiator: false,
        onClose: closeHandler,
        onExtraTimeFinish: extraTimeHandler,
        onRegularTimeFinish: regularTimeHandler,
        onRequestDecision: requestDecisionHandler,
      };

      render(<SwitchRequestToast {...initiatorProps} />);

      const acceptButton = screen.getByRole('button', { name: 'Accept' });
      const rejectButton = screen.getByRole('button', { name: 'Reject' });

      await act(async () => {
        await user.click(rejectButton);
      });

      await act(async () => {
        await user.click(acceptButton);
      });

      expect(requestDecisionHandler).toHaveBeenCalledTimes(1);
      expect(requestDecisionHandler).toHaveBeenCalledWith('reject');
    });
  });
});
