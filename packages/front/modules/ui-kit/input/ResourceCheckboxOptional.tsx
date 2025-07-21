import { ResourceInputCommonProps } from "./ResourceInputCommonProps";

type InputResourceProps<T> = ResourceInputCommonProps<T, boolean | undefined> & {
  name: string;
};
export function ResourceOptionalCheckbox(
  { name: checkboxName, getValue: getResourceValue,
    setResource: calcUpdatedResource, resourceState }: InputResourceProps<any>,
) {
  const [resource, setResource] = resourceState;
  const resourceValue = getResourceValue(resourceState[0]);

  return <>
    <input type="checkbox" disabled={resourceValue === undefined} name={checkboxName} checked={resourceValue === undefined} onChange={(e) => {
      if (e.target.checked)
        setResource(calcUpdatedResource(undefined, resource));
    }}/>
    <label htmlFor={checkboxName}>Sin valor</label>
  </>;
}
