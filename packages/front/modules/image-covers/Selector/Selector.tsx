import { useState, useCallback } from "react";
import { Button } from "#modules/ui-kit/input/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useFormInModal } from "#modules/ui-kit/modal/useFormModal";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { SearchBarView } from "#modules/ui-kit/SearchBar";
import { ImageCoverEntity } from "../models";
import { ImageCoversApi } from "../requests";
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
  const handleSearch = useCallback(async (value: string) => {
    if (!value.trim())
      return;

    const api = FetchApi.get(ImageCoversApi);
    const res = await api.getManyByCriteria( {
      filter: {
        searchLabel: value,
      },
    } );

    setResults(res.data);
  }, []);

  return (
    <div className={styles.selector}>
      <header className={styles.header}>
        {current !== undefined && <aside className={styles.currentCoverSection}>
          <SectionLabel>Actual</SectionLabel>
          <MusicImageCover
            size="medium"
            editable
            className={styles.currentCover}
            cover={current} /></aside>}
        <aside className={styles.searchAside}>
          <NewImageCoverButton
            className={styles.newImageButton}
            onSuccess={(created)=> {
              setResults(old => {
                return [
                  created,
                  ...old,
                ];
              } );
            }}/>
          <div className={styles.searchSection}>
            <SearchBarView
              placeholder="Buscar covers..."
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              action={handleSearch}
            />
          </div>

        </aside>
      </header>

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
            <MusicImageCover
              editable
              onUpdate={(data)=>{
                if (!data)
                  setResults(old=>old.filter(o=>o.id !== cover.id));
                else {
                  setResults(old=>{
                    return old.map(o=>o.id === data.id ? data : o);
                  } );
                }
              }}
              cover={cover}
              size="medium"
              className={styles.coverImage} />

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
