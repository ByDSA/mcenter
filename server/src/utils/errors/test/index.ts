/* eslint-disable import/prefer-default-export */
export function expectErrorStackStartsWithThisFilename(error: Error) {
  const {stack} = new Error();
  const stackArray = stack?.split("\n");
  const previousFilename = stackArray?.[2]
    .split("/")
    .at(-1)
    ?.split(":")
    .at(0);

  expect(error.stack?.split("\n")[1]).toContain(previousFilename);
}