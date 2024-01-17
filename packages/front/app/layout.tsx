import { makeMenu } from "#modules/menus";
import "../styles/globals.css";

export default function RootLayout( {children}: {
  children: React.ReactNode;
} ) {
  const menu = makeMenu( {
    "/" : "Inicio",
    "/actions" : "Actions",
    "/series/history" : "Series",
    "/music/history" : "Música",
  } );

  return (
    <html lang="es">
      <head>
        <title>MCenter</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {menu}

        {children}
      </body>
    </html>
  );
}