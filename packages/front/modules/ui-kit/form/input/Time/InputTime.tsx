import React, { useCallback, useRef, useState, useEffect } from "react";
import { DaInputNumber } from "#modules/ui-kit/form/input/Number/InputNumber";
import { DaInputBooleanCheckbox } from "#modules/ui-kit/form/input/Boolean/InputBoolean";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type Props = {
  value: number | null;
  onChange: (val: number | null)=> void;
  nullable?: boolean;
  disabled?: boolean;
};

export const DaInputTime = ( { value,
  onChange,
  nullable,
  disabled = false }: Props) => {
  // Determinamos si el valor externo es nulo
  const isExternalNull = value === null || value === undefined;
  // ghostValue mantiene el valor numérico para los inputs.
  // Inicialmente es null si value es null, así los inputs se ven vacíos.
  const [ghostValue, setGhostValue] = useState<number | null>(value ?? null);
  // Ref para acceder al valor más reciente en intervalos/eventos sin dependencias circulares
  const ghostValueRef = useRef(ghostValue);

  useEffect(() => {
    ghostValueRef.current = ghostValue;
  }, [ghostValue]);

  // Sincronización: Si el padre envía un número, actualizamos el ghostValue.
  // Si envía null, NO lo actualizamos para mantener el valor visual (fantasma).
  useEffect(() => {
    if (value !== null && value !== undefined)
      setGhostValue(value);
  }, [value]);

  // El valor base para mostrar es el valor real si existe, o el fantasma si el real es null.
  // Si ambos son null, los minutos/segundos serán null (inputs vacíos).
  const displayBase = value !== null && value !== undefined ? value : ghostValue;
  const minutes = displayBase === null ? null : Math.floor(displayBase / 60);
  const seconds = displayBase === null ? null : displayBase % 60;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const updateValue = useCallback((newTotal: number) => {
    setGhostValue(newTotal);
    onChange(newTotal);
  }, [onChange]);
  const adjustTime = useCallback((delta: number) => {
    // Si estaba vacío (null), partimos de 0
    const current = ghostValueRef.current ?? 0;
    const next = Math.max(0, current + delta);

    updateValue(next);
  }, [updateValue]);
  const startAdjusting = (delta: number) => {
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
    const m = isNaN(newMinutes) ? 0 : newMinutes;
    const s = isNaN(newSeconds) ? 0 : newSeconds;
    let totalSeconds = (m * 60) + s;

    if (totalSeconds < 0)
      totalSeconds = 0;

    updateValue(totalSeconds);
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
    if (checked)
      onChange(null);
    else {
      // Al quitar el null, usamos el valor fantasma o 0 si nunca hubo nada
      onChange(ghostValue ?? 0);
    }
  };

  return (
    <div className={styles.container}>
      <div className={classes(
        styles.inputsWrapper,
        isExternalNull && styles.isNull,
        disabled && styles.disabled,
      )}>
        <div className={styles.timeGroup}>
          <DaInputNumber
            // Usamos undefined si es null para que el input se vea vacío
            value={minutes ?? undefined}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);

              handleManualChange(val, seconds ?? 0);
            }}
            onKeyDown={handleKeyDownMinutes}
            disabled={disabled}
            className={styles.timeInput}
            decimals="integer"
          />
          <span className={styles.separator}>:</span>
          <DaInputNumber
            value={seconds ?? undefined}
            onChange={(e) => {
              const val = parseFloat(e.target.value);

              handleManualChange(minutes ?? 0, val);
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

      {nullable && (
        <div className={styles.toggleWrapper}>
          <DaInputBooleanCheckbox
            className={styles.nullCheckbox}
            value={isExternalNull}
            onChange={handleToggleNullable}
            label="Nulo"
          />
        </div>
      )}
    </div>
  );
};
