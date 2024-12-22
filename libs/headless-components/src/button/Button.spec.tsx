import { render, screen, act } from '../../test_utils';

import userEvent from '@testing-library/user-event';

import BaseButton from './Button';

import * as FramerMotion from 'framer-motion';

describe('BaseButton', () => {
  it('should render successfully', () => {
    render(<BaseButton>Test</BaseButton>);

    const button = screen.getByRole('button');

    expect(button).toBeInTheDocument();
  });

  it('should inherit classes successfully', () => {
    render(
      <BaseButton
        buttonClasses="button-class"
        focusClasses="focus-class"
        pressClasses="press-class"
      >
        Test
      </BaseButton>,
    );

    const button = screen.getByRole('button');
    const press = screen.getByTestId('press-indicator');

    expect(press).toHaveClass('press-class');
    expect(button).toHaveClass('button-class');
    expect(button).not.toHaveClass('focus-class');

    act(() => {
      button.focus();
    });

    expect(button).toHaveClass('focus-class');
  });

  it('should show press indicator when pressed', async () => {
    const user = userEvent.setup();
    render(
      <BaseButton
        buttonClasses="button-class"
        focusClasses="focus-class"
        pressClasses="press-class"
      >
        Test
      </BaseButton>,
    );

    const button = screen.getByRole('button');
    const press = screen.getByTestId('press-indicator');

    expect(press).toHaveStyle('opacity: 0');

    await act(async () => {
      await user.pointer({ target: button, keys: '[MouseLeft>]' });
    });

    expect(press).toHaveStyle('opacity: 1');
  });

  it('should emit press events when pressed', async () => {
    const user = userEvent.setup();
    const pressHandler = jest.fn();
    const pressEndHandler = jest.fn();
    const pressStartHandler = jest.fn();

    render(
      <BaseButton
        onPress={pressHandler}
        onPressEnd={pressEndHandler}
        onPressStart={pressStartHandler}
        focusClasses="focus-class"
        pressClasses="press-class"
        buttonClasses="button-class"
      >
        Test
      </BaseButton>,
    );

    const button = screen.getByRole('button');

    await act(async () => {
      await user.click(button);
    });

    expect(pressHandler).toHaveBeenCalledTimes(1);
    expect(pressEndHandler).toHaveBeenCalledTimes(1);
    expect(pressStartHandler).toHaveBeenCalledTimes(1);
  });

  it('should stop previous animation if rapidly clicked', async () => {
    const user = userEvent.setup();
    const pressHandler = jest.fn();

    const stopAnimationHandler = jest.fn();

    jest.spyOn(FramerMotion, 'animate').mockReturnValue({
      time: 0,
      speed: 0,
      duration: 0,
      play: jest.fn(),
      then: jest.fn(),
      pause: jest.fn(),
      cancel: jest.fn(),
      complete: jest.fn(),
      stop: stopAnimationHandler,
    });

    render(
      <BaseButton
        onPress={pressHandler}
        focusClasses="focus-class"
        pressClasses="press-class"
        buttonClasses="button-class"
      >
        Test
      </BaseButton>,
    );

    const button = screen.getByRole('button');

    await act(async () => {
      await user.dblClick(button);
    });

    expect(stopAnimationHandler).toHaveBeenCalledTimes(1);
  });

  it('should display correctly when hovered', async () => {
    const user = userEvent.setup();
    const pressHandler = jest.fn();
    render(
      <BaseButton
        onPress={pressHandler}
        focusClasses="focus-class"
        pressClasses="press-class"
        buttonClasses="button-class"
      >
        Test
      </BaseButton>,
    );

    const button = screen.getByRole('button');

    await act(async () => {
      await user.hover(button);
    });

    expect(button).toHaveAttribute('data-hovered', 'true');
  });

  it('should not be clickable when disabled', async () => {
    const user = userEvent.setup();
    const pressHandler = jest.fn();
    render(
      <BaseButton
        isDisabled={true}
        onPress={pressHandler}
        focusClasses="focus-class"
        pressClasses="press-class"
        buttonClasses="button-class"
      >
        Test
      </BaseButton>,
    );

    const button = screen.getByRole('button');
    const press = screen.getByTestId('press-indicator');

    await act(async () => {
      // Click down but do not release
      await user.pointer({ target: button, keys: '[MouseLeft>]' });
    });

    expect(press).toHaveStyle('opacity: 0');
    expect(button).toHaveAttribute('data-hovered', 'false');

    await act(async () => {
      // Release
      await user.pointer({ target: button, keys: '[/MouseLeft]' });
    });

    expect(pressHandler).toHaveBeenCalledTimes(0);
  });
});
