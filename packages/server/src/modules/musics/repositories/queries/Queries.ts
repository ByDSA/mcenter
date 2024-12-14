import { Request } from "express";
import { QueryLexer } from "./1-str-to-obj/QueryLexer";
import { parseQuery } from "./1-str-to-obj/QueryParser";
import { QueryParser } from "./1-str-to-obj/QueryParserChevrotain";
import { ExpressionNode, IntersectionNode, TagNode, WeightNode } from "./QueryObject";

const parserInstance = new QueryParser();
const BaseVisitor = parserInstance.getBaseCstVisitorConstructor();

class QueryEvaluator extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  expression(ctx: any): (song: any)=> boolean {
    const terms = [this.visit(ctx.term[0])];

    if (ctx.Plus) {
      ctx.Plus.forEach((_: any, i: number) => {
        const term = this.visit(ctx.term[i + 1]);

        terms.push((song: any) => terms[i](song) || term(song));
      } );
    }

    if (ctx.Star) {
      ctx.Star.forEach((_: any, i: number) => {
        const term = this.visit(ctx.term[i + 1]);

        terms.push((song: any) => terms[i](song) && term(song));
      } );
    }

    if (ctx.Minus) {
      ctx.Minus.forEach((_: any, i: number) => {
        const term = this.visit(ctx.term[i + 1]);

        terms.push((song: any) => terms[i](song) && !term(song));
      } );
    }

    return (song: any) => terms.every(fn => fn(song));
  }

  // eslint-disable-next-line class-methods-use-this
  filter(ctx: any): (song: any)=> boolean {
    const property = ctx.Identifier[0].image;

    if (ctx.StringLiteral) {
      const value = ctx.StringLiteral[0].image.replace(/['"]/g, "");

      return (song: any) => song[property]?.includes(value);
    }

    if (ctx.NumberLiteral.length === 1) {
      const value = parseFloat(ctx.NumberLiteral[0].image);

      return (song: any) => song[property] === value;
    }

    const min = parseFloat(ctx.NumberLiteral[0].image);
    const max = parseFloat(ctx.NumberLiteral[1].image);

    return (song: any) => song[property] >= min && song[property] <= max;
  }
}

// Función principal
export function filterSongs(query: string, songs: any[]): any[] {
  const lexingResult = QueryLexer.tokenize(query);

  if (lexingResult.errors.length > 0)
    throw new Error("Error de tokenización");

  parserInstance.input = lexingResult.tokens;
  const cst = parserInstance.expression();

  if (parserInstance.errors.length > 0)
    throw new Error("Error de parsing");

  const evaluator = new QueryEvaluator();
  const filterFn = evaluator.visit(cst);

  return songs.filter(filterFn);
}

export function requestToFindMusicParams(req: Request): ExpressionNode | null {
  const query = <string | undefined>req.query.q;

  if (!query)
    return oldForm(req);

  return parseQuery(query).root;
}

/**
 * @deprecated
 */
function oldForm(req: Request): ExpressionNode | null {
  const tagsQuery = <string | undefined>req.query.tags;
  const minWeightQuery = <string | undefined>req.query.minWeight;
  const maxWeightQuery = <string | undefined>req.query.maxWeight;
  let tagsNode: TagNode | undefined;
  let weightNode: WeightNode | undefined;

  if (tagsQuery) {
    tagsNode = {
      type: "tag",
      value: tagsQuery,
    } satisfies TagNode;
  }

  const min = minWeightQuery ? +minWeightQuery : null;
  const max = maxWeightQuery ? +maxWeightQuery : null;

  if (min !== null && max !== null) {
    weightNode = {
      type:"weight",
      value: {
        type:"range",
        min,
        minIncluded: true,
        max,
        maxIncluded: true,
      },
    };
  } else if (min !== null) {
    weightNode = {
      type:"weight",
      value: {
        type:"range",
        min,
        minIncluded: true,
      },
    };
  } else if (max !== null) {
    weightNode = {
      type:"weight",
      value: {
        type:"range",
        max,
        maxIncluded: true,
      },
    };
  }

  if (tagsNode && weightNode) {
    return {
      type:"intersection",
      child1: tagsNode,
      child2: weightNode,
    } satisfies IntersectionNode;
  }

  if (tagsNode)
    return tagsNode;

  if (weightNode)
    return weightNode;

  return null;
}