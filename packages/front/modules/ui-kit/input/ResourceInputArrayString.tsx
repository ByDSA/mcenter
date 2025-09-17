import { isDefined } from "$shared/utils/validation";
import { useEffect } from "react";
import { AddCircle, Cancel } from "@mui/icons-material";
import { AddOnReset } from "#modules/utils/resources/useCrud";
import { ResourceInputCommonProps } from "./ResourceInputCommonProps";
import { OnPressEnter, useInputText } from "./UseInputText";

type EnterProps = {
  onPressEnter?: OnPressEnter<string>;
  onEmptyPressEnter?: ()=> void;
};

export type ResourceInputTextArrayProps<R> = EnterProps & ResourceInputCommonProps<R, string[] |
  undefined>;

export function ResourceInputArrayString<R extends object>(
  { resourceState, getUpdatedResource: calcUpdatedResource, getValue: getResourceValue, addOnReset,
    onEmptyPressEnter, onPressEnter, caption }: ResourceInputTextArrayProps<R>,
) {
  const array = (getResourceValue(resourceState[0]) ?? []) as string[];
  const input = <>
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
          onEmptyPressEnter,
          onPressEnter,
          addOnReset,
        } )
      }
    </span>
  </>;

  if (caption) {
    return (
      <span className="ui-kit-resource-input">
        <span>{caption}</span>
        {input}
      </span>
    );
  }

  return input;
}

type ItemProps<R extends object> = {
  name: string;
  resourceState: ResourceInputTextArrayProps<R>["resourceState"];
  calcUpdatedResource: ResourceInputTextArrayProps<R>["getUpdatedResource"];
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
  calcUpdatedResource: ResourceInputTextArrayProps<R>["getUpdatedResource"];
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
    ><Cancel /></a>
  </span>;
}
const deleteIconOnClickHandler = <R extends object>(
  { calcUpdatedResource, getResourceValue, resourceState, index }: DeleteIconProps<R>,
) => {
  const [resource, setResource] = resourceState;
  const array = (getResourceValue(resourceState[0]) ?? []) as string[];

  setResource(calcUpdatedResource(array.toSpliced(index, 1), resource));
};

type AddIconProps<R extends object> = AddDeleteIconProps<R> & EnterProps & {
  addOnReset: AddOnReset<R>;
};

const EMPTY_VALUE = "";

function AddIcon<R extends object, T extends string>(
  { resourceState, calcUpdatedResource, getResourceValue,
    onEmptyPressEnter, onPressEnter, addOnReset }: AddIconProps<R>,
) {
  const { element: mainInputElement, value, setValue } = useInputText( {
    nullChecked: false,
    defaultValue: EMPTY_VALUE,
    onPressEnter: (text: T) => {
      if (text === EMPTY_VALUE)
        onEmptyPressEnter?.();
      else {
        add();

        if (typeof onPressEnter === "function")
          onPressEnter?.(text);
      }
    },
  } );

  useEffect(() => {
    addOnReset(()=> {
      setValue(EMPTY_VALUE);
    } );
  }, []);
  const add = ()=>addIconOnClickHandler( {
    calcUpdatedResource,
    getResourceValue,
    resourceState,
    setInputText: setValue,
    inputText: value,
  } );

  return <span className="ui-kit-array-add-item">
    {mainInputElement}
    <a className="ui-kit-add-button"
      onClick={add}
    ><AddCircle /></a>
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
