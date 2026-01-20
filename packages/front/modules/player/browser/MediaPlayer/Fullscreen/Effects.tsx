import { CompressionSlider } from "./CompressionSlider";
import styles from "./Effects.module.css";
import { Title } from "./Title";

export const Effects = () => {
  return <main className={styles.container}>
    <Title>Efectos</Title>
    <CompressionSlider />
  </main>;
};
