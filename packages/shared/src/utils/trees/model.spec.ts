import { deepCopy } from "../objects";
import { treePut } from "./model";

const root = {
  children: [{
    key: "serieA",
    children: [{
      key: "seasonB",
      children: [{
        key: "episodeC",
        content: "content",
      }],
    }],
  }],
};

it("put", () => {
  const used: typeof root = deepCopy(root);

  treePut(used, ["serieA", "seasonB"], "episodeD", "content");
  const actualD = used.children.find(
    (node) => node.key === "serieA",
  )?.children.find(
    (node) => node.key === "seasonB",
  )?.children.find((node) => node.key === "episodeD");

  expect(actualD).toBeDefined();
  expect(actualD?.key).toBe("episodeD");
  expect(actualD?.content).toBe("content");
} );
