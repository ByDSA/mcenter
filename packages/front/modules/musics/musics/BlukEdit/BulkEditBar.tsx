import { MusicEntityWithUserInfo } from "$shared/models/musics";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { BulkEditForm } from "./Form";
import styles from "./BulkEditBar.module.css";

type Props = {
  isBulkMode: boolean;
  onActivate: ()=> void;
  count: number;
  onClear: ()=> void;
  getSelectedMusics: ()=> MusicEntityWithUserInfo[];
};

export const BulkEditBar = ( { isBulkMode,
  onActivate, count, onClear,
  getSelectedMusics }: Props) => {
  const { openModal, closeModal } = useModal();
  const { LL } = useI18nContext();

  if (!isBulkMode) {
    return (
      <div className={styles.activateBar}>
        <DaButton theme="white" onClick={onActivate}>
          {LL.modules.musics.bulkEdit.activate()}
        </DaButton>
      </div>
    );
  }

  const handleEdit = async () => {
    const musics = getSelectedMusics();

    if (!musics.length)
      return;

    await openModal( {
      title: LL.modules.musics.bulkEdit.editCount( {
        count: musics.length,
      } ),
      content: (
        <BulkEditForm
          selectedMusics={musics}
          onSuccess={closeModal}
        />
      ),
    } );
  };

  return (
    <div className={styles.bar}>
      <span className={styles.count}>
        {count > 0
          ? LL.modules.musics.bulkEdit.selectedCount( {
            count,
          } )
          : LL.modules.musics.bulkEdit.selectMusics()
        }
      </span>
      <div className={styles.actions}>
        <DaButton theme="white" onClick={onClear}>
          {LL.modules.musics.bulkEdit.exit()}
        </DaButton>
        {count > 0 && (
          <DaButton theme="blue" onClick={handleEdit}>
            {LL.modules.musics.bulkEdit.editSelected()}
          </DaButton>
        )}
      </div>
    </div>
  );
};
