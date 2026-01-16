import { useRef, useState } from "react";
import { Button } from "#modules/ui-kit/input/Button";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { ImageCoverEntity } from "../models";
import { FormLabel } from "../../ui-kit/form/Label/FormLabel";
import { ImageCoverUpload, ImageCoverUploadRef } from "../Edit/UploadImage";
import styles from "./Content.module.css";

export type NewImageCoverProps = {
  onSuccess?: (created: ImageCoverEntity)=> void;
};

export function NewImageCover( { onSuccess }: NewImageCoverProps) {
  const modal = useModal(true);
  const [label, setLabel] = useState<string>("");
  const [hasFile, setHasFile] = useState(false);
  const uploadRef = useRef<ImageCoverUploadRef>(null);

  return (
    <div className={styles.content}>
      <div className={styles.mainSection}>
        <div className={styles.fieldGroup}>
          <FormLabel>Etiqueta</FormLabel>
          <ImageCoverLabelView
            value={label}
            onChange={(value) => setLabel(value)}
          />
        </div>
        <section className={styles.imagesSection}>
          <FormLabel>Subir Imagen</FormLabel>
          <ImageCoverUpload
            ref={uploadRef}
            hideUploadButton
            onSuccess={created=>{
              onSuccess?.(created);
              modal.closeModal();
            }}
            onFileChange={(file)=>setHasFile(!!file)}
          />
        </section>
      </div>

      <div className={styles.actions}>
        <Button onClick={modal.closeModal} theme="white">Cerrar</Button>
        <Button onClick={async ()=> {
          await uploadRef.current!.upload( {
            label,
          } );
          modal.closeModal();
        }}
        theme="white"
        disabled={!(hasFile && label)}
        >Subir</Button>
      </div>
    </div>
  );
}

type ImageCoverLabelViewProps = {
value: string;
onChange: (newValue: string)=> void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ImageCoverLabelView = (props: ImageCoverLabelViewProps) => {
  return <input
    type="text"
    className={styles.inputLabel}
    value={props.value}
    onChange={(e) => props.onChange(e.target.value)}
    placeholder="Nombre del cover..."
  />;
};
