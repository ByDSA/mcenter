
it("fetch to danisales", async () => {
  await fetch("https://danisales.es");
}, 3000);

it("fetch to mcenter", async () => {
  await fetch("https://mcenter.danisales.es");
}, 3000);

it("fetch to null should fail", () => {
  const f = () => fetch("https://null.danisales.es");

  expect(f).rejects.toThrow(new TypeError("fetch failed"));
}, 3000);
