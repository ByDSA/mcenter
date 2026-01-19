import { SearchBar } from "../../musics/search/SearchBar";
import styles from "./page.module.css";

export default function MusicTopBar() {
  return <span className={styles.container}>
    <SearchBar />
  </span>;
}
