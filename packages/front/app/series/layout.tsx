import { PageContainer } from "app/PageContainer";
import { makeMenu } from "#modules/menus";

export default function SeriesLayout( { children }: {
  children: React.ReactNode;
} ) {
  const submenu = makeMenu( {
    "/series/history": "Historial",
    "/series/play": "Play",
    "/series/player": "Player",

  }, {
    type: "sub",
  } );

  return (
    <>
      {submenu}
      <PageContainer>
        <h1>Series</h1>
        {children}
      </PageContainer>
    </>);
}
