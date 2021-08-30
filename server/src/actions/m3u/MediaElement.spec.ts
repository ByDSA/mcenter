import MediaElement, { render } from "./MediaElement";

it("render", () => {
  const element: MediaElement = {
    title: "Title",
    length: 123,
    path: "./media",
  };
  const actual = render(element);
  const expected = `\
#EXTM3U
#EXTINF:${element.length},${element.title}
${element.path}
`;

  expect(actual).toBe(expected);
} );
