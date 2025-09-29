import path from "node:path";
import fs from "node:fs";
import { Injectable } from "@nestjs/common";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import juice from "juice";

export type TemplateProps<T> = {
    component: React.ComponentType<T>;
    ctx: T;
  };

type RenderProps<T> = {
  template: TemplateProps<T>;
};

const css = fs.readFileSync(path.join(__dirname, "./templates/styles.css"), "utf-8");

@Injectable()
export class ReactRenderService {
  render<T = object>( { template }: RenderProps<T>): string {
    const element = React.createElement(
      template.component as React.ComponentType<any>,
      template.ctx,
    );
    const html = renderToStaticMarkup(element);
    // Limpiar class attributes manualmente
    let inlineStyleHtml = juice.inlineContent(html, css, {
      resolveCSSVariables: true,
    } );

    inlineStyleHtml = inlineStyleHtml.replace(/\s*class="[^"]*"/g, "");

    return inlineStyleHtml;
  }
}
