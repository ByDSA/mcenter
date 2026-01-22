import { JSX, RefObject, useLayoutEffect, useRef, useState } from "react";
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
  theme: propTheme, disabled, type = "button", onMouseUp, ...buttonProps }: Props) => {
  const ref = useRef<HTMLButtonElement>(null);
  const isTheSubmitter = useButtonIsSubmitter( {
    ref,
    type,
  } );
  let content = (<>
    {left && <section className={styles.left}>{left}</section>}
    <section className={styles.childrenSection}>{children}</section>
    {right && <section className={styles.right}>{right}</section>}
  </>
  );
  const theme = propTheme ?? (isTheSubmitter ? "blue" : "dark-gray");
  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    onMouseUp?.(e);
    // Quita el foco visual tras el click
    e.currentTarget.blur();
  };

  return <button
    ref={ref}
    disabled={disabled || isSubmitting}
    type={isTheSubmitter ? "submit" : type}
    onMouseUp={handleMouseUp}
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

type SubmitterProps = {
  ref: RefObject<HTMLButtonElement | null>;
  type: string;
};
const useButtonIsSubmitter = ( { ref, type }: SubmitterProps) => {
  const [isTheSubmitter, setIsTheSubmitter] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current)
      return;

    const button = ref.current;
    const { form } = button;

    if (!form) {
      setIsTheSubmitter(false);

      return;
    }

    // 1. Caso explícito: type="submit"
    if (type === "submit") {
      setIsTheSubmitter(true);

      return;
    }

    // 2. Buscar si existe algún submit explícito en el form
    const hasExplicitSubmit = form.querySelector(
      "button[type=\"submit\"], input[type=\"submit\"]",
    );

    if (hasExplicitSubmit) {
    // Si existe un submit explícito, este botón nunca es submitter
      setIsTheSubmitter(false);

      return;
    }

    // 3. No hay submit explícito: buscamos botones type="button" o sin type
    const candidateButtons = Array.from(
      form.querySelectorAll<HTMLButtonElement>("button"),
    ).filter((btn) => {
      const btnType = btn.getAttribute("type");

      return btnType === null || btnType === "button";
    } );
    const isLastCandidate = candidateButtons.length > 0
    && candidateButtons[candidateButtons.length - 1] === button;

    setIsTheSubmitter(isLastCandidate);
  }, [type]);

  return isTheSubmitter;
};
