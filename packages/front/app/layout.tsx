import "../styles/globals.css";

export default function RootLayout( {children}: {
  children: React.ReactNode;
} ) {
  return (
    <html lang="es">
      <head>
        <title>MCenter</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <nav>
          <main className="main">
            <a href="/">Inicio</a>
            <a href="/actions">Actions</a>
            <a href="/history">H. Episodes</a>
            <a href="/music-history">H. Música</a>
            <a href="/play">Play</a>
            <a href="/player">Player</a>
          </main>
        </nav>

        <div className="container">
          <main className="main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}