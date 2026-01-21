import { DaEnumButtons } from "#modules/ui-kit/form/EnumButtons/EnumButtons";

type FormVisibilityProps = {
  value: "private" | "public";
  setValue: (newValue: "private" | "public")=> void;
};
export function FormVisibility( { value, setValue }: FormVisibilityProps) {
  return <DaEnumButtons
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
