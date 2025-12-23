import { CompressionSlider } from "./CompressionSlider";
import styles from "./Effects.module.css";
import { Title } from "./Title";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Effects = () => {
  return <main className={styles.container}>
    <Title>Efectos</Title>
    <CompressionSlider />
  </main>;
};
