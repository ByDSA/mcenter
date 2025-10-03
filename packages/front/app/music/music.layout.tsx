/* eslint-disable import/no-default-export */
import { PageContainer } from "app/PageContainer";
import { TabsContainer } from "app/TabsContainer";

type Props = {
  children: React.ReactNode;
};

export default function MusicLayout( { children }: Props) {
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
        <PageContainer>
          {children}
        </PageContainer>
      </TabsContainer>
    </>);
}
