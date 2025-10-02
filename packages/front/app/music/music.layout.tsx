/* eslint-disable import/no-default-export */
import { PageContainer, PageContainerProps } from "app/PageContainer";
import { TabsContainer } from "app/TabsContainer";

type MusicLayoutProps = {
  pageContainerProps?: PageContainerProps;
};
type Props = {
  children: React.ReactNode;
  props?: MusicLayoutProps;
};

export default function MusicLayout( { children, props }: Props) {
  const data = [
    {
      label: "Historial",
      path: "/music/history",
    },
    {
      label: "Buscar",
      path: "/music/search",
    },
    {
      label: "Playlists",
      path: "/music/playlists",
    },
    {
      label: "Subir",
      path: "/music/upload",
    },
  ];

  return (
    <>
      <TabsContainer data={data}>
        <PageContainer props={props?.pageContainerProps}>
          {children}
        </PageContainer>
      </TabsContainer>
    </>);
}
