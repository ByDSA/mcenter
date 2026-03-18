import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { DaCloseModalButton } from "#modules/ui-kit/modal/CloseButton";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import styles from "./CurrentValuesModal.module.css";

type ScalarField = "album" | "artist" | "country" | "game" | "weight" | "year";

export type ScalarEntry = {
  musicTitle: string;
  value: number | string | null | undefined;
};

export type TagsEntry = {
  musicTitle: string;
  tags: string[];
};

type ScalarProps = {
  field: ScalarField;
  entries: ScalarEntry[];
  onSelectValue: (value: string)=> void;
};

type TagsProps = {
  field: "tags";
  entries: TagsEntry[];
  onSelectTag: (tag: string)=> void;
};

type Props = ScalarProps | TagsProps;

export const CurrentValuesModal = (props: Props) => {
  const { closeModal } = useModal(true);

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {props.field === "tags"
          ? (props as TagsProps).entries.map((entry, i) => (
            <div key={i} className={styles.entry}>
              <span className={styles.musicTitle}>{entry.musicTitle}</span>
              <div className={styles.tagsRow}>
                {entry.tags.length === 0
                  ? <span className={styles.empty}>sin valor</span>
                  : entry.tags.map((tag, j) => (
                    <button
                      key={j}
                      type="button"
                      className={styles.tagChip}
                      onClick={() => (props as TagsProps).onSelectTag(tag)}
                    >
                      {tag}
                    </button>
                  ))
                }
              </div>
            </div>
          ))
          : (props as ScalarProps).entries.map((entry, i) => {
            const hasValue = entry.value !== null
                && entry.value !== undefined
                && entry.value !== "";

            return (
              <div key={i} className={styles.entry}>
                <span className={styles.musicTitle}>{entry.musicTitle}</span>
                {hasValue
                  ? (
                    <button
                      type="button"
                      className={styles.scalarValue}
                      onClick={() => {
                        (props as ScalarProps).onSelectValue(String(entry.value));
                        closeModal();
                      }}
                    >
                      {String(entry.value)}
                    </button>
                  )
                  : <span className={styles.empty}>sin valor</span>
                }
              </div>
            );
          } )
        }
      </div>
      <DaFooterButtons>
        <DaCloseModalButton showOnSmallWidth />
      </DaFooterButtons>
    </div>
  );
};
