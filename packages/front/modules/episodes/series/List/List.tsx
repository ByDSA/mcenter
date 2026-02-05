import { classes } from "#modules/utils/styles";
import { SeriesListItem } from "./ListItem";
import styles from "./List.module.css";

type Props = {
  seriesIds: string[];
  className?: string;
};
export const SeriesList = (props: Props) => {
  return (
    <section className={classes(styles.list, props.className)}>
      {props.seriesIds.map((seriesId, i) => {
        return <SeriesListItem key={seriesId} seriesId={seriesId} index={i} />;
      } )}
    </section>
  );
};
