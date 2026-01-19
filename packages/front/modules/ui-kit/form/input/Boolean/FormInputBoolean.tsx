/* eslint-disable @typescript-eslint/naming-convention */
import { useId } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./FormInputBoolean.module.css";

// Reutilizamos estilos existentes si quieres
type Props = {
  className?: string;
  value: boolean;
  onChange: (val: boolean)=> void;
  label?: string;
};

export const FormInputBooleanCheckbox = ( { value, onChange, label, className }: Props) => {
  const id = useId();

  return (
    <span className={classes(styles.checkboxWrap, className)}>
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label && <label htmlFor={id}>{label}</label>}
    </span>
  );
};
