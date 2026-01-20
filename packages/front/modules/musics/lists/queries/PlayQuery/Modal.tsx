import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { ErrorView } from "#modules/ui-kit/form/Error";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { FormFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FormFooterButtons";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { FormInputTextMultiline } from "#modules/ui-kit/form/input/Text/FormInputText";
import styles from "./Modal.module.css";

type FormProps = {
  initialValue?: string;
};

const schema = z.object( {
  query: z.string().trim()
    .min(1, "La query es obligatoria"),
} );
const PlayQueryForm = ( { initialValue }: FormProps) => {
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
    await useBrowserPlayer.getState().playQuery(data.query.toLowerCase());

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
          <FormLabel>Query</FormLabel>
          <FormInputTextMultiline
            {...register("query")}
            autoFocus
          />
          <ErrorView errors={errors} keyName="query" touchedFields={touchedFields} />
        </section>

        <FormFooterButtons>
          <Button
            type="submit"
            theme="white"
            isSubmitting={isSubmitting}
            disabled={!isValid}
          >
            Reproducir
          </Button>
        </FormFooterButtons>
      </form>
    </>
  );
};

export const usePlayQueryModal = () => {
  const { openModal, ...modal } = useModal();

  return {
    openModal: (props?: FormProps) => openModal( {
      title: "Reproducir query",
      className: styles.modal,
      content: <PlayQueryForm {...props} />,
    } ),
    ...modal,
  };
};
