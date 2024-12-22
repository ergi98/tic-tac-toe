import { render, screen, act } from '../../test_utils';

import BaseTextField from './TextField';

describe('BaseTextField', () => {
  it('should render successfully', () => {
    render(<BaseTextField label="Test" />);

    const textField = screen.getByRole('textbox');

    expect(textField).toBeInTheDocument();
  });

  it('should render description if provided', () => {
    render(<BaseTextField label="Test" description="description" />);

    const description = screen.getByText(/description/i);

    expect(description).toBeInTheDocument();
  });

  it('should render error messaged if invalid', () => {
    render(<BaseTextField label="Test" errorMessage="Error message" />);

    const error = screen.getByText(/error message/i);

    expect(error).toBeInTheDocument();
  });

  it('should apply classes on focus', () => {
    render(
      <BaseTextField
        label="Test"
        errorMessage="Error message"
        focusClasses="focus-classes"
      />,
    );

    const textField = screen.getByRole('textbox');

    act(() => {
      textField.focus();
    });

    expect(textField).toHaveClass('focus-classes');
  });
});
