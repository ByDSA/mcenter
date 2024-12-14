import { Request } from "express";
import { QueryLexer } from "./1-str-to-obj/QueryLexer";
import { QueryParser } from "./1-str-to-obj/QueryParserChevrotain";

export type FindParams = {
  tags?: string[];
  weight?: {
    max?: number;
    min?: number;
  };
};

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

export function requestToFindMusicParams(req: Request): FindParams {
  const tagsQuery = <string | undefined>req.query.tags;
  const minWeightQuery = <string | undefined>req.query.minWeight;
  const maxWeightQuery = <string | undefined>req.query.maxWeight;
  const params: FindParams = {
  };

  if (minWeightQuery !== undefined || maxWeightQuery !== undefined){
    params.weight = {
    };

    if (minWeightQuery !== undefined)
      params.weight.min = +minWeightQuery;

    if (maxWeightQuery !== undefined)
      params.weight.max = +maxWeightQuery;
  }

  if (tagsQuery) {
    const multipleTags = tagsQuery.split(",");

    params.tags = multipleTags;
  }

  return params;
}
