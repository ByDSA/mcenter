import React from "react";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import styles from "./CompressionSlider.module.css";

export const CompressionSlider = () => {
  // Obtenemos el valor interno (0 a 1) y la función para actualizarlo
  const compressionValue = useBrowserPlayer((s) => s.compressionValue);
  const setCompressionValue = useBrowserPlayer((s) => s.setCompressionValue);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const visualValue = parseFloat(e.target.value);

    // Convertimos el valor visual (0-10) al valor interno (0-1)
    setCompressionValue(visualValue / 10);
  };

  return (
    <div className={styles.container}>
      <label htmlFor="compression-slider" className={styles.label}>
        Compresión:
      </label>
      <div className={styles.sliderWrapper}>
        <input
          id="compression-slider"
          type="range"
          min="0"
          max="10"
          value={compressionValue * 10}
          onChange={handleChange}
          className={styles.slider}
        />
        <span className={styles.valueDisplay}>
          {(compressionValue * 10).toFixed(0)}
        </span>
      </div>
    </div>
  );
};
