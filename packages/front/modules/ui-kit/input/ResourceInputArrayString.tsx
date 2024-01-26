/* eslint-disable @typescript-eslint/no-unused-vars */
import { isDefined } from "#shared/utils/validation";
import { InputTextProps, useInputText } from "./InputText";
import { ResourceInputProps } from "./ResourceInput";

export default function ResourceInputArrayString<R extends Object>( {resourceState, prop, inputTextProps}: ResourceInputProps<R>) {
  const [resource] = resourceState;
  const array = (resource[prop] ?? []) as string[];

  return <>
    <span className="ui-kit-resource-input-array-string">
      {
        array.map((t, i, a)=>{
          const key = a.indexOf(t) !== i ? t + i : t;

          return <Item
            key={key}
            prop={prop}
            index={i}
            resourceState={resourceState}
            name={t}
          />;} )}
      {
        AddIcon( {
          resourceState,
          prop,
          inputTextProps,
        } )
      }
    </span>
  </>;
}

type ItemProps<R extends Object> = {
  name: string;
  resourceState: ResourceInputProps<R>["resourceState"];
  prop: ResourceInputProps<R>["prop"];
  index: number;
};
function Item<R extends Object>( {name, prop, resourceState, index}: ItemProps<R>) {
  return <span className="ui-kit-array-item">
    <span>{name}</span> {
      DeleteIcon( {
        resourceState,
        prop,
        index,
      } )
    }</span>;
}

type AddDeleteIconProps<R extends Object> = {
  resourceState: ResourceInputProps<R>["resourceState"];
  prop: ResourceInputProps<R>["prop"];
};
type DeleteIconProps<R extends Object> = AddDeleteIconProps<R> & {
  index: number;
};
function DeleteIcon<R extends Object>( {resourceState, prop, index}: DeleteIconProps<R>) {
  return <span className="ui-kit-delete-button">
    <a onClick={() => deleteIconOnClickHandler( {
      prop,
      index,
      resourceState,
    } )}
    >X</a>
  </span>;
}
const deleteIconOnClickHandler = <R extends Object>( {prop, resourceState, index}: DeleteIconProps<R>) => {
  const [resource, setResource] = resourceState;
  const array = (resource[prop] ?? []) as string[];

  setResource( {
    ...resource,
    [prop]: array.toSpliced(index, 1),
  } );
};

type AddIconProps<R extends Object> = AddDeleteIconProps<R> & {
  inputTextProps?: InputTextProps;
};

function AddIcon<R extends Object, T extends string>( {resourceState, prop, inputTextProps}: AddIconProps<R>) {
  const add = ()=>addIconOnClickHandler( {
    prop,
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
  const {setValue: setInputText, getValue: getInputText, element} = useInputText(props);

  return <span className="ui-kit-array-add-item">
    {element}
    <a className="ui-kit-add-button"
      onClick={()=>add}
    >+</a>
  </span>;
}

type AddIconHandlerProps<R extends Object> = AddDeleteIconProps<R> & {
  inputText: string | undefined;
  setInputText: React.Dispatch<React.SetStateAction<string | undefined>>;
};
const addIconOnClickHandler = <R extends Object>( {prop, resourceState, inputText, setInputText}: AddIconHandlerProps<R>) => {
  const [resource, setResource] = resourceState;
  let array = (resource[prop] ?? []) as string[];

  array = [...array];
  const newTag = inputText?.trim();

  if (!isDefined(newTag) || newTag === "")
    return;

  if (array.includes(newTag))
    return;

  array.push(newTag);
  setResource( {
    ...resource,
    [prop]: array,
  } );

  setInputText("");
};