import VLCProcess from "./VLCProcess";

it("isRunning no devuelve errores", async () => {
  await VLCProcess.isRunningAsync();
} );

it("se paran todas las instancias de VLC y isRunning(vlc) devuelve false", async () => {
  await VLCProcess.closeAllAsync();

  const actual = await VLCProcess.isRunningAsync();

  expect(actual).toBeFalsy();
} );

it("se abre una instancia de VLC, luego se cierra y isRunning(vlc) devuelve false", async () => {
  const vlc = await VLCProcess.builder()
    .buildAsync();

  vlc.close();

  const actual = await VLCProcess.isRunningAsync();

  expect(actual).toBeFalsy();
} );

it("se abre una instancia de VLC y isRunning(vlc) devuelve true", async () => {
  const vlc = await VLCProcess.builder()
    .buildAsync();
  const actual = await VLCProcess.isRunningAsync();

  expect(actual).toBeTruthy();

  vlc.close();
} );