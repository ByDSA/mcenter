import type { ScalarEntry, TagsEntry } from "./CurrentValuesModal";
import { ReactNode, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Visibility } from "@mui/icons-material";
import { showError } from "$shared/utils/errors/showError";
import { MusicEntityWithUserInfo } from "$shared/models/musics";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicsApi } from "#modules/musics/requests";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaInputGroup } from "#modules/ui-kit/form/InputGroup";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaCloseModalButton } from "#modules/ui-kit/modal/CloseButton";
import { DaInputTextMultiline } from "#modules/ui-kit/form/input/Text/InputText";
import { DaInputNumber } from "#modules/ui-kit/form/input/Number/InputNumber";
import { DaInputBooleanCheckbox } from "#modules/ui-kit/form/input/Boolean/InputBoolean";
import { FormInputTags } from "#modules/resources/FormInputTags/FormInputTags";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { DaSaveButton } from "#modules/ui-kit/form/SaveButton";
import { DaForm } from "#modules/ui-kit/form/Form";
import { CurrentValuesModal } from "./CurrentValuesModal";
import styles from "./styles.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ScalarField = "album" | "artist" | "country" | "game" | "weight" | "year";
type TagsMode = "add" | "remove" | "replace";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const schema = z.object( {
  artist: z.object( {
    enabled: z.boolean(),
    value: z.string(),
  } ),
  album: z.object( {
    enabled: z.boolean(),
    value: z.string(),
  } ),
  country: z.object( {
    enabled: z.boolean(),
    value: z.string(),
  } ),
  game: z.object( {
    enabled: z.boolean(),
    value: z.string(),
  } ),
  year: z.object( {
    enabled: z.boolean(),
    value: z.number().optional(),
  } ),
  weight: z.object( {
    enabled: z.boolean(),
    value: z.number().optional(),
  } ),
  tags: z.object( {
    enabled: z.boolean(),
    value: z.array(z.string()),
    mode: z.enum(["add", "replace", "remove"]),
  } ),
} );

type FormData = z.infer<typeof schema>;

const INITIAL_VALUES: FormData = {
  artist: {
    enabled: false,
    value: "",
  },
  album: {
    enabled: false,
    value: "",
  },
  country: {
    enabled: false,
    value: "",
  },
  game: {
    enabled: false,
    value: "",
  },
  year: {
    enabled: false,
    value: undefined,
  },
  weight: {
    enabled: false,
    value: undefined,
  },
  tags: {
    enabled: false,
    value: [],
    mode: "add",
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
type Props = {
  selectedMusics: MusicEntityWithUserInfo[];
  onSuccess?: ()=> void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const BulkEditForm = ( { selectedMusics, onSuccess }: Props) => {
  const { LL } = useI18nContext();
  const { closeModal: closeSelf } = useModal();
  const inspectModal = useModal();
  const { control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { isDirty, isValid, isSubmitting } } = useForm<FormData>( {
      resolver: zodResolver(schema),
      defaultValues: INITIAL_VALUES,
    } );

  // When the BulkEdit modal closes, close any open inspect modal too
  useEffect(() => () => {
    inspectModal.closeModal();
  }, []);

  // -------------------------------------------------------------------------
  // State helpers
  // -------------------------------------------------------------------------
  const set = <K extends keyof FormData>(
    key: K,
    update: Partial<FormData[K]>,
  ) => {
    setValue(key, {
      ...getValues(key),
      ...update,
    }, {
      shouldDirty: true,
    } );
  };
  const setTagsMode = (mode: TagsMode) => {
    setValue("tags.mode", mode, {
      shouldDirty: true,
    } );
  };
  const scalarFieldLabel = (field: ScalarField): string => {
    const map: Record<ScalarField, string> = {
      artist: LL.modules.musics.labels.artist(),
      album: LL.modules.musics.labels.album(),
      country: LL.modules.musics.labels.country(),
      game: LL.modules.musics.labels.game(),
      year: LL.modules.musics.labels.year(),
      weight: LL.modules.resources.labels.weight(),
    };

    return map[field];
  };
  // -------------------------------------------------------------------------
  // Inspect modal
  // -------------------------------------------------------------------------
  const openInspect = async (field: keyof FormData) => {
    if (field === "tags") {
      const entries: TagsEntry[] = selectedMusics.map((m) => ( {
        musicTitle: m.title,
        tags: [
          ...(m.tags?.map((t) => (t.startsWith("#") ? t : `#${t}`)) ?? []),
          ...(m.userInfo?.tags ?? []),
        ],
      } ));

      await inspectModal.openModal( {
        title: LL.modules.musics.bulkEdit.currentValuesTitle( {
          field: LL.modules.resources.labels.tags(),
        } ),
        content: (
          <CurrentValuesModal
            field="tags"
            entries={entries}
            onSelectTag={(tag) => {
              const current = getValues("tags");

              if (!current.value.includes(tag)) {
                set("tags", {
                  enabled: true,
                  value: [...current.value, tag],
                } );
              }
            }}
          />
        ),
      } );
    } else {
      const scalarField = field as ScalarField;
      const getScalarValue = (m: MusicEntityWithUserInfo): number | string | undefined => {
        if (scalarField === "weight")
          return m.userInfo?.weight;

        return (m as Record<string, unknown>)[scalarField] as number | string | undefined;
      };
      const entries: ScalarEntry[] = selectedMusics.map((m) => ( {
        musicTitle: m.title,
        value: getScalarValue(m),
      } ));

      await inspectModal.openModal( {
        title: LL.modules.musics.bulkEdit.currentValuesTitle( {
          field: scalarFieldLabel(scalarField),
        } ),
        content: (
          <CurrentValuesModal
            field={scalarField}
            entries={entries}
            onSelectValue={(value) => {
              if (scalarField === "year") {
                const num = parseInt(value, 10);

                set("year", {
                  enabled: true,
                  value: isNaN(num) ? undefined : num,
                } );
              } else if (scalarField === "weight") {
                const num = parseFloat(value);

                set("weight", {
                  enabled: true,
                  value: isNaN(num) ? undefined : num,
                } );
              } else {
                set(scalarField, {
                  enabled: true,
                  value,
                } );
              }
            }}
          />
        ),
      } );
    }
  };
  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const onSubmit = async (data: FormData) => {
    const hasAnyEnabledInData = Object.values(data).some((f) => f?.enabled);

    if (!hasAnyEnabledInData)
      return;

    try {
      const ids = selectedMusics.map((m) => m.id);
      const api = FetchApi.get(MusicsApi);
      const musicEntity: NonNullable<MusicCrudDtos.BulkPatch.Body["music"]>["entity"] = {};
      const userInfoEntity: NonNullable<
      Partial<MusicCrudDtos.BulkPatch.Body["userInfo"]>
      >["entity"] = {};
      let hasMusicFields = false;
      let hasUserInfoFields = false;

      if (data.artist.enabled && data.artist.value) {
        musicEntity.artist = data.artist.value;
        hasMusicFields = true;
      }

      if (data.album.enabled) {
        musicEntity.album = data.album.value || undefined;
        hasMusicFields = true;
      }

      if (data.country.enabled) {
        musicEntity.country = data.country.value || undefined;
        hasMusicFields = true;
      }

      if (data.game.enabled) {
        musicEntity.game = data.game.value || undefined;
        hasMusicFields = true;
      }

      if (data.year.enabled && data.year.value !== undefined) {
        musicEntity.year = data.year.value;
        hasMusicFields = true;
      }

      if (data.weight.enabled && data.weight.value !== undefined) {
        userInfoEntity.weight = data.weight.value;
        hasUserInfoFields = true;
      }

      if (data.tags.enabled) {
        let key: keyof NonNullable<
        NonNullable<MusicCrudDtos.BulkPatch.Body["music"]>["entity"]["tags"]
        >;

        if (data.tags.mode === "add")
          key = "push";
        else if (data.tags.mode === "remove")
          key = "pull";
        else
          key = "replace";

        musicEntity.tags = {
          [key]: data.tags.value.filter((t) => t.startsWith("#")),
        };
        hasMusicFields = musicEntity.tags[key]!.length > 0;
        userInfoEntity.tags = {
          [key]: data.tags.value.filter((t) => !t.startsWith("#")),
        };
        hasUserInfoFields = userInfoEntity.tags[key]!.length > 0;
      }

      if (hasMusicFields || hasUserInfoFields) {
        const body: MusicCrudDtos.BulkPatch.Body = {
          ids,
        };

        if (hasMusicFields) {
          body.music = {
            entity: musicEntity,
          };
        }

        if (hasUserInfoFields) {
          body.userInfo = {
            entity: userInfoEntity,
          };
        }

        await api.bulkPatch(body);
      }

      onSuccess?.();
      closeSelf();
    } catch (err) {
      showError(err);
    }
  };
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const hasAnyEnabled = Object.values(watch()).some((f) => f?.enabled);

  return (
    <DaForm
      className={styles.container}
      onSubmit={handleSubmit(onSubmit)}
      isDirty={isDirty}
      isValid={isValid}
    >

      {/* artist */}
      <DaInputGroup inline>
        <FieldLabel label={LL.modules.musics.labels.artist()}
          onInspect={() => openInspect("artist")}>
          <Controller
            control={control}
            name="artist.enabled"
            render={( { field } ) => (
              <DaInputBooleanCheckbox value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldLabel>
        <Controller
          control={control}
          name="artist.value"
          render={( { field } ) => (
            <DaInputTextMultiline
              value={field.value}
              onChange={(e) => set("artist", {
                enabled: true,
                value: e.target.value,
              } )}
            />
          )}
        />
      </DaInputGroup>

      {/* album */}
      <DaInputGroup inline>
        <FieldLabel label={LL.modules.musics.labels.album()} onInspect={() => openInspect("album")}>
          <Controller
            control={control}
            name="album.enabled"
            render={( { field } ) => (
              <DaInputBooleanCheckbox value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldLabel>
        <Controller
          control={control}
          name="album.value"
          render={( { field } ) => (
            <DaInputTextMultiline
              value={field.value}
              onChange={(e) => set("album", {
                enabled: true,
                value: e.target.value,
              } )}
              nullable
            />
          )}
        />
      </DaInputGroup>

      {/* country */}
      <DaInputGroup inline>
        <FieldLabel label={LL.modules.musics.labels.country()}
          onInspect={() => openInspect("country")}>
          <Controller
            control={control}
            name="country.enabled"
            render={( { field } ) => (
              <DaInputBooleanCheckbox value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldLabel>
        <Controller
          control={control}
          name="country.value"
          render={( { field } ) => (
            <DaInputTextMultiline
              value={field.value}
              onChange={(e) => set("country", {
                enabled: true,
                value: e.target.value,
              } )}
              nullable
            />
          )}
        />
      </DaInputGroup>

      {/* game */}
      <DaInputGroup inline>
        <FieldLabel label={LL.modules.musics.labels.game()} onInspect={() => openInspect("game")}>
          <Controller
            control={control}
            name="game.enabled"
            render={( { field } ) => (
              <DaInputBooleanCheckbox value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldLabel>
        <Controller
          control={control}
          name="game.value"
          render={( { field } ) => (
            <DaInputTextMultiline
              value={field.value}
              onChange={(e) => set("game", {
                enabled: true,
                value: e.target.value,
              } )}
              nullable
            />
          )}
        />
      </DaInputGroup>

      {/* year */}
      <DaInputGroup inline>
        <FieldLabel label={LL.modules.musics.labels.year()} onInspect={() => openInspect("year")}>
          <Controller
            control={control}
            name="year.enabled"
            render={( { field } ) => (
              <DaInputBooleanCheckbox value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldLabel>
        <Controller
          control={control}
          name="year.value"
          render={( { field } ) => (
            <DaInputNumber
              value={field.value ?? ""}
              onChange={(e) => set("year", {
                enabled: true,
                value: e.target.value === "" ? undefined : Number(e.target.value),
              } )
              }
              decimals="integer"
              className={styles.yearInput}
              nullable
            />
          )}
        />
      </DaInputGroup>

      {/* weight */}
      <DaInputGroup inline>
        <FieldLabel label={LL.modules.resources.labels.weight()}
          onInspect={() => openInspect("weight")}>
          <Controller
            control={control}
            name="weight.enabled"
            render={( { field } ) => (
              <DaInputBooleanCheckbox value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldLabel>
        <Controller
          control={control}
          name="weight.value"
          render={( { field } ) => (
            <DaInputNumber
              value={field.value ?? ""}
              onChange={(e) => set("weight", {
                enabled: true,
                value: e.target.value === "" ? undefined : Number(e.target.value),
              } )
              }
              className={styles.weightInput}
              nullable
            />
          )}
        />
      </DaInputGroup>

      {/* tags */}
      <DaInputGroup>
        <FieldLabel label={LL.modules.resources.labels.tags()}
          onInspect={() => openInspect("tags")}>
          <Controller
            control={control}
            name="tags.enabled"
            render={( { field } ) => (
              <DaInputBooleanCheckbox value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldLabel>

        {/* Tags mode selector */}
        <div className={styles.tagsModeRow}>
          <Controller
            control={control}
            name="tags.mode"
            render={( { field } ) => (
              <>
                {(["add", "replace", "remove"] as TagsMode[]).map((mode) => (
                  <label key={mode} className={styles.tagsModeOption}>
                    <input
                      type="radio"
                      name="tagsMode"
                      value={mode}
                      checked={field.value === mode}
                      onChange={() => setTagsMode(mode)}
                    />
                    {mode === "add" && LL.modules.musics.bulkEdit.tags.add()}
                    {mode === "replace" && LL.modules.musics.bulkEdit.tags.replace()}
                    {mode === "remove" && LL.modules.musics.bulkEdit.tags.remove()}
                  </label>
                ))}
              </>
            )}
          />
        </div>

        <Controller
          control={control}
          name="tags.value"
          render={( { field } ) => (
            <FormInputTags
              value={field.value}
              onChange={(newVal) => set("tags", {
                enabled: true,
                value: newVal,
              } )}
              onEmptyEnter={(e) => e.currentTarget.form?.requestSubmit()}
            />
          )}
        />
      </DaInputGroup>

      <DaFooterButtons>
        <DaCloseModalButton showOnSmallWidth />
        <DaSaveButton disabled={isSubmitting || !hasAnyEnabled}>
          {isSubmitting
            ? LL.modules.musics.bulkEdit.saving()
            : LL.modules.musics.bulkEdit.applyToCount( {
              count: selectedMusics.length,
            } )
          }
        </DaSaveButton>
      </DaFooterButtons>
    </DaForm>
  );
};

// ---------------------------------------------------------------------------
// FieldLabel helper
// ---------------------------------------------------------------------------
type FieldLabelProps = {
  label: string;
  onInspect: ()=> void;
  children: ReactNode;
};

const FieldLabel = ( { label, onInspect, children }: FieldLabelProps) => (
  <div className={styles.labelRow}>
    {children}
    <DaLabel>{label}</DaLabel>
    <button
      type="button"
      className={styles.inspectBtn}
      onClick={onInspect}
      title="Ver valores actuales"
      aria-label={`Ver valores actuales de ${label}`}
    >
      <Visibility fontSize="small" />
    </button>
  </div>
);
