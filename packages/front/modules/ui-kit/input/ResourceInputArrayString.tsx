/* eslint-disable @typescript-eslint/no-unused-vars */
import { isDefined } from "#shared/utils/validation";
import { InputTextProps } from "./InputText";
import { useInputTextWithState } from "./InputTextWithState";
import { InputResourceProps, InputTextPropsMod } from "./props";

export default function ResourceInputArrayString<T extends Object>( {resourceState, prop, inputTextProps}: InputResourceProps<T>) {
  const [resource] = resourceState;
  const array = (resource[prop] ?? []) as string[];

  return <>
    <span style= {{
      marginLeft: "1em",
      display: "flex",
      gap: "0.25em 0.5em",
      flexWrap: "wrap",
    }}>{array.map((t, i, a)=>{
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

type ItemBoxProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  hideBorder?: boolean;
};
function ItemBox( {children, style, hideBorder}: ItemBoxProps) {
  const borderStyle: React.CSSProperties = {
    borderRadius: "0.5em",
    border: "1px solid #000",
    padding: "0 0.5em",
  };
  let itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
  };

  if (!hideBorder) {
    itemStyle = {
      ...itemStyle,
      ...borderStyle,
    };
  }

  return <span style={{
    ...itemStyle,
    ...style,
  }}>{children}</span>;
}

type ItemProps<T> = {
  name: string;
  resourceState: InputResourceProps<T>["resourceState"];
  prop: InputResourceProps<T>["prop"];
  index: number;
};
function Item<T>( {name, prop, resourceState, index}: ItemProps<T>) {
  return <ItemBox>
    <span>{name}</span> {
      DeleteIcon( {
        resourceState,
        prop,
        index,
      } )
    }</ItemBox>;
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

  return <span>
    <a style={{
      display: "inline-block",
      width: "1em",
      borderColor: color,
      color,
      height: "1em",
      textAlign: "center",
      lineHeight: "1em",
      marginLeft: "0.5em",
    }}
    onClick={() => deleteIconOnClickHandler( {
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
    inputTextState: state,
  } );
  const props: InputTextProps = {
    style: {
      width: "auto",
    },
    ...inputTextProps,
    onPressEnter: (text: string) => {
      if (text === "" && inputTextProps?.onEmptyPressEnter)
        inputTextProps?.onEmptyPressEnter?.();
      else {
        add();

        if (typeof inputTextProps?.onPressEnter === "function")
          inputTextProps?.onPressEnter?.(text);
      }
    },
  };
  const {state, element} = useInputTextWithState(props);

  return <ItemBox hideBorder>
    {element}
    <a style={{
      color: "green",
      padding: "0 0.25em",
    }}
    onClick={()=>add}
    >+</a>
  </ItemBox>;
}

type AddIconHandlerProps<T> = AddDeleteIconProps<T> & {
  inputTextState: ReturnType<typeof useInputTextWithState>["state"];
};
const addIconOnClickHandler = <T,>( {prop, resourceState, inputTextState}: AddIconHandlerProps<T>) => {
  const [resource, setResource] = resourceState;
  const array = (resource[prop] ?? []) as string[];
  const [inputText, setInputText] = inputTextState;
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