import { JSX, useLayoutEffect, useRef, useState } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  left?: JSX.Element;
  right?: JSX.Element;
  children: React.ReactNode;
  theme?: "blue" | "dark-gray" | "red" | "white";
  isSubmitting?: boolean;
};

export const DaButton = ( { children, left, right,
  isSubmitting = false,
  theme: propTheme, disabled, type = "button", ...buttonProps }: Props) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [isTheSubmitter, setIsTheSubmitter] = useState(false);

  useLayoutEffect(() => {
    if (ref.current) {
      const parentForm = ref.current.form;
      // Verificamos si es type="submit" o si no tiene type (lo cual es submit implícito)
      // Nota: Como ahora forzamos type="button" por defecto en las props (arriba),
      // 'isSubmitType' solo será true si explícitamente pasas type="submit"
      // o si cambiamos la lógica para permitir undefined.
      const isSubmitType = type === "submit";

      // Si hay un formulario y este botón es de tipo submit, asumimos que es el submitter.
      // (Ignoramos el chequeo de onsubmit porque en React no es fiable vía DOM)
      setIsTheSubmitter(!!parentForm && isSubmitType);
    }
  }, [type]);
  let content = (<>
    {left && <section className={styles.left}>{left}</section>}
    <section className={styles.childrenSection}>{children}</section>
    {right && <section className={styles.right}>{right}</section>}
  </>
  );
  const theme = propTheme ?? (isTheSubmitter ? "blue" : "dark-gray");

  return <button
    ref={ref}
    type={type}
    disabled={disabled || isSubmitting}
    {...buttonProps}
    className={classes(
      styles.button,
      theme === "blue" && styles.blue,
      theme === "white" && styles.white,
      theme === "dark-gray" && styles.darkGray,
      theme === "red" && styles.red,
      buttonProps.className,
      isSubmitting && styles.isSubmitting,
    )}
  >
    {content}
  </button>;
};
