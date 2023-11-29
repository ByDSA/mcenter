import * as fs from "node:fs";
import * as path from "node:path";

const files = [".env", ".calendar.js", ".tag.js", ".schedule.js"];

describe.each(files)("files = %s", (file) => {
  it(`Exists ${file}`, () => {
    const p = path.join("../../", file);
    const actual = fs.existsSync(p);

    expect(actual).toBeTruthy();
  } );
} );