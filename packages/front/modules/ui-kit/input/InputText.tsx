import { ChangeEventHandler, useEffect, useMemo, useRef } from "react";

export type OnPressEnterFn = (text: string)=> void;

export type InputTextProps = {
  style?: React.CSSProperties;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onPressEnter?: OnPressEnterFn | "newLine" | "nothing";
  value?: string;
};

export function useInputText( {style, disabled, value, onChange, onPressEnter = "nothing"}: InputTextProps) {
  const updateProps = [onChange, onPressEnter];
  const ref = useRef(null as HTMLTextAreaElement | null);
  const updateH = () => ref?.current && updateHeight( {
    value: ref.current.value,
    element: ref.current,
  } );

  useEffect(() => {
    updateH();
  }, [value]);

  useFirstVisible(ref, () => {
    updateH();
  } );
  const keyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (typeof onPressEnter === "function" || onPressEnter === "nothing")
        e.preventDefault();

      if (typeof onPressEnter === "function")
        onPressEnter(e.currentTarget.value);
    }
  };
  const textArea = useMemo(()=><textarea
    ref={ref}
    className="ui-kit-input-text"
    style={{
      ...style,
    }}
    defaultValue={value}
    disabled={disabled}
    onChange={onChange}
    onKeyDown={keyDownHandler}

  ></textarea>, updateProps);

  return {
    element: textArea,
    getValue: ()=>ref?.current?.value,
    setValue: (v: string) => {
      if (!ref?.current)
        return;

      ref.current.value = v;
    },
  };
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

    if (w !== "" && lineWidth + wordWidth > textAreaWidth + 1) {
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

    if (currentWord !== "") {
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

function useFirstVisible<T extends HTMLElement>(ref: React.RefObject<T | null>, callback: (current: T)=> void) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!ref?.current)
              return;

            callback(ref.current);
            observer.disconnect();
          }
        } );
      },
      {
        threshold: 0.1,
      },
    );

    if (!ref?.current)
      return;

    observer.observe(ref.current);

    // eslint-disable-next-line consistent-return
    return () => observer.disconnect();
  }, []);
}

const updateHeight = ( {value, element}: {value: string; element: HTMLTextAreaElement} ) => {
  const rows = getVisualLines(element, value) || 1;
  const paddingTop = +window.getComputedStyle(element).paddingTop.replace("px", "");
  const paddingBottom = +window.getComputedStyle(element).paddingBottom.replace("px", "");
  const paddingHeight = paddingTop + paddingBottom;

  // eslint-disable-next-line no-param-reassign
  element.style.height = `calc(${rows * 1.3}em + ${paddingHeight}px)`; // Set the height to the scrollHeight
};