import { MediaElement } from "#modules/models";
import { render } from "./render-media-element";

it("render", () => {
  const element: MediaElement = {
    title: "Title",
    length: 123,
    type: "video",
    path: "./media con espacios.mp4",
  };
  const actual = render(element);
  const expected = `\
#EXTM3U
#EXTINF:${element.length},${element.title}
./media%20con%20espacios.mp4
`;

  expect(actual).toBe(expected);
} );
