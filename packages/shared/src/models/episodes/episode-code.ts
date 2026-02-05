import path from "node:path";

export type GetEpisodeIdOptions = {
  serieFolder: string;
};

type Result = {
  season: string | null;
  episode: number | string;
};

type Pattern = {
  regex: RegExp;
  seasonIndex?: number;
  episodeIndex?: number;
  episodeTransform?: (matches: RegExpMatchArray)=> string | null;
};

const PATTERNS: Pattern[] = [
  {
    regex: /^(\d+)$/,
    episodeIndex: 1,
  },
  {
    regex: /(\d+)x(\d+)-(\d+)/,
    seasonIndex: 1,
    episodeTransform: (matches) => {
      const epA = +matches[2];
      const epB = +matches[3];

      return epA >= epB
        ? null
        : `${epA.toString().padStart(2, "0")}-${epB.toString().padStart(2, "0")}`;
    },
  },
  {
    regex: /(\d+)x(\d+)/,
    seasonIndex: 1,
    episodeIndex: 2,
  },
  {
    regex: /[sS](\d+)(\.)?[eE](\d+)/,
    seasonIndex: 1,
    episodeIndex: 3,
  },
  {
    regex: /^([\w.]+)-([\w.]+)$/,
    episodeTransform: (matches) => `${matches[1]}-${matches[2]}`,
  },
  {
    regex: /^(\d+)-(\d+)/,
    episodeTransform: (matches) => `${matches[1].padStart(2, "0")}-${matches[2].padStart(2, "0")}`,
  },
  {
    regex: /^(\d+)\.(\d+)/,
    episodeTransform: (matches) => `${matches[1].padStart(2, "0")}.${matches[2]}`,
  },
  {
    regex: /(\d+)(\s)?-(\s)?(\d+)/,
    seasonIndex: 1,
    episodeIndex: 4,
  },
  {
    regex: /(Episode|Episodio|ep)(\s)?(\d+)/i,
    episodeIndex: 3,
  },
  {
    regex: /(\d+)/,
    episodeIndex: 1,
  },
];

export function getEpisodeKeyFromFilePath(
  filePath: string,
  options: GetEpisodeIdOptions,
): Result | null {
  const relativeToSerieFolderPath = path.relative(options.serieFolder, filePath);
  const basename = path.basename(relativeToSerieFolderPath);
  const rawName = basename.substring(0, basename.lastIndexOf("."));
  const cleanName = removeInvalidStrings(rawName).trim();
  let seasonFolder: string | null = path.dirname(relativeToSerieFolderPath);

  if (seasonFolder === ".")
    seasonFolder = null;

  return parseEpisodeInfo(cleanName, seasonFolder);
}

export function getEpisodeKeyFromBasename(
  basenameWithoutExtension: string,
): Result | null {
  return parseEpisodeInfo(basenameWithoutExtension, null);
}

export function splitSeasonEpisodeFromEpisodeKey(episodeKey: string): {
  season?: string;
  episode: string;
} {
  const match = episodeKey.match(/(\d+)x(\d+)/);

  if (!match) {
    return {
      episode: episodeKey,
    };
  }

  return {
    season: match[1],
    episode: match[2],
  };
}

function parseEpisodeInfo(
  inputString: string,
  folderContext: string | null,
): Result | null {
  for (const pattern of PATTERNS) {
    const matches = inputString.match(pattern.regex);

    if (!matches)
      continue;

    const rawSeason = extractSeason(matches, pattern, folderContext);
    const episode = extractEpisode(matches, pattern);

    if (episode === null)
      continue;

    const season = cleanSeasonName(rawSeason);

    if (isValidSeason(season) && isValidEpisode(episode)) {
      return {
        season,
        episode,
      };
    }
  }

  return null;
}

function extractSeason(
  matches: RegExpMatchArray,
  pattern: Pattern,
  folderContext: string | null,
): string | null {
  if (pattern.seasonIndex !== undefined)
    return (+matches[pattern.seasonIndex]).toString();

  if (folderContext !== null)
    return path.basename(folderContext);

  return null;
}

function extractEpisode(
  matches: RegExpMatchArray,
  pattern: Pattern,
): number | string | null {
  if (pattern.episodeTransform)
    return pattern.episodeTransform(matches);

  if (pattern.episodeIndex !== undefined)
    return +matches[pattern.episodeIndex];

  throw new Error("Invalid pattern configuration");
}

function cleanSeasonName(season: string | null): string | null {
  if (!season || typeof season !== "string")
    return season;

  const seasonMatch = season.match(/season(\s)?(\d+)/i);

  if (seasonMatch)
    return (+seasonMatch[2]).toString();

  return season;
}

function isValidSeason(season: number | string | null): boolean {
  if (season === null)
    return true;

  if (typeof season === "string")
    return true;

  return !Number.isNaN(season) && season < 50;
}

function isValidEpisode(episode: number | string): boolean {
  if (typeof episode === "string")
    return true;

  return !Number.isNaN(episode);
}

function removeInvalidStrings(original: string): string {
  return original.replace(
    /(H26(4|5)|(1080|720|480|360)p|(23|24|25|30|59|60)fps|mp(3|4)|(128|192|320)(kbit|kbps))/gi,
    "",
  );
}
