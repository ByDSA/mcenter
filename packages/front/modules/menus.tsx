type Data = Record<string, string>;

type Params = {
  type: "main" | "sub";
};
export function makeMenu(data: Data, params?: Params) {
  const navClassName = params?.type === "sub" ? "sub-nav" : "main-nav";

  return (
    <nav className={navClassName}>
      <main>
        {Object.entries(data).map(([key, value]) => (
          <a key={key} href={key}>{value}</a>
        ))}
      </main>
    </nav>
  );
}
