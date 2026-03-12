import { SLUG_MAX_LENGTH, slugSchema } from "$shared/models/utils/schemas/slug";
import { fixTxt } from "../../../resources/fix-text";

const cyrillicToLatinMap: { [key: string]: string } = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
  і: "i",
  ь: "",
  ъ: "",
  є: "e",
  ї: "i",
};
const greekToLatinMap: { [key: string]: string } = {
  α: "a",
  β: "b",
  γ: "g",
  δ: "d",
  ε: "e",
  ζ: "z",
  η: "i",
  θ: "th",
  ι: "i",
  κ: "k",
  λ: "l",
  μ: "m",
  ν: "n",
  ξ: "x",
  ο: "o",
  π: "p",
  ρ: "r",
  σ: "s",
  ς: "s",
  τ: "t",
  υ: "y",
  φ: "ph",
  χ: "ch",
  ψ: "ps",
  ω: "o",
};
const charMap: { [key: string]: string } = {
  // ── Punctuation → remove ─────────────────────────────────────────────────
  "&": "",
  "[": "",
  "]": "",
  "{": "",
  "}": "",
  ":": "",
  ";": "",
  ",": "",
  ".": "",
  "!": "",
  "¡": "",
  "?": "",
  "¿": "",
  "(": "",
  ")": "",
  "<": "",
  ">": "",
  "«": "",
  "»": "",
  "‹": "",
  "›": "",
  "\"": "",
  "'": "",
  "\u2018": "", // ' left single quotation mark
  "\u2019": "", // ' right single quotation mark
  "\u201C": "", // " left double quotation mark
  "\u201D": "", // " right double quotation mark
  "\u201E": "", // „ double low-9 quotation mark
  "\u2026": "", // … ellipsis
  "@": "",
  "#": "",
  "%": "",
  "=": "",
  "*": "",
  "^": "",
  "`": "",
  "°": "",
  "©": "",
  "®": "",
  "™": "",
  "+": "",
  "·": "", // U+00B7 middle dot (Catalan/Spanish)
  "•": "", // U+2022 bullet — strip when not between words; the "-" dedup handles the rest

  // ── Separators → hyphen ──────────────────────────────────────────────────
  " ": "-",
  _: "-",
  "/": "-",
  "\\": "-",
  "|": "-",
  "~": "-",
  "\u2013": "-", // – en dash
  "\u2014": "-", // — em dash
  "\u2012": "-", // ‒ figure dash
  "\u2015": "-", // ― horizontal bar

  // ── $ ────────────────────────────────────────────────────────────────────
  $: "s",

  // ── Spanish / Portuguese ─────────────────────────────────────────────────
  ñ: "n",
  ã: "a",
  õ: "o",

  // ── French ───────────────────────────────────────────────────────────────
  ç: "c",
  œ: "oe",
  æ: "ae",

  // ── German ───────────────────────────────────────────────────────────────
  ß: "ss",

  // ── Nordic ───────────────────────────────────────────────────────────────
  å: "a",
  ø: "o",
  ð: "d", // Icelandic eth
  þ: "th", // Icelandic thorn

  // ── Accented vowels (Latin-1 + extended) ─────────────────────────────────
  á: "a",
  à: "a",
  ä: "a",
  â: "a",
  ā: "a",
  é: "e",
  è: "e",
  ë: "e",
  ê: "e",
  ē: "e",
  í: "i",
  ì: "i",
  ï: "i",
  î: "i",
  ī: "i",
  ó: "o",
  ò: "o",
  ö: "o",
  ô: "o",
  ō: "o",
  ő: "o",
  ú: "u",
  ù: "u",
  ü: "u",
  û: "u",
  ū: "u",
  ű: "u",
  ý: "y",
  ÿ: "y",

  // ── Central/Eastern European (caron, acute, etc.) ────────────────────────
  č: "c",
  ć: "c",
  š: "s",
  ś: "s",
  ž: "z",
  ź: "z",
  ż: "z",
  ď: "d",
  ě: "e",
  ľ: "l",
  ł: "l",
  ļ: "l",
  ň: "n",
  ń: "n",
  ņ: "n",
  ř: "r",
  ŗ: "r",
  ť: "t",
  ğ: "g",
  ş: "s",
  ķ: "k",

  ...cyrillicToLatinMap,
  ...greekToLatinMap,
};

export function fixSlug(slug: string): string | null {
  let fixed: string = fixTxt(slug)
    .toLowerCase()
    .replaceAll(" & ", " and ")
    .replaceAll(/(official-)?lyric-video/g, "");
  const fixedTmp = fixed;

  fixed = "";

  for (const c of fixedTmp)
    fixed += charMap[c] ?? c;

  fixed = removeForeignCharacters(fixed);

  if (fixed.length === 0)
    return null;

  fixed = fixed.replace(/-+/g, "-");

  // Remove leading and trailing "-"
  fixed = fixed.replace(/^-+|-+$/g, "");

  fixed = fixed.substring(0, SLUG_MAX_LENGTH);

  return slugSchema.parse(fixed);
}

function isValidCharacter(c: string): boolean {
  return /^[a-z0-9-]+$/.test(c);
}

function removeForeignCharacters(str: string): string {
  let ret = "";

  for (const c of str) {
    if (isValidCharacter(c))
      ret += c;
  }

  return ret;
}
