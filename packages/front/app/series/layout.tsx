import { PATH_ROUTES } from "$shared/routing";
import { ComponentProps } from "react";
import { PageContainer } from "#modules/ui-kit/layouts/PageContainer/PageContainer";
import { TabsContainer } from "#modules/ui-kit/layouts/TabsContainer/TabsContainer";
import styles from "./styles.module.css";

export default function SeriesLayout(
  { children }: Pick<ComponentProps<typeof PageContainer>, "children">,
) {
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
        <PageContainer
          className={styles.page}
        >
          {children}
        </PageContainer>
      </TabsContainer>
    </>);
}
