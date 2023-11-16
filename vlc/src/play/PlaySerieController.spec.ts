import request from "supertest";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";

it("should call play function in PlayerService", async () => {
  const response = await request(routerApp).get(`/simpsons/${ EPISODES_SIMPSONS[0].episodeId}`)
    .expect(200);

  expect(response).toBeDefined();

  expect(playerServiceMock.play).toBeCalled();
  const expectedMediaElements = [
    {
      "length": EPISODES_SIMPSONS[0].end - EPISODES_SIMPSONS[0].start,
      "path": `${process.env.MEDIA_PATH }/${EPISODES_SIMPSONS[0].path}}`,
      "startTime": EPISODES_SIMPSONS[0].start,
      "stopTime": EPISODES_SIMPSONS[0].end,
      "title": EPISODES_SIMPSONS[0].title,
    },
  ];
  const actualMediaElements: MediaElement[] = playerServiceMock.play.mock.calls[0][0];

  expect(actualMediaElements.length).toBe(1);

  const actualMediaElement = actualMediaElements[0];

  expect(actualMediaElement.title).toBe(expectedMediaElements[0].title);
} );
