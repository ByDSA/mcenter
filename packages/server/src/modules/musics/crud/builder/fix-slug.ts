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
const charMap: { [key: string]: string } = {
  "&": "",
  "[": "",
  "]": "",
  ":": "",
  ",": "",
  ".": "",
  "!": "",
  "¡": "",
  "?": "",
  "¿": "",
  "(": "",
  ")": "",
  "\"": "",
  "'": "",
  "”": "",
  "’": "",
  ñ: "n",
  ç: "c",
  $: "s",
  á: "a",
  à: "a",
  ä: "a",
  â: "a",
  é: "e",
  è: "e",
  ë: "e",
  ê: "e",
  í: "i",
  ì: "i",
  ï: "i",
  î: "i",
  ó: "o",
  ò: "o",
  ö: "o",
  ô: "o",
  ú: "u",
  ù: "u",
  ü: "u",
  û: "u",
  _: "-",
  "/": "-",
  " ": "-",
  ...cyrillicToLatinMap,
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

  while (fixed.includes("--"))
    fixed = fixed.replace("--", "-");

  // Remove end ans start "-"
  fixed = fixed.replace(/^-+|-+$/g, "");

  return fixed;
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
