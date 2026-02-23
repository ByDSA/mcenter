import { Title } from "../../../common/Title";
import { CompressionSlider } from "./CompressionSlider";
import styles from "./Effects.module.css";

export const Effects = () => {
  return <main className={styles.container}>
    <Title>Efectos</Title>
    <CompressionSlider />
  </main>;
};
