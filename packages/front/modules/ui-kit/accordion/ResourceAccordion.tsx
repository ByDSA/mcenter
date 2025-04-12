import React, { JSX } from "react";
import { classes } from "#modules/utils/styles";
import style from "./style.module.css";

export type AccordionHeader = JSX.Element;

type Props = {
 headerContent: AccordionHeader;
  bodyContent: JSX.Element;
};
export function ResourceAccordion( { headerContent, bodyContent }: Props) {
  const [isBodyVisible, setBodyVisible] = React.useState(false);

  return (
    <div className={classes(style.container, "ui-kit-accordion")}>
      <div className={classes(style.header, "header", "noselect")} onClick={()=>setBodyVisible(!isBodyVisible)}>
        {headerContent}
      </div>
      <div className={classes(style.body, "body")} style={
        {
          display: isBodyVisible ? "block" : "none",
        }
      }>
        {bodyContent}
      </div>
    </div>
  );
}
