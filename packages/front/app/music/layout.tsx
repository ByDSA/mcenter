import { makeMenu } from "#modules/menus";
import PageContainer from "app/PageContainer";

export default function MusicLayout( {children}: {
  children: React.ReactNode;
} ) {
  const submenu = makeMenu( {
    "/music/history": "Historial",
  }, {
    type: "sub",
  } );

  return (
    <>
      {submenu}
      <PageContainer>
        <h1>Música</h1>
        {children}
      </PageContainer>
    </>);
}