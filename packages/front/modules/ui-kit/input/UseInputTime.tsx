import { useMemo, useRef } from "react";
import { classes } from "#modules/utils/styles";
import { OnChange, UseInputProps } from "./InputCommon";
import { OnPressEnter } from "./UseInputText";
import { useInputNumber } from "./UseInputNumber";

export type UseInputTimeProps = UseInputProps<number> & {
  onPressEnter?: OnPressEnter<number>;
  isOptional?: boolean;
  step?: number;
  minSeconds?: number;
  maxSeconds?: number;
};

const secondsToTimeString = (totalSeconds: number |
  null): { minutes: number;
seconds: number; } => {
  if (totalSeconds === null) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    minutes,
    seconds,
  };
};
const timeToSeconds = (minutes: number | null, seconds: number | null): number => {
  const m = minutes ?? 0;
  const s = seconds ?? 0;

  if (m === 0 && s === 0)
    return 0;

  return (m * 60) + s;
};

export function useInputTime(props: UseInputTimeProps) {
  const { onPressEnter,
    defaultValue = 0,
    isOptional,
    disabled = false,
    nullChecked,
    step = 1,
    minSeconds = 0,
    maxSeconds } = props;
  const initialTime = secondsToTimeString(defaultValue);
  const customOnPressEnter = onPressEnter
    ? () => {
      if (typeof onPressEnter === "function")
        onPressEnter(totalSeconds);
    }
    : undefined;
  const minutes = useInputNumber( {
    defaultValue: initialTime.minutes,
    isOptional,
    disabled,
    nullChecked,
    onPressEnter: customOnPressEnter,
  } );
  const seconds = useInputNumber( {
    defaultValue: initialTime.seconds,
    isOptional,
    disabled,
    nullChecked,
    minDigits: 2,
    onPressEnter: customOnPressEnter,
  } );
  const totalSeconds = useMemo(() => {
    return timeToSeconds(minutes.value ?? 0, seconds.value ?? 0);
  }, [minutes.value, seconds.value]);
  const totalSecondsRef = useRef(totalSeconds);
  const newTotalSecondsRef = useRef(totalSeconds);

  totalSecondsRef.current = totalSeconds;
  newTotalSecondsRef.current = totalSeconds;
  const adjustSeconds = (delta: number) => {
    const currentSeconds = seconds.value ?? 0;
    let newSeconds = currentSeconds + delta;
    let newMinutes = minutes.value ?? 0;

    if (newSeconds >= 60) {
      newMinutes += Math.floor(newSeconds / 60);
      newSeconds %= 60;
    } else if (newSeconds < 0) {
      const minutesToSubtract = Math.ceil(Math.abs(newSeconds) / 60);

      newMinutes -= minutesToSubtract;
      newSeconds = 60 - (Math.abs(newSeconds) % 60);

      if (newSeconds === 60)
        newSeconds = 0;
    }

    const newTotal = timeToSeconds(newMinutes, newSeconds);

    if (newTotal !== null) {
      if (newTotal < minSeconds) {
        const limited = secondsToTimeString(minSeconds);

        minutes.setValue(limited.minutes);
        seconds.setValue(limited.seconds);

        return;
      }

      if (maxSeconds !== undefined && newTotal > maxSeconds) {
        const limited = secondsToTimeString(maxSeconds);

        minutes.setValue(limited.minutes);
        seconds.setValue(limited.seconds);

        return;
      }
    }

    if (newMinutes < 0) {
      minutes.setValue(0);
      seconds.setValue(0);

      return;
    }

    minutes.setValue(newMinutes);
    seconds.setValue(truncSecs(newSeconds));

    if (newSeconds !== seconds.value) {
      newTotalSecondsRef.current = newTotal;
      seconds.callHandle(newTotal, totalSeconds);
    }

    if (newMinutes !== minutes.value) {
      minutes.callHandle(newTotal, totalSeconds);
      newTotalSecondsRef.current = newTotal;
    }
  };
  const setValue = (newValue: number | null) => {
    if (newValue === null) {
      minutes.setValue(null);
      seconds.setValue(null);

      return;
    }

    const time = secondsToTimeString(newValue);

    minutes.setValue(time.minutes);
    seconds.setValue(time.seconds);
  };
  const element = (
    <div className={classes("ui-kit-input-time", disabled ? "disabled" : "")}>
      <div className="time-inputs">
        <div className="time-input-group">
          {minutes.element}
          <span className="time-separator">:</span>
        </div>
        <div className="time-input-group">
          {seconds.element}
        </div>
      </div>
      <div className="time-controls">
        <button
          type="button"
          tabIndex={-1}
          className="time-control-btn time-control-up"
          disabled={disabled}
          onMouseDown={(e) => {
            e.preventDefault(); // Previene que el botón reciba foco al hacer clic
            seconds.ref.current?.focus();
          }}
          onClick={(e) => {
            e.preventDefault();
            adjustSeconds(step);
          }}
          aria-label="Incrementar segundos"
        >
          ▲
        </button>
        <button
          type="button"
          tabIndex={-1}
          className="time-control-btn time-control-down"
          disabled={disabled}
          onMouseDown={(e) => {
            e.preventDefault(); // Previene que el botón reciba foco al hacer clic
            seconds.ref.current?.focus();
          }}
          onClick={(e) => {
            e.preventDefault();
            adjustSeconds(-step);
          }}
          aria-label="Decrementar segundos"
        >
          ▼
        </button>
      </div>
    </div>
  );
  const secondsRef = useRef(seconds);
  const minutesRef = useRef(minutes);

  secondsRef.current = seconds;
  minutesRef.current = minutes;

  return {
    element,
    value: totalSeconds,
    setValue,
    addOnBlur: (fn: ()=> void)=> {
      seconds.addOnBlur(()=> {
        if (secondsRef.current.value === null)
          secondsRef.current.setValue(0);

        fn();
      } );
      minutes.addOnBlur(()=> {
        if (minutesRef.current.value === null)
          minutesRef.current.setValue(0);

        fn();
      } );
    },
    addOnChange: (fn: OnChange<number | null>)=>{
      seconds.addOnChange((newValue, _oldValue)=> {
        // Cambio por input texto
        if (newTotalSecondsRef.current === totalSecondsRef.current) {
          const mins = Math.floor((totalSecondsRef.current ?? 0) / 60);
          const limitedSecs = limitSecs0To59AndFix2Dec(newValue ?? 0);
          const newTotal = (mins * 60) + limitedSecs;

          // Aplicar limitador a la vista
          if ((newValue ?? 0) !== limitedSecs)
            setValue(newTotal);

          fn(newTotal, totalSecondsRef.current);

          return;
        }

        // Cambio por input flechas
        fn(newTotalSecondsRef.current, totalSecondsRef.current);
      } );
      minutes.addOnChange((newValue, oldValue)=> {
        // Cambio por input texto
        if (newTotalSecondsRef.current === totalSecondsRef.current) {
          const secs = (totalSecondsRef.current ?? 0) - ((oldValue ?? 0) * 60);
          const newTotal = ((newValue ?? 0) * 60) + secs;

          fn(newTotal, totalSecondsRef.current);

          return;
        }

        // Cambio por input flechas
        fn(newTotalSecondsRef.current, totalSecondsRef.current);
      } );
    },
  };
}

function limitSecs0To59AndFix2Dec(secs: number): number {
  if (secs > 59)
    return 59;

  if (secs < 0)
    return 0;

  return truncSecs(secs);
}

const truncarString = (num: number, decimales: number = 2): string => {
  const str = num.toString();
  const index = str.indexOf(".");

  if (index === -1)
    return str;

  return str.slice(0, index + decimales + 1);
};

function truncSecs(secs: number, decs: number = 2): number {
  return +truncarString(secs, decs);
}
