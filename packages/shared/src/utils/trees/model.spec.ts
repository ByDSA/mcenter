import { deepCopy } from "../objects";
import { treePut } from "./model";

const root = {
  children: [{
    id: "serieA",
    children: [{
      id: "seasonB",
      children: [{
        id: "episodeC",
        content: "content",
      }],
    }],
  }],
};

it("put", () => {
  const used: typeof root = deepCopy(root);

  treePut(used, ["serieA", "seasonB"], "episodeD", "content");
  const actualD = used.children.find(
    (node) => node.id === "serieA",
  )?.children.find(
    (node) => node.id === "seasonB",
  )?.children.find((node) => node.id === "episodeD");

  expect(actualD).toBeDefined();
  expect(actualD?.id).toBe("episodeD");
  expect(actualD?.content).toBe("content");
} );
