import { render, screen, act } from '../../test_utils';

import userEvent from '@testing-library/user-event';

import RadioGroup, { Radio } from './RadioGroup';

describe('RadioGroup', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });

  it('should render successfully', () => {
    render(
      <RadioGroup label="Test" value="test-one">
        <Radio value="test-one">
          <span>Test One</span>
        </Radio>
        <Radio value="test-two">
          <span>Test Two</span>
        </Radio>
      </RadioGroup>,
    );

    const radioGroup = screen.getByRole('radiogroup');
    const radioOptions = screen.getAllByRole('radio');

    expect(radioGroup).toBeInTheDocument();
    expect(radioOptions).toHaveLength(2);
  });

  it('should call onChange handler when selecting option', async () => {
    const user = userEvent.setup();
    const changeHandler = jest.fn();
    render(
      <RadioGroup label="Test" value="test-two" onChange={changeHandler}>
        <Radio value="test-one">
          <span>Test One</span>
        </Radio>
        <Radio value="test-two">
          <span>Test Two</span>
        </Radio>
      </RadioGroup>,
    );

    const radioOptions = screen.getAllByRole('radio');

    expect(radioOptions).toHaveLength(2);

    await act(async () => {
      await user.click(radioOptions[0]);
    });

    expect(changeHandler).toHaveBeenCalledTimes(1);
  });

  it('should not call onChange handler when selecting selected option', async () => {
    const user = userEvent.setup();
    const changeHandler = jest.fn();
    render(
      <RadioGroup label="Test" value="test-one" onChange={changeHandler}>
        <Radio value="test-one">
          <span>Test One</span>
        </Radio>
        <Radio value="test-two">
          <span>Test Two</span>
        </Radio>
      </RadioGroup>,
    );

    const radioOptions = screen.getAllByRole('radio');

    expect(radioOptions).toHaveLength(2);

    await act(async () => {
      await user.click(radioOptions[0]);
    });

    expect(changeHandler).toHaveBeenCalledTimes(0);
  });

  it('should not call onChange handler when disabled', async () => {
    const user = userEvent.setup();
    const changeHandler = jest.fn();
    render(
      <RadioGroup
        isDisabled
        label="Test"
        value="test-one"
        onChange={changeHandler}
      >
        <Radio value="test-one">
          <span>Test One</span>
        </Radio>
        <Radio value="test-two">
          <span>Test Two</span>
        </Radio>
      </RadioGroup>,
    );

    const radioOptions = screen.getAllByRole('radio');

    expect(radioOptions).toHaveLength(2);

    await act(async () => {
      await user.click(radioOptions[0]);
      await user.click(radioOptions[1]);
    });

    expect(changeHandler).toHaveBeenCalledTimes(0);
  });
});
