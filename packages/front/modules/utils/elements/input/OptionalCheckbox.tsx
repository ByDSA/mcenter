type InputResourceProps<T> = {
  prop: keyof T;
  name: string;
  resourceState: [T, React.Dispatch<React.SetStateAction<T>>];
  defaultValue?: number | string;
};
export default function OptionalCheckbox( {name: checkboxName, prop, resourceState, defaultValue}: InputResourceProps<any>) {
  const [resource, setResource] = resourceState;

  return <>
    <input type="checkbox" name={checkboxName} checked={resource[prop] === undefined} onChange={(e) => {
      let v;

      if (e.target.checked)
        v = undefined;
      else
        v = defaultValue;

      setResource( {
        ...resource,
        [prop]: v,
      } );
    }}/>
    <label htmlFor={checkboxName}>Sin valor</label>
  </>;
}