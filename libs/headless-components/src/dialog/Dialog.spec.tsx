import { render, screen, act } from '../../test_utils';

import userEvent from '@testing-library/user-event';

import Dialog from './Dialog';

describe('Dialog', () => {
  it('should render successfully', () => {
    render(<Dialog>Hey</Dialog>);

    const dialog = screen.getByRole('dialog');

    expect(dialog).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<Dialog title="Test">Hey</Dialog>);

    const dialogTitle = screen.getByRole('heading', { level: 1 });

    expect(dialogTitle).toHaveTextContent(/test/i);
  });

  it('should inherit classes successfully', () => {
    render(
      <Dialog
        title="Test"
        titleClass="title-class"
        containerClass="container-class"
        titleContainerClass="title-container-class"
      >
        Hey
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    const titleContainer = screen.getByTestId('title-container');
    const title = screen.getByRole('heading', { level: 1 });

    expect(dialog).toHaveClass('container-class');
    expect(title).toHaveClass('title-class');
    expect(titleContainer).toHaveClass('title-container-class');
  });

  it('should call close callback', async () => {
    const closeHandler = jest.fn();
    const user = userEvent.setup();
    render(
      <Dialog
        title="Test"
        onClose={closeHandler}
        titleClass="title-class"
        containerClass="container-class"
        titleContainerClass="title-container-class"
      >
        Hey
      </Dialog>,
    );

    const button = screen.getByRole('button', { name: 'close' });

    await act(async () => {
      await user.click(button);
    });

    expect(closeHandler).toHaveBeenCalledTimes(1);
  });
});
