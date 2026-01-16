import { FormEnumButtons } from "#modules/ui-kit/form/FormEnumButtons/FormEnumButtons";

type FormVisibilityProps = {
  value: "private" | "public";
  setValue: (newValue: "private" | "public")=> void;
};
export function FormVisibility( { value, setValue }: FormVisibilityProps) {
  return <FormEnumButtons
    options={[
      {
        value: "private",
        label: "Private",
      },
      {
        value: "public",
        label: "Public",
      },
    ]}
    currentValue={value}
    onChange={(val) => setValue(val)} />;
}
