import { PageContainer } from "app/PageContainer";
import { TabsContainer } from "app/TabsContainer";

export default function PlayerLayout( { children }: {
  children: React.ReactNode;
} ) {
  const data = [{
    path: "/player/remote",
    label: "Remote",
  }, {
    path: "/player/browser",
    label: "Browser",
  }];

  return (
    <>
      <TabsContainer data={data}>
        <PageContainer>
          {children}
        </PageContainer>
      </TabsContainer>
    </>);
}
