import React, { useCallback, useRef, useState, useEffect } from "react";
import { FormInputNumber } from "#modules/ui-kit/form/input/Number/FormInputNumber";
import { FormInputBooleanCheckbox } from "#modules/ui-kit/form/input/Boolean/FormInputBoolean";
import { classes } from "#modules/utils/styles";
import styles from "./FormInputTime.module.css";

type Props = {
  value: number | null | undefined;
  onChange: (val: number | null)=> void;
  nullable?: boolean;
  isOptional?: boolean;
  disabled?: boolean;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FormInputTime = ( { value,
  onChange,
  nullable,
  isOptional,
  disabled = false }: Props) => {
  const isNullable = nullable || isOptional;
  const isNull = value === null || value === undefined;
  const [localSeconds, setLocalSeconds] = useState(value ?? 0);

  useEffect(() => {
    // Sincronizar estado local si el padre envía un valor válido
    if (value !== null && value !== undefined)
      setLocalSeconds(value);
  }, [value]);

  const minutes = Math.floor(localSeconds / 60);
  const seconds = localSeconds % 60;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const adjustTime = useCallback((delta: number) => {
    setLocalSeconds((prev) => {
      const next = Math.max(0, prev + delta);

      return next;
    } );
  }, []);

  // Efecto para propagar cambios locales al padre
  useEffect(() => {
    if (localSeconds !== value && value !== undefined)
      onChange(localSeconds);
  }, [localSeconds, onChange]);

  const startAdjusting = (delta: number) => {
    // No permitir ajustar si está deshabilitado
    if (disabled)
      return;

    adjustTime(delta);
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        adjustTime(delta);
      }, 50);
    }, 400);
  };
  const stopAdjusting = () => {
    if (timerRef.current)
      clearTimeout(timerRef.current);

    if (intervalRef.current)
      clearInterval(intervalRef.current);
  };
  const handleManualChange = (newMinutes: number, newSeconds: number) => {
    let m = isNaN(newMinutes) ? 0 : newMinutes;
    let s = isNaN(newSeconds) ? 0 : newSeconds;

    if (s >= 60) {
      m += Math.floor(s / 60);
      s %= 60;
    } else if (s < 0 && m > 0) {
      m -= 1;
      s = 59;
    }

    const total = Math.max(0, (m * 60) + s);

    setLocalSeconds(total);
    // Aquí llamamos a onChange directo porque es una acción explícita del usuario
    // y saca al componente del estado "Nulo" si lo tuviera.
    onChange(total);
  };
  const handleKeyDownSeconds = (e: React.KeyboardEvent) => {
    if (disabled)
      return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      adjustTime(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      adjustTime(-1);
    }
  };
  const handleKeyDownMinutes = (e: React.KeyboardEvent) => {
    if (disabled)
      return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      adjustTime(60);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      adjustTime(-60);
    }
  };
  const handleToggleNullable = (checked: boolean) => {
    onChange(checked ? null : localSeconds);
  };

  return (
    <div className={styles.container}>
      <div className={classes(
        styles.inputsWrapper,
        isNull && styles.isNull,
        disabled && styles.disabled,
      )}>
        <div className={styles.timeGroup}>
          <FormInputNumber
            value={minutes}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);

              handleManualChange(val, seconds);
            }}
            onKeyDown={handleKeyDownMinutes}
            disabled={disabled}
            className={styles.timeInput}
            decimals="integer"
          />
          <span className={styles.separator}>:</span>
          <FormInputNumber
            value={seconds}
            onChange={(e) => {
              const val = parseFloat(e.target.value);

              handleManualChange(minutes, val);
            }}
            onKeyDown={handleKeyDownSeconds}
            disabled={disabled}
            className={styles.timeInput}
            paddingZeroDigits={2}
            decimals="decimal"
            minDecimals={0}
            maxDecimals={1}
          />
        </div>
        <div className={styles.controls}>
          <button type="button"
            className={`${styles.controlBtn} ${styles.upBtn}`}
            onMouseDown={() => startAdjusting(1)}
            onMouseUp={stopAdjusting}
            onMouseLeave={stopAdjusting}
            disabled={disabled}
            tabIndex={-1}>
            <svg viewBox="0 0 10 6" className={styles.arrowIcon}><path d="M1 5L5 1L9 5" /></svg>
          </button>
          <button type="button"
            className={`${styles.controlBtn} ${styles.downBtn}`}
            onMouseDown={() => startAdjusting(-1)}
            onMouseUp={stopAdjusting}
            onMouseLeave={stopAdjusting}
            disabled={disabled}
            tabIndex={-1}>
            <svg viewBox="0 0 10 6" className={styles.arrowIcon}><path d="M1 1L5 5L9 1" /></svg>
          </button>
        </div>
      </div>

      {isNullable && (
        <div className={styles.toggleWrapper}>
          <FormInputBooleanCheckbox
            className={styles.nullCheckbox}
            value={isNull}
            onChange={handleToggleNullable}
            label="Nulo"
          />
        </div>
      )}
    </div>
  );
};
