import { neverCase } from "$shared/utils/validation";
import { MusicPlaylistOdm } from "#musics/playlists/crud/repository/odm";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { assertFoundClient } from "#utils/validation/found";
import { ExpressionNode, RangeDate, RangeNumber } from "./query-object";

export async function expressionToMeilisearchQuery(
  expression: ExpressionNode,
  userId: string | null,
): Promise<string> {
  const { type } = expression;

  switch (type) {
    case "year": {
      const value1 = expression.value;

      if (value1.type === "number")
        return "year = " + value1.value;
      else if (value1.type === "range")
        return rangeNumberToMeili("year", value1);
      else
        throw new Error("Year: unexpected value type: " + (value1 as any).type);
    }
    case "played": {
      const { value } = expression;

      if (value.type === "range-date")
        return rangeDateToMeili("lastTimePlayedAt", value);
      else
        throw new Error("Played: unexpected value type: " + (value as any).type);
    }
    case "added": {
      const { value } = expression;

      if (value.type === "range-date")
        return rangeDateToMeili("addedAt", value);
      else
        throw new Error("Added: unexpected value type: " + (value as any).type);
    }
    case "weight": {
      const value1 = expression.value;

      if (value1.type === "number")
        return "weight = " + value1.value;
      else if (value1.type === "range")
        return rangeNumberToMeili("weight", value1);
      else
        throw new Error("Weight: unexpected value type: " + (value1 as any).type);
    }
    case "tag": {
      const tag = expression.value;

      return `(tags IN ["${tag}"] AND onlyTags IS NULL) OR onlyTags IN ["${tag}"]`;
    }
    case "privatePlaylist": {
      const slugPlaylist = expression.value;

      return `privatePlaylistSlugs IN ["${slugPlaylist}"]`;
    }
    case "publicPlaylist": {
      const { value: slugPlaylist, user: userPublicUsername } = expression;
      const user = await UserOdm.Model.findOne( {
        publicUsername: userPublicUsername,
      } );

      assertFoundClient(user);

      const playlist = await MusicPlaylistOdm.Model.findOne( {
        userId: user.id,
        slug: slugPlaylist,
      } );

      assertFoundClient(playlist);

      if (playlist.visibility === "private" && (userId === null || !playlist.userId.equals(userId)))
        assertFoundClient(null);

      if (playlist.list.length === 0)
        return "FALSE";

      const ids = playlist.list.map(entry => `"${entry.musicId}"`).join(",");

      return `musicId IN [${ids}]`;
    }
    case "union": {
      const { child1, child2 } = expression;
      const qChild1 = await expressionToMeilisearchQuery(child1, userId);
      const qChild2 = await expressionToMeilisearchQuery(child2, userId);

      return `(${qChild1}) OR (${qChild2})`;
    }
    case "intersection": {
      const { child1, child2 } = expression;
      const qChild1 = await expressionToMeilisearchQuery(child1, userId);
      const qChild2 = await expressionToMeilisearchQuery(child2, userId);

      return `(${qChild1}) AND (${qChild2})`;
    }
    case "difference": {
      const { child1, child2 } = expression;
      const qChild1 = await expressionToMeilisearchQuery(child1, userId);
      const qChild2 = await expressionToMeilisearchQuery(child2, userId);

      return `(${qChild1}) AND NOT (${qChild2})`;
    }
    case "negation": {
      const { child } = expression;
      const qChild = await expressionToMeilisearchQuery(child, userId);

      return `NOT (${qChild})`;
    }
    default: {
      neverCase(type);
    }
  }
}

function rangeNumberToMeili(key: string, range: RangeNumber): string {
  let maxPart: string | undefined;
  let minPart: string | undefined;

  if ("max" in range) {
    if (range.maxIncluded)
      maxPart = `${key} <= ${range.max}`;
    else
      maxPart = `${key} < ${range.max}`;
  }

  if ("min" in range) {
    if (range.minIncluded)
      minPart = `${key} >= ${range.min}`;
    else
      minPart = `${key} > ${range.min}`;
  }

  if (minPart && !maxPart)
    return minPart;

  if (!minPart && maxPart)
    return maxPart;

  if (!minPart || !maxPart)
    throw new Error("Unexpected error in range processing");

  return minPart + " AND " + maxPart;
}
function rangeDateToMeili(key: string, range: RangeDate): string {
  let maxPart: string | undefined;
  let minPart: string | undefined;

  if ("max" in range) {
    if (range.maxIncluded)
      maxPart = `${key} <= ${dateToTimestamp(range.max)}`;
    else
      maxPart = `${key} < ${dateToTimestamp(range.max)}`;
  }

  if ("min" in range) {
    if (range.minIncluded)
      minPart = `${key} >= ${dateToTimestamp(range.min)}`;
    else
      minPart = `${key} > ${dateToTimestamp(range.min)}`;
  }

  if (minPart && !maxPart)
    return minPart;

  if (!minPart && maxPart)
    return maxPart;

  if (!minPart || !maxPart)
    throw new Error("Unexpected error in range processing");

  return minPart + " AND " + maxPart;
}

function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
