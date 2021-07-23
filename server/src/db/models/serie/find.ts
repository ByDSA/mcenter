import { findByUrl, Group } from "../group";
import { generateFromFiles } from "./create";

/* eslint-disable import/prefer-default-export */
export async function getById(id: string): Promise<Group | null> {
  let serie: Group|null = await findByUrl(id);

  if (!serie) {
    const generatedSerie = await generateFromFiles(id);

    if (!generatedSerie)
      return null;

    serie = generatedSerie;
  }

  return serie;
}
