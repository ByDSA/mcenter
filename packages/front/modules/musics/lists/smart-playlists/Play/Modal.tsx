import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaInputTextMultiline } from "#modules/ui-kit/form/input/Text/InputText";
import { DaForm } from "#modules/ui-kit/form/Form";
import { DaSaveButton } from "#modules/ui-kit/form/SaveButton";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import styles from "./Modal.module.css";

type FormProps = {
  initialValue?: string;
};

const PlaySmartPlaylistForm = ( { initialValue }: FormProps) => {
  const { LL } = useI18nContext();
  const schema = useMemo(() => z.object( {
    query: z.string().trim()
      .min(1, LL.uikit.forms.errors.requiredField()),
  } ), [LL]);
  const modal = useModal(true);
  const { register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isValid, isDirty } } = useForm( {
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
        message: LL.modules.musics.lists.smartPlaylists.invalidQuery(),
      } );
    } else
      modal.closeModal();
  };

  return (
    <>
      <DaForm
        onSubmit={handleSubmit(onSubmit)}
        isValid={isValid}
        isDirty={isDirty}
      >
        <section>
          <DaLabel>{LL.modules.resources.labels.query()}</DaLabel>
          <DaInputTextMultiline
            {...register("query")}
            autoFocus
          />
          <DaErrorView errors={errors} keyName="query" touchedFields={touchedFields} />
        </section>

        <DaFooterButtons>
          <DaSaveButton>{LL.modules.player.controls.play()}</DaSaveButton>
        </DaFooterButtons>
      </DaForm>
    </>
  );
};

export const usePlaySmartPlaylistModal = () => {
  const { LL } = useI18nContext();
  const { openModal, ...modal } = useModal();

  return {
    openModal: (props?: FormProps) => openModal( {
      title: LL.modules.musics.lists.smartPlaylists.play(),
      className: styles.modal,
      content: <PlaySmartPlaylistForm {...props} />,
    } ),
    ...modal,
  };
};
