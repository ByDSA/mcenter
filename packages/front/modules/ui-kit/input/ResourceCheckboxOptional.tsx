/* eslint-disable import/prefer-default-export */
type InputResourceProps<T> = {
  prop: keyof T;
  name: string;
  resourceState: [T, React.Dispatch<React.SetStateAction<T>>];
};
export function ResourceOptionalCheckbox( {name: checkboxName, prop, resourceState}: InputResourceProps<any>) {
  const [resource, setResource] = resourceState;

  return <>
    <input type="checkbox" disabled={resource[prop] === undefined} name={checkboxName} checked={resource[prop] === undefined} onChange={(e) => {
      if (e.target.checked) {
        setResource( {
          ...resource,
          [prop]: undefined,
        } );
      }
    }}/>
    <label htmlFor={checkboxName}>Sin valor</label>
  </>;
}