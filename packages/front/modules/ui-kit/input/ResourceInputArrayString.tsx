import { isDefined } from "$shared/utils/validation";
import { InputTextProps, useInputText } from "./InputText";
import { ResourceInputCommonProps } from "./ResourceInputCommonProps";

export type ResourceInputTextArrayProps<R> = ResourceInputCommonProps<R, string[] | undefined> & {
  inputTextProps?: InputTextProps;
};

export function ResourceInputArrayString<R extends object>(
  { resourceState, setResource: calcUpdatedResource, getValue: getResourceValue,
    inputTextProps }: ResourceInputTextArrayProps<R>,
) {
  const array = (getResourceValue(resourceState[0]) ?? []) as string[];

  return <>
    <span className="ui-kit-resource-input-array-string">
      {
        array.map((t, i, a)=>{
          const key = a.indexOf(t) !== i ? t + i : t;

          return <Item
            key={key}
            calcUpdatedResource={calcUpdatedResource}
            getResourceValue={getResourceValue}
            index={i}
            resourceState={resourceState}
            name={t}
          />;
        } )}
      {
        AddIcon( {
          resourceState,
          calcUpdatedResource,
          getResourceValue,
          inputTextProps,
        } )
      }
    </span>
  </>;
}

type ItemProps<R extends object> = {
  name: string;
  resourceState: ResourceInputTextArrayProps<R>["resourceState"];
  calcUpdatedResource: ResourceInputTextArrayProps<R>["setResource"];
  getResourceValue: ResourceInputTextArrayProps<R>["getValue"];
  index: number;
};
function Item<R extends object>( { name,
  calcUpdatedResource, getResourceValue,
  resourceState, index }: ItemProps<R>) {
  return <span className="ui-kit-array-item">
    <span>{name}</span> {
      DeleteIcon( {
        resourceState,
        calcUpdatedResource,
        getResourceValue,
        index,
      } )
    }</span>;
}

type AddDeleteIconProps<R extends object> = {
  resourceState: ResourceInputTextArrayProps<R>["resourceState"];
  calcUpdatedResource: ResourceInputTextArrayProps<R>["setResource"];
  getResourceValue: ResourceInputTextArrayProps<R>["getValue"];
};
type DeleteIconProps<R extends object> = AddDeleteIconProps<R> & {
  index: number;
};
function DeleteIcon<R extends object>( { resourceState, calcUpdatedResource,
  getResourceValue, index }: DeleteIconProps<R>) {
  return <span className="ui-kit-delete-button">
    <a onClick={() => deleteIconOnClickHandler( {
      calcUpdatedResource,
      getResourceValue,
      index,
      resourceState,
    } )}
    >X</a>
  </span>;
}
const deleteIconOnClickHandler = <R extends object>(
  { calcUpdatedResource, getResourceValue, resourceState, index }: DeleteIconProps<R>,
) => {
  const [resource, setResource] = resourceState;
  const array = (getResourceValue(resourceState[0]) ?? []) as string[];

  setResource(calcUpdatedResource(array.toSpliced(index, 1), resource));
};

type AddIconProps<R extends object> = AddDeleteIconProps<R> & {
  inputTextProps?: InputTextProps;
};

function AddIcon<R extends object, T extends string>(
  { resourceState, calcUpdatedResource, getResourceValue, inputTextProps }: AddIconProps<R>,
) {
  const add = ()=>addIconOnClickHandler( {
    calcUpdatedResource,
    getResourceValue,
    resourceState,
    setInputText,
    inputText: getInputText(),
  } );
  const props: InputTextProps = {
    ...inputTextProps,
    onPressEnter: (text: T) => {
      if (text === "") {
        if (inputTextProps?.onEmptyPressEnter)
          inputTextProps?.onEmptyPressEnter?.();
      } else {
        add();

        if (typeof inputTextProps?.onPressEnter === "function")
          inputTextProps?.onPressEnter?.(text);
      }
    },
  };
  const { setValue: setInputText, getValue: getInputText, element } = useInputText(props);

  return <span className="ui-kit-array-add-item">
    {element}
    <a className="ui-kit-add-button"
      onClick={()=>add}
    >+</a>
  </span>;
}

type AddIconHandlerProps<R extends object> = AddDeleteIconProps<R> & {
  inputText: string | undefined;
  setInputText: React.Dispatch<React.SetStateAction<string | undefined>>;
};
const addIconOnClickHandler = <R extends object>(
  { calcUpdatedResource, getResourceValue,
    resourceState, inputText, setInputText }: AddIconHandlerProps<R>,
) => {
  const [resource, setResource] = resourceState;
  let array = (getResourceValue(resourceState[0]) ?? []) as string[];

  array = [...array];
  const newTag = inputText?.trim();

  if (!isDefined(newTag) || newTag === "")
    return;

  if (array.includes(newTag))
    return;

  array.push(newTag);
  setResource(calcUpdatedResource(array, resource));

  setInputText("");
};
