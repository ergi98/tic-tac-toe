import {
  act,
  render,
  screen,
  waitFor,
  fireEvent,
  renderHook,
} from '../../../test_utils';

import { useExpandable, TOAST_STATE } from './useExpandable';

describe('useExpandable', () => {
  beforeAll(() => {
    (window as any).PointerEvent = MouseEvent;
  });
  it('should render correctly when collapsed', () => {
    const { result } = renderHook(useExpandable, {
      initialProps: {
        minWidth: 10,
        maxWidth: 100,
        isDisabled: false,
        default: 'collapsed',
        animationThreshold: 0.75,
      },
    });

    expect(result.current.expandableState.get()).toEqual(TOAST_STATE.COLLAPSED);
  });

  it('should render correctly when expanded', () => {
    const { result } = renderHook(useExpandable, {
      initialProps: {
        minWidth: 10,
        maxWidth: 100,
        isDisabled: false,
        default: 'expanded',
        animationThreshold: 0.75,
      },
    });

    expect(result.current.expandableState.get()).toEqual(TOAST_STATE.EXPANDED);
  });

  it('should expand when expand function is invoked', async () => {
    const { result } = renderHook(useExpandable, {
      initialProps: {
        minWidth: 10,
        maxWidth: 100,
        isDisabled: false,
        default: 'collapsed',
        animationThreshold: 0.75,
      },
    });

    expect(result.current.expandableState.get()).toEqual(TOAST_STATE.COLLAPSED);

    act(() => {
      result.current.expand();
    });

    await waitFor(() => {
      expect(result.current.expandableState.get()).toEqual(
        TOAST_STATE.EXPANDED,
      );
    });
  });

  it('should collapse when collapse function is invoked', async () => {
    const { result } = renderHook(useExpandable, {
      initialProps: {
        minWidth: 10,
        maxWidth: 100,
        isDisabled: false,
        default: 'expanded',
        animationThreshold: 0.75,
      },
    });

    expect(result.current.expandableState.get()).toEqual(TOAST_STATE.EXPANDED);

    act(() => {
      result.current.collapse();
    });

    await waitFor(() => {
      expect(result.current.expandableState.get()).toEqual(
        TOAST_STATE.COLLAPSED,
      );
    });
  });

  it('should collapse when exceeding swipe threshold', async () => {
    const { result } = renderHook(useExpandable, {
      initialProps: {
        minWidth: 10,
        maxWidth: 100,
        isDisabled: false,
        default: 'expanded',
        animationThreshold: 0.75,
      },
    });

    render(
      <div
        role="button"
        ref={result.current.expandableRef}
        onPointerDown={result.current.handlePointerDown}
      />,
    );

    const swipeComponent = screen.getByRole('button');

    act(() => {
      fireEvent.pointerDown(swipeComponent, { clientX: 0 });
    });

    expect(swipeComponent).toHaveAttribute('data-move', 'true');
    expect(swipeComponent).toHaveAttribute('data-x', '0');

    act(() => {
      // swipe half the allowed distance (MAX - MIN) / 2 = (100 - 10) / 2 = 45
      fireEvent.pointerMove(swipeComponent, { clientX: 45 });
    });

    await waitFor(() => {
      // Expect the state to be in half (between 0 - COLLAPSED and 1 - EXPANDED)
      expect(result.current.expandableState.get()).toEqual(0.5);
    });

    act(() => {
      fireEvent.pointerUp(swipeComponent, { clientX: 45 });
    });

    await waitFor(() => {
      // Since 0.5 < 0.7 (threshold) the element will pass to the new state (collapsed)
      expect(result.current.expandableState.get()).toEqual(
        TOAST_STATE.COLLAPSED,
      );
    });
  });

  it('should stay expanded when within swipe threshold', async () => {
    const { result } = renderHook(useExpandable, {
      initialProps: {
        minWidth: 10,
        maxWidth: 100,
        isDisabled: false,
        default: 'expanded',
        animationThreshold: 0.4,
      },
    });

    render(
      <div
        role="button"
        ref={result.current.expandableRef}
        onPointerDown={result.current.handlePointerDown}
      />,
    );

    const swipeComponent = screen.getByRole('button');

    act(() => {
      fireEvent.pointerDown(swipeComponent, { clientX: 0 });
    });

    expect(swipeComponent).toHaveAttribute('data-move', 'true');
    expect(swipeComponent).toHaveAttribute('data-x', '0');

    act(() => {
      // swipe half the allowed distance (MAX - MIN) / 2 = (100 - 10) / 2 = 45
      fireEvent.pointerMove(swipeComponent, { clientX: 45 });
    });

    await waitFor(() => {
      // Expect the state to be in half (between 0 - COLLAPSED and 1 - EXPANDED)
      expect(result.current.expandableState.get()).toEqual(0.5);
    });

    act(() => {
      fireEvent.pointerUp(swipeComponent, { clientX: 45 });
    });

    await waitFor(() => {
      // Since 0.5 > 0.4 (threshold) the element will stay expanded
      expect(result.current.expandableState.get()).toEqual(
        TOAST_STATE.EXPANDED,
      );
    });
  });

  it('should ignore swipe events when disabled', async () => {
    const { result } = renderHook(useExpandable, {
      initialProps: {
        minWidth: 10,
        maxWidth: 100,
        isDisabled: true,
        default: 'expanded',
        animationThreshold: 0.4,
      },
    });

    render(
      <div
        role="button"
        ref={result.current.expandableRef}
        onPointerDown={result.current.handlePointerDown}
      />,
    );

    const swipeComponent = screen.getByRole('button');

    act(() => {
      fireEvent.pointerDown(swipeComponent, { clientX: 0 });
    });

    expect(swipeComponent).not.toHaveAttribute('data-move');
    expect(swipeComponent).not.toHaveAttribute('data-x');

    act(() => {
      // swipe half the allowed distance (MAX - MIN) / 2 = (100 - 10) / 2 = 45
      fireEvent.pointerMove(swipeComponent, { clientX: 45 });
    });

    act(() => {
      fireEvent.pointerUp(swipeComponent, { clientX: 45 });
    });

    await waitFor(() => {
      expect(result.current.expandableState.get()).toEqual(
        TOAST_STATE.EXPANDED,
      );
    });
  });
});
