import { ChangeEventHandler, useEffect, useRef } from "react";
import { commonStyle } from "./style";

export type InputTextProps = {
  style?: React.CSSProperties;
  value?: string;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
};

export function InputText( {style, value: valueProp, disabled, onChange}: InputTextProps) {
  const updateHeight = ( {value, element}: {value: string; element: HTMLTextAreaElement} ) => {
    const rows = getVisualLines(element, value) || 1;
    const paddingTop = +window.getComputedStyle(element).paddingTop.replace("px", "");
    const paddingBottom = +window.getComputedStyle(element).paddingBottom.replace("px", "");
    const paddingHeight = paddingTop + paddingBottom;

    // eslint-disable-next-line no-param-reassign
    element.style.height = `calc(${rows * 1.3}em + ${paddingHeight}px)`; // Set the height to the scrollHeight
  };
  const textareaRef = useRef(null as HTMLTextAreaElement | null);

  useEffect(() => {
    const element = textareaRef.current;

    if (!element)
      return;

    updateHeight( {
      value: valueProp?.toString() ?? "",
      element,
    } );
  }, [valueProp]);
  const textArea = <textarea
    ref={textareaRef}
    style={{
      ...commonStyle,
      ...style,
    }}
    value={valueProp}
    disabled={disabled}
    onChange={onChange}></textarea>;

  return textArea;
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