import { useEffect, useId, useState } from "react";
import { useOnChanges } from "./InputCommon";

import "./UseChekboxOptional.css";

export type UseOptionalProps = {
  isUndefined: boolean;
  isOptional?: boolean;
  disabled?: boolean;
};

export function useOptional( { isUndefined,
  disabled,
  isOptional = false }: UseOptionalProps) {
  const optionalId = useId();
  const [checked, setChecked] = useState(isUndefined);

  useEffect(() => {
    setChecked(isUndefined);
  }, [isUndefined]);
  const { addOnChange, handleChange } = useOnChanges<boolean, HTMLInputElement>( {
    inputToValue: (t)=>t.checked,
    setValue: setChecked,
    value: checked,
  } );
  const checkboxOptionalElement: React.ReactNode = (
    <span className="checkbox-optional">
      <input
        id={optionalId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
      />
      <label htmlFor={optionalId}>Nulo</label>
    </span>
  );

  return {
    checkboxOptionalElement: isOptional ? checkboxOptionalElement : null,
    checked,
    disabled: disabled || (isOptional && checked),
    addOnChange,
  };
}
