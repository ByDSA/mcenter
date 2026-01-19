import { useState, useCallback } from "react";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useFormInModal } from "#modules/ui-kit/modal/useFormModal";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { SearchBarView } from "#modules/ui-kit/SearchBar";
import { classes } from "#modules/utils/styles";
import { FormFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FormFooterButtons";
import { ImageCoverEntity } from "../models";
import { ImageCoversApi } from "../requests";
import { FormLabel } from "../../ui-kit/form/Label/FormLabel";
import { NewImageCoverButton } from "../New/Button";
import { useImageCover } from "../hooks";
import styles from "./Selector.module.css";

export type ImageCoverSelectorProps = {
  currentId?: ImageCoverEntity["id"] | null;
  onSelect: (imageCover: ImageCoverEntity | null)=> void;
};

export function ImageCoverSelector(
  { onSelect, currentId }: ImageCoverSelectorProps,
) {
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
  const { data: current } = useImageCover(currentId ?? null);

  return (
    <div className={styles.selector}>
      <header className={styles.header}>
        {current !== null && <aside className={styles.currentCoverSection}>
          <FormLabel>Actual</FormLabel>
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

      <FormFooterButtons>
        <aside>
          <Button
            onClick={() => setSelectedId(null)}
            className={classes(styles.null, selectedId === null && styles.selected)}
            theme="white"
          >
          Ninguna
          </Button>
        </aside>
        <aside>
          <Button
            onClick={modal.closeModal}
            theme="white"
          >
          Cancelar
          </Button>
          <Button
            onClick={form.submit}
            disabled={!form.canSubmit}
            theme="blue"
          >
          Aceptar
          </Button>
        </aside>
      </FormFooterButtons>
    </div>
  );
}
