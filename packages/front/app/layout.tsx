import { makeMenu } from "#modules/menus";
import { InitApis } from "#modules/core/initApis";
import "../styles/globals.css";

export default function RootLayout( { children }: {
  children: React.ReactNode;
} ) {
  const menu = makeMenu( {
    "/": "Inicio",
    "/admin": "Admin",
    "/series/history": "Series",
    "/music/history": "Música",
  } );

  return (
    <html lang="es">
      <head>
        <title>MCenter</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <InitApis />
        {menu}

        {children}
      </body>
    </html>
  );
}
