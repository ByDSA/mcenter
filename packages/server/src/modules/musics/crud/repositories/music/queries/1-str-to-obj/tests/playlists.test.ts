/* eslint-disable jest/no-conditional-expect */
import { PrivatePlaylistNode, PublicPlaylistNode } from "../../query-object";
import { parseQuery } from "../query-parser";

const createPrivateTag = (slug: string) => ( {
  root: {
    type: "privatePlaylist",
    value: slug,
  } satisfies PrivatePlaylistNode,
} );
const createPublicTag = (userSlug: string, slug: string) => ( {
  root: {
    type: "publicPlaylist",
    user: userSlug,
    value: slug,
  } satisfies PublicPlaylistNode,
} );
const FAVORITES_OBJ = createPrivateTag("favorites");
const SHARED_OBJ = createPublicTag("user", "shared");

describe.each([
  ["playlist:favorites", FAVORITES_OBJ],
  ["playlist:@user/shared", SHARED_OBJ],
])("parseQuery with different inputs", (query, expected) => {
  it(`should parse query: ${query}`, () => {
    if (expected === null)
      expect(() => parseQuery(query)).toThrow();
    else {
      const obj = parseQuery(query);

      expect(obj).toEqual(expected);
    }
  } );
} );
