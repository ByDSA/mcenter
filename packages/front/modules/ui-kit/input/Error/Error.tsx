import { FieldErrors, FieldNamesMarkedBoolean, FieldPath, FieldValues } from "react-hook-form";
import styles from "./Error.module.css";

type ErrorProps<T extends FieldValues> = {
  errors: FieldErrors<T>;
  touchedFields: FieldNamesMarkedBoolean<T>;
  keyName: FieldPath<T>;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ErrorView = <T extends FieldValues>( { errors,
  keyName,
  touchedFields }: ErrorProps<T>) => {
  const error = errors[keyName];

  if (!touchedFields[keyName as any] || !error || !error.message)
    return null;

  return (
    <p className={styles.error}>
      {error.message as string}
    </p>
  );
};
