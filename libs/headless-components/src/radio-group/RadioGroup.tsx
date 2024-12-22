import React, { ReactElement, ReactNode, useRef } from 'react';

import { RadioGroupState, useRadioGroupState } from 'react-stately';
import {
  useRadio,
  useFocusRing,
  useRadioGroup,
  VisuallyHidden,
  type AriaRadioProps,
  type AriaRadioGroupProps,
} from 'react-aria';

interface IRadioGroup extends AriaRadioGroupProps {
  children: ReactNode;
}

const RadioContext = React.createContext<RadioGroupState>(
  {} as RadioGroupState,
);

const RadioGroup: React.FC<IRadioGroup> = (props) => {
  const radioState = useRadioGroupState(props);
  const groupProps = useRadioGroup(props, radioState);
  return (
    <div {...groupProps.radioGroupProps}>
      <VisuallyHidden>
        <span {...groupProps.labelProps}>{props.label}</span>
      </VisuallyHidden>
      <RadioContext.Provider value={radioState}>
        {props.children}
      </RadioContext.Provider>
    </div>
  );
};

interface IRadio extends AriaRadioProps {
  children: ReactElement;
}

const Radio: React.FC<IRadio> = (props) => {
  const inputRef = useRef(null);
  const radioState = React.useContext(RadioContext);
  const radioProps = useRadio(props, radioState, inputRef);
  const { isFocusVisible, focusProps } = useFocusRing();

  return (
    <label>
      <VisuallyHidden>
        <input {...radioProps.inputProps} {...focusProps} ref={inputRef} />
      </VisuallyHidden>
      {React.cloneElement(props.children, {
        isFocusVisible,
        isSelected: radioProps.isSelected,
      })}
    </label>
  );
};

export default RadioGroup;
export { Radio };
