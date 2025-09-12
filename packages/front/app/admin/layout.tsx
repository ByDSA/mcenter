import { PageContainer } from "app/PageContainer";
import { makeMenu } from "#modules/menus";

import "./page.css";

export default function MusicLayout( { children }: {
  children: React.ReactNode;
} ) {
  const submenu = makeMenu( {
    "/admin/": "-",
  }, {
    type: "sub",
  } );

  return (
    <>
      {submenu}
      <PageContainer>
        <h1>Admin</h1>
        {children}
      </PageContainer>
    </>);
}
