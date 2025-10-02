import { PageContainer } from "app/PageContainer";
import { TabsContainer } from "app/TabsContainer";

export default function SeriesLayout( { children }: {
  children: React.ReactNode;
} ) {
  const data = [
    {
      path: "/series/history",
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
        <PageContainer>
          {children}
        </PageContainer>
      </TabsContainer>
    </>);
}
