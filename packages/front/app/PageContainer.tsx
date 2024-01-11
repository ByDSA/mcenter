export default function PageContainer( { children } ) {
  return (
    <div className="container">
      <main className="main">
        {children}
      </main>
    </div>
  );
}