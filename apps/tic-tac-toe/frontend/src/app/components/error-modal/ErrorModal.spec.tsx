import React from 'react';
import { render, screen } from '../../../../test_utils';

import type { OverlayTriggerState } from 'react-stately';

import ErrorModal from './ErrorModal';

const useOverlayTriggerState = jest.fn();
useOverlayTriggerState.mockImplementation(
  ({ isOpen }) =>
    ({
      isOpen,
      open: jest.fn(),
      close: jest.fn(),
      toggle: jest.fn(),
      setOpen: jest.fn(),
    }) as OverlayTriggerState,
);

describe('ErrorModal', () => {
  it('should render successfully', () => {
    const modalState = useOverlayTriggerState({ isOpen: true });
    render(<ErrorModal errorCode={null} modalState={modalState} />);

    const errorModal = screen.getByRole('dialog');

    expect(errorModal).toBeInTheDocument();
  });

  it('should not render if not opened', () => {
    const modalState = useOverlayTriggerState({ isOpen: false });
    render(<ErrorModal errorCode={null} modalState={modalState} />);

    const errorModal = screen.queryByRole('dialog');

    expect(errorModal).not.toBeInTheDocument();
  });
});
