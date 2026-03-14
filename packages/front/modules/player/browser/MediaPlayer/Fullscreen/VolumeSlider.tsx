import React, { useId } from "react";
import { useVolumeControl } from "../useVolumeControl";
import styles from "./CompressionSlider.module.css";

const SLIDER_MIN = 0;
const SLIDER_MAX = 100;
const SLIDER_STEP = 1;

export const VolumeSlider = () => {
  const { volume, handleVolumeChange, volumeToVisual, visualToVolume } = useVolumeControl();
  // Posición visual normalizada → escala 0–100 para mostrar en este slider
  const sliderValue = Math.round(volumeToVisual(volume) * SLIDER_MAX);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderRaw = parseFloat(e.target.value);

    // Normalizamos a [0,1] y aplicamos el mapeo compartido
    handleVolumeChange(visualToVolume(sliderRaw / SLIDER_MAX));
  };
  const id = useId();

  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>
        Volumen:
      </label>
      <div className={styles.sliderWrapper}>
        <input
          id={id}
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={sliderValue}
          onChange={handleChange}
          className={styles.slider}
        />
        <span className={styles.valueDisplay}>{sliderValue}</span>
      </div>
    </div>
  );
};
