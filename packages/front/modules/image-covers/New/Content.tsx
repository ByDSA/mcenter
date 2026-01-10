import { useState } from "react";
import { Button } from "#modules/ui-kit/input/Button";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { ImageCoverEntity } from "../models";
import { SectionLabel } from "../Edit/SectionLabel";
import { ImageCoverUpload } from "../Edit/Editor";
import styles from "./Content.module.css";

export type NewImageCoverProps = {
  onSuccess?: (created: ImageCoverEntity)=> void;
};

export function NewImageCover( { onSuccess }: NewImageCoverProps) {
  const modal = useModal(true);
  const [label, setLabel] = useState<string>("");

  return (
    <div className={styles.editor}>
      <div className={styles.mainSection}>
        <section className={styles.imagesSection}>
          <SectionLabel>Subir Imagen</SectionLabel>
          <ImageCoverUpload
            label={label}
            onSuccess={created=>{
              onSuccess?.(created);
              modal.closeModal();
            }}
          />
        </section>
        <div className={styles.fieldGroup}>
          <SectionLabel>Etiqueta</SectionLabel>
          <div className={styles.inputWithAction}>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nombre del cover..."
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button onClick={modal.closeModal} theme="white">Cerrar</Button>
      </div>
    </div>
  );
}
