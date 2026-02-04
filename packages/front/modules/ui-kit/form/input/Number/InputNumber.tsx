import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { classes } from "#modules/utils/styles";
import { updateNull } from "../Text/InputText";
import textStyles from "../Text/styles.module.css";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  nullable?: boolean;
  paddingZeroDigits?: number;

  /**
   * "decimal": Permite decimales (comportamiento estándar).
   * "integer": Fuerza el valor a entero (0 decimales).
   * @default "decimal"
   */
  decimals?: "decimal" | "integer";

  /**
   * Número máximo de decimales permitidos.
   */
  maxDecimals?: number;

  /**
   * Número mínimo de decimales a mostrar.
   * @default 0
   */
  minDecimals?: number;
};

export const DaInputNumber = forwardRef<HTMLInputElement, Props>(
  (
    { className,
      nullable,
      onChange,
      onBlur,
      paddingZeroDigits,
      decimals = "decimal",
      maxDecimals,
      minDecimals = 0,
      step,
      ...props },
    ref,
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => internalRef.current!);

    const [initialValue, setInitialValue] = useState<string | undefined>(
      props.defaultValue?.toString() ?? props.value?.toString(),
    );

    useEffect(() => {
      if (initialValue === undefined && internalRef.current)
        setInitialValue(internalRef.current.value);
    }, []);
    const getFormattedValue = useCallback((val: string) => {
      if (val === "")
        return "";

      const num = parseFloat(val);

      if (isNaN(num))
        return val;

      // Calcular límites de decimales
      const dMin = decimals === "integer" ? 0 : minDecimals;
      const dMax = decimals === "integer" ? 0 : maxDecimals;
      // Obtener decimales actuales para no recortar mientras el usuario escribe si no hay max
      const currentDecimals = (val.split(".")[1] || "").length;
      let targetDecimals = Math.max(dMin, 0, currentDecimals);

      if (typeof dMax === "number")
        targetDecimals = Math.min(targetDecimals, dMax);

      let formatted = num.toFixed(targetDecimals);

      // Aplicar padding de ceros a la izquierda
      if (paddingZeroDigits) {
        const parts = formatted.split(".");

        parts[0] = parts[0].padStart(paddingZeroDigits, "0");
        formatted = parts.join(".");
      }

      return formatted;
    }, [decimals, maxDecimals, minDecimals, paddingZeroDigits]);
    const updateToFormated = (e: React.ChangeEvent<HTMLInputElement> |
      React.FocusEvent<HTMLInputElement>) => {
      const currentVal = e.target.value;
      const formatted = getFormattedValue(currentVal);

      if (formatted !== currentVal && formatted !== "") {
        e.target.value = formatted;

        if (onChange) {
          const event = {
            ...e,
            target: e.target,
            type: "change",
          } as unknown as React.ChangeEvent<HTMLInputElement>;

          onChange(event);
        }

        return true;
      }

      return false;
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNull(e.target, nullable);

      onChange?.(e);
    };
    const restoreToInitialValue = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      const restored = initialValue?.toString() ?? "";

      if (restored !== "") {
        e.target.value = restored;

        // Disparamos onChange manualmente para que
        // el estado interno (ej. RHF) no se quede con NaN o ""
        if (onChange) {
          const event = {
            ...e,
            type: "change",
          } as unknown as React.ChangeEvent<HTMLInputElement>;

          onChange(event);
        }
      }
    }, [initialValue, onChange]);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.target.value === "")
        restoreToInitialValue(e);

      updateToFormated(e);

      onBlur?.(e);
    };
    const targets = {
      max: decimals === "integer" ? 0 : maxDecimals,
    };
    const derivedStep = step
      ?? (targets.max !== undefined ? (10 ** -targets.max).toFixed(targets.max) : "any");
    const inputValue = props.value !== undefined
      ? getFormattedValue(props.value.toString())
      : undefined;

    return (
      <input
        {...props}
        ref={internalRef}
        type="number"
        step={derivedStep}
        className={classes(
          "ui-kit-input-number",
          textStyles.input,
          nullable && textStyles.nullable,
          className,
        )}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  },
);

DaInputNumber.displayName = "DaInputNumber";
