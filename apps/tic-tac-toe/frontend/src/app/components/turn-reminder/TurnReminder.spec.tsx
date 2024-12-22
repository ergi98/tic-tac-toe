import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '../../../../test_utils';

import { MotionGlobalConfig } from 'framer-motion';

import TurnReminder, {
  HIDE_TIMEOUT_DURATION,
  SHOW_TIMEOUT_DURATION,
} from './TurnReminder';

MotionGlobalConfig.skipAnimations = true;

describe('TurnIndicator', () => {
  beforeAll(() => {
    (window as any).PointerEvent = MouseEvent;
  });

  it('should not render on local-multiplayer', () => {
    render(
      <TurnReminder
        mySymbol="O"
        playingSymbol="O"
        playMode="local-multiplayer"
      />,
    );

    const dialog = screen.queryByRole('dialog');

    expect(dialog).not.toBeInTheDocument();
  });

  it('should not render when not my turn', async () => {
    jest.useFakeTimers();

    render(
      <TurnReminder
        mySymbol="O"
        playingSymbol="X"
        playMode="local-multiplayer"
      />,
    );

    act(() => {
      jest.advanceTimersByTime(SHOW_TIMEOUT_DURATION);
    });

    await waitFor(() => {
      const dialog = screen.queryByRole('dialog');
      expect(dialog).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should render when my turn', async () => {
    jest.useFakeTimers();

    render(
      <TurnReminder
        mySymbol="O"
        playingSymbol="O"
        playMode="versus-computer"
      />,
    );

    act(() => {
      jest.advanceTimersByTime(SHOW_TIMEOUT_DURATION);
    });

    await waitFor(() => {
      const dialog = screen.queryByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should dismiss on click', async () => {
    jest.useFakeTimers();

    render(
      <TurnReminder
        mySymbol="O"
        playingSymbol="O"
        playMode="versus-computer"
      />,
    );

    act(() => {
      jest.advanceTimersByTime(SHOW_TIMEOUT_DURATION);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });

    act(() => {
      fireEvent.pointerUp(screen.getByRole('dialog'), { clientX: 0 });
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it(`should automatically dismiss after ${HIDE_TIMEOUT_DURATION / 1000}seconds`, async () => {
    jest.useFakeTimers();

    render(
      <TurnReminder
        mySymbol="O"
        playingSymbol="O"
        playMode="versus-computer"
      />,
    );

    act(() => {
      jest.advanceTimersByTime(SHOW_TIMEOUT_DURATION);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(HIDE_TIMEOUT_DURATION);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
