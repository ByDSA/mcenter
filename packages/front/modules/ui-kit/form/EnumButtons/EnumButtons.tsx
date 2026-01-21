import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  currentValue: T;
  onChange: (value: T)=> void;
};

export const DaEnumButtons = <T extends string>( { options,
  currentValue,
  onChange }: Props<T>) => {
  return (
    <div className={styles.container}>
      {options.map((opt) => {
        const isActive = currentValue === opt.value;

        return (
          <DaButton
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            theme="white"
            className={classes(styles.toggleButton, isActive ? styles.active : styles.inactive)}
          >
            {opt.label}
          </DaButton>
        );
      } )}
    </div>
  );
};
