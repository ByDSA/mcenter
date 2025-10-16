/* eslint-disable no-underscore-dangle */
import { Controller, Get } from "@nestjs/common";
import { MusicEntity } from "$shared/models/musics";
import { fixSlug } from "#musics/crud/builder/fix-slug";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { MusicsRepository } from "../../crud/repositories/music";
import { MusicDuplicatesIgnoreGroupsOdm } from "./repository/odm";

@IsAdmin()
@Controller("/search-duplicates")
export class SearchDuplicatesController {
  constructor(
    private readonly musicRepo: MusicsRepository,
  ) { }

  @Get()
  async search() {
    const all = await this.musicRepo.getAll();
    const ignoreGroupsDocOdms = await MusicDuplicatesIgnoreGroupsOdm.Model.find();
    const ignoreGroups = MusicDuplicatesIgnoreGroupsOdm.toModels(ignoreGroupsDocOdms);
    const dupTitleArtist = getTitleArtistDups(all, {
      ignoreGroups,
    } );
    const dupSlugs = getSlugDups(all, {
      ignoreGroups,
    } );

    return {
      slugs: dupSlugs,
      titleArtist: dupTitleArtist,
    };
  }
}

function titleArtistKey(music: MusicEntity): string {
  const fixedTitle = fixTitle(music.title);
  const fixedArtist = fixArtist(music.artist);
  const ret = fixSlug(fixedTitle) + "-" + fixSlug(fixedArtist);

  if (ret.length < 2)
    throw new Error(`Invalid: Title: ${music.title}. Artist: ${music.artist}`);

  return ret;
}

function slugKey(music: MusicEntity): string {
  let ret = music.slug.endsWith("-1")
    ? music.slug
    : music.slug.replace(/\d+$/, "");

  ret = fixSlug(ret) ?? "";

  if (ret.length === 0)
    throw new Error(`Invalid: Title: ${music.slug}`);

  return ret;
}

type Options = {
  ignoreGroups?: string[][]; // Array de arrays de IDs a ignorar
};

function getTitleArtistDups(all: MusicEntity[], options?: Options): MusicEntity[][] {
  for (const m of all)
    (m as any)._key = titleArtistKey(m);

  const groups = Object.groupBy(all, (i)=>(i as any)._key);
  const duplicateGroups = Object.values(groups)
    .filter(group => group && group.length > 1) as MusicEntity[][];

  return filterGroups(duplicateGroups, options);
}

function filterGroups(duplicateGroups: MusicEntity[][], options?: Options): MusicEntity[][] {
  if (!options?.ignoreGroups || options.ignoreGroups.length === 0)
    return duplicateGroups;

  const ignoreGroupSets = options.ignoreGroups.map(group => new Set(group));

  return duplicateGroups
    .filter(group => {
      const groupIds = new Set(group.map(item => item.id));

      // Verificar si este grupo está contenido en algún grupo a ignorar
      return !ignoreGroupSets.some(ignoreSet => {
        return [...groupIds].every(id => ignoreSet.has(id));
      } );
    } );
}

function getSlugDups(all: MusicEntity[], options?: Options): MusicEntity[][] {
  for (const m of all)
    (m as any)._key = slugKey(m);

  const groups = Object.groupBy(all, (i)=>(i as any)._key);
  const duplicateGroups = Object.values(groups)
    .filter(group => group && group.length > 1) as MusicEntity[][];

  return filterGroups(duplicateGroups, options);
}

function fixTitle(title: string): string {
  return title
    // Eliminar contenido entre paréntesis, llaves y corchetes
    .replace(/\([^)]*\)/g, "")
    .replace(/\{[^}]*\}/g, "")
    .replace(/\[[^\]]*\]/g, "")
    // Limpiar espacios extra
    .trim()
    .replace(/\s+/g, " ");
}

function fixArtist(title: string): string {
  let cleaned = fixTitle(title);
  // Buscar la primera coma o " feat" y quedarse solo con la primera parte
  const commaIndex = cleaned.indexOf(",");
  const featIndex = cleaned.toLowerCase().indexOf(" feat");
  let cutIndex = -1;

  if (commaIndex !== -1 && featIndex !== -1) {
    // Si ambos existen, usar el que aparezca primero
    cutIndex = Math.min(commaIndex, featIndex);
  } else if (commaIndex !== -1)
    cutIndex = commaIndex;
  else if (featIndex !== -1)
    cutIndex = featIndex;

  if (cutIndex !== -1)
    cleaned = cleaned.substring(0, cutIndex);

  return cleaned.trim();
}
