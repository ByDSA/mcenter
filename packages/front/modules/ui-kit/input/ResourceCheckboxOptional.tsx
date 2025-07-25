import { ResourceInputCommonProps } from "./ResourceInputCommonProps";

type InputResourceProps<T, V> = Omit<ResourceInputCommonProps<T, V | undefined>, "getValue"> & {
  name: string;
  setDisabled: (value: boolean)=> void;
  isChecked: boolean;
  setChecked: (value: boolean)=> void;
};
export function ResourceOptionalCheckbox<R, V>(
  { name: checkboxName,
    getUpdatedResource, resourceState,
    setDisabled, isChecked, setChecked }: InputResourceProps<R, V>,
) {
  const [resource, setResource] = resourceState;

  return <>
    <input type="checkbox"
      name={checkboxName}
      checked={isChecked}
      onChange={(e) => {
        if (e.target.checked) {
          const newResource = getUpdatedResource(undefined, resource);

          setResource(newResource);
        }

        setDisabled(e.target.checked);
        setChecked(!isChecked);
      }}/>
    <label htmlFor={checkboxName}>Sin valor</label>
  </>;
}
