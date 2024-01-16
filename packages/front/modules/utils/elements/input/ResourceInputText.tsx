import { isDefined } from "#shared/utils/validation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import OptionalCheckbox from "./OptionalCheckbox";
import { InputResourceProps } from "./props";
import { commonStyle } from "./style";

export default function ResourceInputText<T extends Object>( {resourceState, prop: key, isOptional, error}: InputResourceProps<T>) {
  const [resource, setResource] = resourceState;
  const updateHeight = ( {value, element}: {value: string; element: HTMLTextAreaElement} ) => {
    const rows = getVisualLines(element, value) || 1;
    const paddingTop = +window.getComputedStyle(element).paddingTop.replace("px", "");
    const paddingBottom = +window.getComputedStyle(element).paddingBottom.replace("px", "");
    const paddingHeight = paddingTop + paddingBottom;

    // eslint-disable-next-line no-param-reassign
    element.style.height = `calc(${rows * 1.3}em + ${paddingHeight}px)`; // Set the height to the scrollHeight
  };
  const textareaRef = useRef(null as HTMLTextAreaElement | null);
  const [value, setValue] = useState(resource[key]?.toString());

  useEffect(() => {
    setValue(resource[key]?.toString());
  },[resource]);

  useEffect(() => {
    const element = textareaRef.current;

    if (!element)
      return;

    updateHeight( {
      value: resource[key]?.toString() ?? "",
      element,
    } );
  }, [value]);
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const {value: targetValue} = e.target;
    const finalValue = targetValue === "" && isOptional ? undefined : targetValue;

    setResource( {
      ...resource,
      [key]: finalValue,
    } );
  };
  const disabled = isOptional && !isDefined(value);
  const textArea = <textarea
    ref={textareaRef}
    style={{
      ...commonStyle,
      width: "100%",
    }}
    value={value}
    disabled={disabled}
    onChange={handleChange}></textarea>;

  return <span style={{
    flexFlow: "column",
    width: "100%",
  }}>
    <span style={{
      width: "100%",
    }}>
      {textArea}
      {isOptional && OptionalCheckbox( {
        prop: key,
        resourceState,
        defaultValue: "",
        name: `${key.toString()}-Checkbox`,
      } ) }
    </span>
    {error && <span className="error">{error}</span>}
  </span>;
}

function getVisualLines(textarea: HTMLTextAreaElement, sentence: string) {
  const textareaStyles = window.getComputedStyle(textarea);
  const font = `${textareaStyles.fontSize} ${textareaStyles.fontFamily}`;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const textAreaWidth = +textareaStyles.width.replace("px", "");

  context.font = font;

  let lineCount = 0;
  let currentLine = "";
  const words = splitIntoWords(sentence);

  for (const w of words) {
    if (w === "\n") {
      lineCount++;
      currentLine = "\n";

      // eslint-disable-next-line no-continue
      continue;
    }

    const wordWidth = context.measureText(`${w} `).width;
    const lineWidth = context.measureText(currentLine).width;

    if (w !== "" && lineWidth + wordWidth > textAreaWidth) {
      lineCount++;
      currentLine = `${w} `;
    } else
      currentLine += `${w} `;
  }

  if (currentLine !== "")
    lineCount++;

  return lineCount;
}

function splitIntoWords(str: string): string[] {
  const words = [] as string[];
  let currentWord = "";
  let lastLetter: string | null = null;

  for (const l of str) {
    if (l === "\n") {
      words.push(currentWord, "\n");
      currentWord = "";
      // eslint-disable-next-line no-continue
      continue;
    }

    if (currentWord !== ""){
      if (l === " " && lastLetter !== " ") {
        words.push(currentWord);
        currentWord = "";
        // eslint-disable-next-line no-continue
        continue;
      }
    }

    if (l === " ")
      words.push("");
    else
      currentWord += l;

    lastLetter = l;
  }

  if (currentWord !== "")
    words.push(currentWord);

  return words;
}