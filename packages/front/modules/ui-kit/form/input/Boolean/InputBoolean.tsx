import { useId } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type Props = {
  className?: string;
  value: boolean;
  onChange: (val: boolean)=> void;
  label?: string;
};

export const DaInputBooleanCheckbox = ( { value, onChange, label, className }: Props) => {
  const id = useId();

  return (
    <label htmlFor={id} className={classes(styles.label, className)}>
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
};
