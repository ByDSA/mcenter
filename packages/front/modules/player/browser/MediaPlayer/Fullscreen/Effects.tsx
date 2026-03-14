import { Title } from "../../../common/Title";
import { CompressionSlider } from "./CompressionSlider";
import { VolumeSlider } from "./VolumeSlider";
import styles from "./Effects.module.css";

export const Effects = () => {
  return (
    <main className={styles.container}>
      <Title>Efectos</Title>
      <VolumeSlider />
      <CompressionSlider />
    </main>
  );
};
