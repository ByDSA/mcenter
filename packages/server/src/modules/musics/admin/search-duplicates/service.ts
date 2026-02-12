import { Injectable } from "@nestjs/common";
import { MusicEntity } from "$shared/models/musics";
import { fixSlug } from "#musics/crud/builder/fix-slug";

type Options = {
  ignoreGroups?: string[][]; // Array de arrays de IDs a ignorar
};

@Injectable()
export class SearchDuplicatesService {
  getTitleArtistDups(all: MusicEntity[], options?: Options): MusicEntity[][] {
    const groups = Object.groupBy(all, (m) => this.titleArtistKey(m));
    const duplicateGroups = Object.values(groups)
      .filter(group => group && group.length > 1) as MusicEntity[][];

    return this.filterGroups(duplicateGroups, options);
  }

  getSlugDups(all: MusicEntity[], options?: Options): MusicEntity[][] {
    const groups = Object.groupBy(all, (m) => this.slugKey(m));
    const duplicateGroups = Object.values(groups)
      .filter(group => group && group.length > 1) as MusicEntity[][];

    return this.filterGroups(duplicateGroups, options);
  }

  private filterGroups(duplicateGroups: MusicEntity[][], options?: Options): MusicEntity[][] {
    if (!options?.ignoreGroups || options.ignoreGroups.length === 0)
      return duplicateGroups;

    const ignoreGroupSets = options.ignoreGroups.map(group => new Set(group));

    return duplicateGroups
      .filter(group => {
        const groupIds = new Set(group.map(item => item.id));

        return !ignoreGroupSets.some(ignoreSet => [...groupIds].every(id => ignoreSet.has(id)));
      } );
  }

  private titleArtistKey(music: MusicEntity): string {
    const fixedTitle = this.fixTitle(music.title);
    const fixedArtist = this.fixArtist(music.artist);
    const ret = fixSlug(fixedTitle) + "-" + fixSlug(fixedArtist);

    if (ret.length < 2)
      throw new Error(`Invalid: Title: ${music.title}. Artist: ${music.artist}`);

    return ret;
  }

  private slugKey(music: MusicEntity): string {
    let ret = music.slug.endsWith("-1")
      ? music.slug
      : music.slug.replace(/\d+$/, "");

    ret = fixSlug(ret) ?? "";

    if (ret.length === 0)
      throw new Error(`Invalid: Title: ${music.slug}`);

    return ret;
  }

  private fixTitle(title: string): string {
    return title
      .replace(/\([^)]*\)/g, "")
      .replace(/\{[^}]*\}/g, "")
      .replace(/\[[^\]]*\]/g, "")
      .trim()
      .replace(/\s+/g, " ");
  }

  private fixArtist(title: string): string {
    let cleaned = this.fixTitle(title);
    const commaIndex = cleaned.indexOf(",");
    const featIndex = cleaned.toLowerCase().indexOf(" feat");
    let cutIndex = -1;

    if (commaIndex !== -1 && featIndex !== -1)
      cutIndex = Math.min(commaIndex, featIndex);
    else if (commaIndex !== -1)
      cutIndex = commaIndex;
    else if (featIndex !== -1)
      cutIndex = featIndex;

    if (cutIndex !== -1)
      cleaned = cleaned.substring(0, cutIndex);

    return cleaned.trim();
  }
}
