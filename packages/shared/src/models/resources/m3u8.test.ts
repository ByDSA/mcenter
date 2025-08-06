import { MediaElement } from "../player";
import { genM3u8Item } from "./m3u8.view";

it("item", () => {
  const element: MediaElement = {
    title: "Title",
    length: 123,
    type: "video",
    path: "./media con espacios.mp4",
  };
  const actual = genM3u8Item(element);
  const expected = `\
#EXTM3U
#EXTINF:${element.length},${element.title}
./media%20con%20espacios.mp4
`;

  expect(actual).toBe(expected);
} );
