import { makeMenu } from "#modules/menus";
import PageContainer from "app/PageContainer";
import "../../styles/globals.css";

export default function SeriesLayout( {children}: {
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
        <h1 className="title">
          Series
        </h1>
        {children}
      </PageContainer>
    </>);
}