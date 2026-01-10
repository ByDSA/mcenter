import { useState, useCallback } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { Button } from "#modules/ui-kit/input/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { backendUrl } from "#modules/requests";
import { useFormInModal } from "#modules/ui-kit/modal/useFormModal";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { ImageCoverEntity } from "../models";
import { ImageCoversApi } from "../requests";
import { ImageCoverEditButton } from "../Edit/Button";
import { SectionLabel } from "../Edit/SectionLabel";
import { NewImageCoverButton } from "../New/Button";
import styles from "./Selector.module.css";

export type ImageCoverSelectorProps = {
  current?: ImageCoverEntity | null;
  onSelect: (imageCover: ImageCoverEntity | null)=> void;
};

export function ImageCoverSelector( { onSelect, current }: ImageCoverSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<ImageCoverEntity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const modal = useModal(true);
  const form = useFormInModal( {
    onSubmit: () => {
      let selected: ImageCoverEntity | null | undefined;

      if (selectedId === null)
        selected = null;
      else {
        selected = results.find(r => r.id === selectedId);

        if (!selected)
          return;
      }

      onSelect(selected);

      return selected;
    },
    onSuccess: (_data) => {
      modal.closeModal();
    },
    canSubmit:
      () => !(selectedId === undefined
            || (selectedId !== null && !results.find(p=>p.id === selectedId))),
  } );
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim())
      return;

    setIsLoading(true);
    try {
      const api = FetchApi.get(ImageCoversApi);
      const res = await api.getManyByCriteria( {
        filter: {
          searchLabel: searchQuery,
        },
      } );

      setResults(res.data);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  return (
    <div className={styles.selector}>
      <header className={styles.header}>
        {current !== undefined && <section className={styles.currentCoverSection}>
          <SectionLabel>Actual</SectionLabel>
          <MusicImageCover
            className={styles.currentCover}
            img={current
              ? {
                url: getMediumCoverUrl(current),
              }
              : undefined} /></section>}
        <NewImageCoverButton onSuccess={(created)=> {
          setResults(old => {
            return [
              created,
              ...old,
            ];
          } );
        }}/>
      </header>
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Buscar covers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          disabled={isLoading}
          theme="white"
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className={styles.resultsInfo}>
          {results.length} resultado{results.length !== 1 ? "s" : ""}
        </div>
      )}

      <div className={styles.resultsList}>
        {results.map((cover) => (
          <div
            key={cover.id}
            className={`${styles.resultItem} ${selectedId === cover.id ? styles.selected : ""}`}
            title={cover.metadata.label}
            onClick={() => setSelectedId(cover.id)}
          >
            <img
              src={getMediumCoverUrl(cover)}
              alt={cover.metadata.label}
              className={styles.coverImage} />
            <ImageCoverEditButton
              imageCover={cover}
              onUpdate={(data)=>{
                if (!data)
                  setResults(old=>old.filter(o=>o.id !== cover.id));
                else {
                  setResults(old=>{
                    return old.map(o=>o.id === data.id ? data : o);
                  } );
                }
              }}
            />
            <div
              className={styles.coverLabel}
            >{cover.metadata.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Button
          onClick={() => setSelectedId(null)}
          theme={selectedId === null ? "blue" : "white"}
        >
          Ninguna
        </Button>
        <Button
          onClick={modal.closeModal}
          theme="white"
        >
          Cancelar
        </Button>
        <Button
          onClick={form.submit}
          disabled={!form.canSubmit}
          theme="white"
        >
          Aceptar
        </Button>
      </div>
    </div>
  );
}

export function getLargeCoverUrl(imageCover: ImageCoverEntity): string {
  return backendUrl(
    PATH_ROUTES.imageCovers.raw.withParams(imageCover.versions.large
      ?? imageCover.versions.original),
  );
}

export function getMediumCoverUrl(imageCover: ImageCoverEntity): string {
  return backendUrl(
    PATH_ROUTES.imageCovers.raw.withParams(imageCover.versions.medium
    ?? imageCover.versions.large ?? imageCover.versions.original),
  );
}

export function getSmallCoverUrl(imageCover: ImageCoverEntity): string {
  return backendUrl(
    PATH_ROUTES.imageCovers.raw.withParams(imageCover.versions.small
      ?? imageCover.versions.medium ?? imageCover.versions.large ?? imageCover.versions.original),
  );
}
