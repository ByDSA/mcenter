import path from "node:path";

export type GetEpisodeIdOptions = {
  serieFolder: string;
};

type Result = {
  season: string | null;
  episode: number | string;
};

export function getEpisodeSeasonAndEpisodeNumberFromFilePath(
  filePath: string,
  options: GetEpisodeIdOptions,
): Result | null {
  const relativeToSerieFolderPath = path.relative(options.serieFolder, filePath);
  const basename = path.basename(relativeToSerieFolderPath);
  let episodeNameWithoutExtension = basename.substring(0, basename.lastIndexOf("."));

  episodeNameWithoutExtension = removeInvalidStrings(episodeNameWithoutExtension).trim();

  const result = getFromBasenameAndFilePath(relativeToSerieFolderPath, episodeNameWithoutExtension);

  if (result !== null)
    return result;

  return null;
}

type Pattern = {
  pattern: RegExp;
  seasonIndex?: number;
} & ( {
episodeIndex: number;
} | {
episodeTransform: (matches: RegExpMatchArray)=> string | null;
} );
function getFromBasenameAndFilePath(
  filePath: string,
  basenameWithoutExtension: string,
): Result | null {
  let seasonFolder: string | null = path.dirname(filePath);

  if (seasonFolder === ".")
    seasonFolder = null;

  const patterns: Pattern[] = [
    {
      pattern: /^(\d+)$/,
      episodeIndex: 1,
    },
    {
      pattern: /(\d+)x(\d+)-(\d+)/,
      seasonIndex: 1,
      episodeTransform: (matches: RegExpMatchArray): string | null => {
        const epA = +matches[2];
        const epB = +matches[3];

        if (epA >= epB)
          return null;

        return `${epA.toString().padStart(2, "0")}-${epB.toString().padStart(2, "0")}`;
      },
    },
    {
      pattern: /(\d+)x(\d+)/,
      seasonIndex: 1,
      episodeIndex: 2,
    },
    {
      pattern: /[sS](\d+)(\.)?[eE](\d+)/,
      seasonIndex: 1,
      episodeIndex: 3,
    },
    {
      pattern: /^([\w.]+)-([\w.]+)$/,
      episodeTransform: (matches: RegExpMatchArray): string => `${matches[1]}-${matches[2]}`,
    },
    {
      pattern: /^(\d+)-(\d+)/,
      episodeTransform: (
        matches: RegExpMatchArray,
      ): string => `${matches[1].padStart(2, "0") }-${matches[2].padStart(2, "0")}`,
    },
    {
      pattern: /^(\d+)\.(\d+)/,
      episodeTransform: (
        matches: RegExpMatchArray,
      ): string => `${matches[1].padStart(2, "0") }.${matches[2]}`,
    },
    {
      pattern: /(\d+)(\s)?-(\s)?(\d+)/,
      seasonIndex: 1,
      episodeIndex: 4,
    },
    {
      pattern: /(Episode|Episodio|ep)(\s)?(\d+)/i,
      episodeIndex: 3,
    },
    {
      pattern: /(\d+)/,
      episodeIndex: 1,
    },
  ];

  for (const pattern of patterns) {
    const matches = basenameWithoutExtension.match(pattern.pattern);

    if (matches === null)

      continue;

    let season: string | null = null;

    if (pattern.seasonIndex !== undefined)
      season = (+matches[pattern.seasonIndex]).toString();
    else if (seasonFolder !== null)
      season = path.basename(seasonFolder);

    let episode: number | string | null = null;

    if ("episodeTransform" in pattern && pattern.episodeTransform !== undefined)
      episode = pattern.episodeTransform(matches);
    else if ("episodeIndex" in pattern && pattern.episodeIndex !== undefined)
      episode = +matches[pattern.episodeIndex];
    else
      throw new Error("Invalid pattern");

    if (episode === null)

      continue;

    if (season && typeof season === "string") {
      const seasonMatch = season.match(/season(\s)?(\d+)/i);

      if (seasonMatch !== null)
        season = (+seasonMatch[2]).toString();
    }

    if (isValidSeason(season) && isValidEpisode(episode)) {
      return {
        season,
        episode,
      };
    }
  }

  return null;
}

function isValidSeason(season: number | string | null): boolean {
  if (season === null)
    return true;

  return (
    typeof season === "number" && !Number.isNaN(season) && season < 50)
      || typeof season === "string";
}

function isValidEpisode(episode: number | string): boolean {
  return (typeof episode === "number" && !Number.isNaN(episode)) || typeof episode === "string";
}

function removeInvalidStrings(original: string): string {
  const result = original.replace(/(H26(4|5)|(1080|720|480|360)p|(23|24|25|30|59|60)fps|mp(3|4)|(128|192|320)(kbit|kbps))/gi, "");

  return result;
}

export function getSeasonEpisodeFromEpisodeId(episodeId: string): {
  season?: string;
  episode: string;
} {
  const match = episodeId.match(/(\d+)x(\d+)/);

  if (match === null) {
    return {
      episode: episodeId,
    };
  }

  return {
    season: match[1],
    episode: match[2],
  };
}
