import { PATH_ROUTES } from "$shared/routing";
import { ComponentProps } from "react";
import { PageContainer } from "#modules/ui-kit/layouts/PageContainer/PageContainer";
import { TabsContainer } from "#modules/ui-kit/layouts/TabsContainer/TabsContainer";
import { i18nServerContext } from "#modules/core/i18n/server-locale";
import styles from "./styles.module.css";

export default async function SeriesLayout(
  { children }: Pick<ComponentProps<typeof PageContainer>, "children">,
) {
  const { LL } = await i18nServerContext();
  const data = [
    {
      path: PATH_ROUTES.episodes.frontend.lists.path,
      label: LL.modules.episodes.series.lists.tab(),
    },
    {
      path: PATH_ROUTES.episodes.frontend.history.path,
      label: LL.modules.resources.history.history(),
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
