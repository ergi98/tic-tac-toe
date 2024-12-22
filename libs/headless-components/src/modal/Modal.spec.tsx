import { render, screen } from '../../test_utils';

import type { OverlayTriggerState } from 'react-stately';

import Modal from './Modal';

const useOverlayTriggerState = jest.fn();
useOverlayTriggerState.mockReturnValue({
  isOpen: false,
  open: jest.fn(),
  close: jest.fn(),
  toggle: jest.fn(),
  setOpen: jest.fn(),
} as OverlayTriggerState);

describe('Modal', () => {
  it('should render successfully', () => {
    const overlayState = useOverlayTriggerState();

    render(<Modal state={overlayState}>Test</Modal>);

    const modalContent = screen.getByText(/test/i);

    expect(modalContent).toBeInTheDocument();
  });
});
