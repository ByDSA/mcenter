import { isRunning } from "#modules/utils";
import { VLC } from "./VLC";

it("isRunning no devuelve errores", async () => {
  await isRunning("vlc");
} );

it("se paran todas las instancias de VLC y isRunning(vlc) devuelve false", async () => {
  await VLC.closeAllAsync();

  const actual = await isRunning("vlc");

  expect(actual).toBeFalsy();
} );

it("se abre una instancia de VLC, luego se cierra y isRunning(vlc) devuelve false", async () => {
  const vlc = new VLC();

  await vlc.openAsync();
  vlc.close();

  const actual = await isRunning("vlc");

  expect(actual).toBeFalsy();
} );

it("se abre una instancia de VLC y isRunning(vlc) devuelve true", async () => {
  const vlc = new VLC();

  await vlc.openAsync();

  const actual = await isRunning("vlc");

  expect(actual).toBeTruthy();

  vlc.close();
} );