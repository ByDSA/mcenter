export const countries = {
  ...generateSynonymsFromGroup("españa", "spain", "espana"),
  ...generateSynonymsFromGroup("francia", "france"),
  ...generateSynonymsFromGroup("alemania", "germany", "deutschland"),
  ...generateSynonymsFromGroup("italia", "italy"),
  ...generateSynonymsFromGroup(
    "reino unido",
    "united kingdom",
    "uk",
    "gran bretaña",
    "great britain",
  ),
  ...generateSynonymsFromGroup("albania", "albania"),
  ...generateSynonymsFromGroup("andorra", "andorra"),
  ...generateSynonymsFromGroup("armenia", "armenia"),
  ...generateSynonymsFromGroup("austria", "austria"),
  ...generateSynonymsFromGroup("azerbaiyán", "azerbaijan", "azerbaiyan"),
  ...generateSynonymsFromGroup("bélgica", "belgium", "belgica"),
  ...generateSynonymsFromGroup("bielorusia", "belarus", "belarús"),
  ...generateSynonymsFromGroup("bosnia y herzegovina", "bosnia", "herzegovina"),
  ...generateSynonymsFromGroup("bulgaria", "bulgaria"),
  ...generateSynonymsFromGroup("chipre", "cyprus"),
  ...generateSynonymsFromGroup("croacia", "croatia"),
  ...generateSynonymsFromGroup("dinamarca", "denmark", "danmark"),
  ...generateSynonymsFromGroup("eslovaquia", "slovakia"),
  ...generateSynonymsFromGroup("eslovenia", "slovenia"),
  ...generateSynonymsFromGroup("estonia", "estonia"),
  ...generateSynonymsFromGroup("finlandia", "finland"),
  ...generateSynonymsFromGroup("georgia", "georgia"),
  ...generateSynonymsFromGroup("grecia", "greece"),
  ...generateSynonymsFromGroup("hungría", "hungary"),
  ...generateSynonymsFromGroup("irlanda", "ireland"),
  ...generateSynonymsFromGroup("islandia", "iceland"),
  ...generateSynonymsFromGroup("letonia", "latvia", "latvija"),
  ...generateSynonymsFromGroup("lituania", "lithuania", "lietuva"),
  ...generateSynonymsFromGroup("luxemburgo", "luxembourg"),
  ...generateSynonymsFromGroup("malta", "malta"),
  ...generateSynonymsFromGroup("moldavia", "moldova"),
  ...generateSynonymsFromGroup("montenegro", "montenegro"),
  ...generateSynonymsFromGroup("noruega", "norway", "norge"),
  ...generateSynonymsFromGroup("países bajos", "netherlands", "holland", "holanda"),
  ...generateSynonymsFromGroup("polonia", "poland", "polska"),
  ...generateSynonymsFromGroup("república checa", "czech republic", "chequia", "czechia"),
  ...generateSynonymsFromGroup("rumania", "romania"),
  ...generateSynonymsFromGroup("rusia", "russia", "россия"),
  ...generateSynonymsFromGroup("serbia", "serbia"),
  ...generateSynonymsFromGroup("suecia", "sweden"),
  ...generateSynonymsFromGroup("suiza", "switzerland", "schweiz", "suisse"),
  ...generateSynonymsFromGroup("turquía", "turkey"),
  ...generateSynonymsFromGroup("ucrania", "ukraine"),
};

export function generateSynonymsFromGroup(...words: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const key of words)
    result[key] = words.filter(term => term !== key);

  return result;
}
