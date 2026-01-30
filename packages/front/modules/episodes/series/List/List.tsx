import { classes } from "#modules/utils/styles";
import { SeriesEntity } from "../models";
import { SeriesListItem } from "./ListItem";
import styles from "./List.module.css";

type Entity = SeriesEntity;
type Props = {
  data: Entity[];
  className?: string;
};
export const SeriesList = (props: Props) => {
  return (
    <section className={classes(styles.list, props.className)}>
      {props.data.map((d, i) => {
        return <SeriesListItem key={d.id} data={d} index={i} />;
      } )}
    </section>
  );
};
