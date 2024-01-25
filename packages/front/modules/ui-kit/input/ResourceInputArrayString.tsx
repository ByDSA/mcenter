/* eslint-disable @typescript-eslint/no-unused-vars */
import { isDefined } from "#shared/utils/validation";
import { InputTextProps, useInputText } from "./InputText";
import { InputResourceProps, InputTextPropsMod } from "./props";

export default function ResourceInputArrayString<T extends Object>( {resourceState, prop, inputTextProps}: InputResourceProps<T>) {
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

type ItemProps<T> = {
  name: string;
  resourceState: InputResourceProps<T>["resourceState"];
  prop: InputResourceProps<T>["prop"];
  index: number;
};
function Item<T>( {name, prop, resourceState, index}: ItemProps<T>) {
  return <span className="ui-kit-array-item">
    <span>{name}</span> {
      DeleteIcon( {
        resourceState,
        prop,
        index,
      } )
    }</span>;
}

type AddDeleteIconProps<T> = {
  resourceState: InputResourceProps<T>["resourceState"];
  prop: InputResourceProps<T>["prop"];
};
type DeleteIconProps<T> = AddDeleteIconProps<T> & {
  index: number;
};
function DeleteIcon<T>( {resourceState, prop, index}: DeleteIconProps<T>) {
  const color = "red";

  return <span className="ui-kit-delete-button">
    <a onClick={() => deleteIconOnClickHandler( {
      prop,
      index,
      resourceState,
    } )}
    >X</a>
  </span>;
}
const deleteIconOnClickHandler = <T,>( {prop, resourceState, index}: DeleteIconProps<T>) => {
  const [resource, setResource] = resourceState;
  const array = (resource[prop] ?? []) as string[];

  setResource( {
    ...resource,
    [prop]: array.toSpliced(index, 1),
  } );
};

type AddIconProps<T> = AddDeleteIconProps<T> & {
  inputTextProps?: InputTextPropsMod;
};

function AddIcon<T>( {resourceState, prop, inputTextProps}: AddIconProps<T>) {
  const add = ()=>addIconOnClickHandler( {
    prop,
    resourceState,
    setInputText,
    inputText: getInputText(),
  } );
  const props: InputTextProps = {
    ...inputTextProps,
    onPressEnter: (text: string) => {
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

type AddIconHandlerProps<T> = AddDeleteIconProps<T> & {
  inputText: string | undefined;
  setInputText: React.Dispatch<React.SetStateAction<string | undefined>>;
};
const addIconOnClickHandler = <T,>( {prop, resourceState, inputText, setInputText}: AddIconHandlerProps<T>) => {
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