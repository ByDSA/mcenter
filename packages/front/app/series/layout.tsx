import { PATH_ROUTES } from "$shared/routing";
import { PageContainer } from "app/PageContainer";
import { TabsContainer } from "app/TabsContainer";
import styles from "./styles.module.css";

export default function SeriesLayout( { children }: {
  children: React.ReactNode;
} ) {
  const data = [
    {
      path: PATH_ROUTES.episodes.frontend.lists.path,
      label: "Explorar",
    },
    {
      path: PATH_ROUTES.episodes.frontend.history.path,
      label: "Historial",
    },
    {
      path: "/series/play",
      label: "Play",
    },
  ];

  return (
    <>
      <TabsContainer data={data}>
        <PageContainer className={styles.page}>
          {children}
        </PageContainer>
      </TabsContainer>
    </>);
}
