import { MediaElement, render } from "./MediaElement";

it("render", () => {
  const element: MediaElement = {
    title: "Title",
    length: 123,
    path: "./media con espacios.mp4",
  };
  const actual = render(element);
  const expected =
        `\
#EXTM3U
#EXTINF:${element.length},${element.title}
./media%20con%20espacios.mp4
`;

  expect(actual).toBe(expected);
} );