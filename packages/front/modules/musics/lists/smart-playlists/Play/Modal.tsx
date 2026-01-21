import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaInputTextMultiline } from "#modules/ui-kit/form/input/Text/InputText";
import styles from "./Modal.module.css";

type FormProps = {
  initialValue?: string;
};

const schema = z.object( {
  query: z.string().trim()
    .min(1, "La query es obligatoria"),
} );
const PlaySmartPlaylistForm = ( { initialValue }: FormProps) => {
  const modal = useModal(true);
  const { register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isValid, isSubmitting } } = useForm( {
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      query: initialValue ?? "",
    },
  } );
  const onSubmit = async (data: z.infer<typeof schema>) => {
    await useBrowserPlayer.getState().playSmartPlaylist(data.query.toLowerCase());

    if (useBrowserPlayer.getState().status === "stopped") {
      setError("query", {
        type: "manual",
        message: "Query inválida",
      } );
    } else
      modal.closeModal();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <section>
          <DaLabel>Query</DaLabel>
          <DaInputTextMultiline
            {...register("query")}
            autoFocus
          />
          <DaErrorView errors={errors} keyName="query" touchedFields={touchedFields} />
        </section>

        <DaFooterButtons>
          <DaButton
            type="submit"
            theme="white"
            isSubmitting={isSubmitting}
            disabled={!isValid}
          >
            Reproducir
          </DaButton>
        </DaFooterButtons>
      </form>
    </>
  );
};

export const usePlaySmartPlaylistModal = () => {
  const { openModal, ...modal } = useModal();

  return {
    openModal: (props?: FormProps) => openModal( {
      title: "Reproducir Smart Playlist",
      className: styles.modal,
      content: <PlaySmartPlaylistForm {...props} />,
    } ),
    ...modal,
  };
};
