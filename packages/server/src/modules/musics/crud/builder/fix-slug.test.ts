import { fixSlug } from "./fix-slug";

describe("fixSlug", () => {
  const testCases = [
    {
      input: "Hello World",
      expected: "hello-world",
      description: "convert to lowercase",
    },
    {
      input: "Hello & World",
      expected: "hello-and-world",
      description: "change special characters & by 'and'",
    },
    {
      input: "Hello [World]",
      expected: "hello-world",
      description: "remove special characters []",
    },
    {
      input: "Hello: World",
      expected: "hello-world",
      description: "remove special characters :",
    },
    {
      input: "Hello, World.",
      expected: "hello-world",
      description: "remove punctuation ,",
    },
    {
      input: "Hello! World?",
      expected: "hello-world",
      description: "remove exclamation and question marks",
    },
    {
      description: "remove end '-'",
      input: "Hello-",
      expected: "hello",
    },
    {
      input: "Hello (World)",
      expected: "hello-world",
      description: "remove parentheses",
    },
    {
      input: "Hello \"World\"",
      expected: "hello-world",
      description: "remove double quotes",
    },
    {
      input: "Hello 'World'",
      expected: "hello-world",
      description: "remove single quotes",
    },
    {
      input: "Hello official-lyric-video",
      expected: "hello",
      description: "remove official-lyric-video",
    },
    {
      input: "cañón",
      expected: "canon",
      description: "replace ñ",
    },
    {
      input: "façade",
      expected: "facade",
      description: "replace ç",
    },
    {
      input: "café",
      expected: "cafe",
      description: "replace accented characters",
    },
    {
      input: "naïve",
      expected: "naive",
      description: "replace accented characters2",
    },
    {
      input: "hello_world",
      expected: "hello-world",
      description: "replace underscores with hyphens",
    },
    {
      input: "hello/world",
      expected: "hello-world",
      description: "replace slashes with hyphens",
    },
    {
      input: "hello world",
      expected: "hello-world",
      description: "replace spaces with hyphens",
    },
    {
      input: "hello世界",
      expected: "hello",
      description: "remove foreign characters",
    },
    {
      input: "!@#%^&*()",
      expected: null,
      description: "return null if no valid characters",
    },
    {
      description: "replace $ with s",
      expected: "hellosworld",
      input: "hello$world",
    },
    {
      input: "hello--world",
      expected: "hello-world",
      description: "replace multiple hyphens with a single hyphen",
    },
    {
      input: "Кароль Тіна",
      expected: "karol-tina",
      description: "replace cyrillic characters",
    },
    {
      input: "Kick-Ass Score - 35 - The Corridor",
      expected: "kick-ass-score-35-the-corridor",
      description: "replace multiple hyphens with a single hyphen2",
    },
    {
      input: "-start",
      expected: "start",
      description: "remove start hypen",
    },
  ];

  testCases.forEach(( { input, expected, description } ) => {
    it(`should ${description}`, () => {
      expect(fixSlug(input)).toBe(expected);
    } );
  } );
} );
