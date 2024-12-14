/* eslint-disable max-statements-per-line */
import { CstParser } from "chevrotain";
import { AdditionOperator, Colon, Comma, GreaterEqual, GreaterThan, LBracket, LessEqual, LessThan, LParen, MultiplicationOperator, NumberLiteral, RBracket, RParen, StringLiteral, TagIdentifier, tokens, WeightIdentifier, YearIdentifier } from "./QueryLexer";

// eslint-disable-next-line import/prefer-default-export
export class QueryParser extends CstParser {
  constructor() {
    super(tokens);
    this.performSelfAnalysis();
  }

  public expression = this.RULE("expression", () => {
    this.SUBRULE(this.additionExpression);
  } );

  private additionExpression = this.RULE("additionExpression", () => {
    this.SUBRULE(this.multiplicationExpression);
    this.MANY(() => {
      this.CONSUME(AdditionOperator);
      this.SUBRULE2(this.multiplicationExpression);
    } );
  } );

  private multiplicationExpression = this.RULE("multiplicationExpression", () => {
    this.SUBRULE(this.atomicExpression);
    this.MANY(() => {
      this.CONSUME(MultiplicationOperator);
      this.SUBRULE2(this.atomicExpression);
    } );
  } );

  private atomicExpression = this.RULE("atomicExpression", () => {
    this.OR([
      // parenthesisExpression has the highest precedence and thus it appears
      // in the "lowest" leaf in the expression ParseTree.
      {
        ALT: () => this.SUBRULE(this.parenthesisExpression),
      },
      {
        ALT: () => this.SUBRULE2(this.filter),
      },
    ]);
  } );

  private parenthesisExpression = this.RULE("parenthesisExpression", () => {
    this.CONSUME(LParen);
    this.SUBRULE(this.expression);
    this.CONSUME(RParen);
  } );

  // private andOperation = this.RULE("andOperation", () => {
  //   this.SUBRULE1(this.filter);
  //   this.CONSUME(Plus);
  //   this.SUBRULE2(this.filter);
  // } );

  // private notOperation = this.RULE("notOperation", () => {
  //   this.CONSUME(Not);
  //   this.SUBRULE(this.filter);
  // } );

  private filter = this.RULE("filter", () => {
    this.OR([
      {
        ALT: () => this.SUBRULE(this.yearFilter),
      },
      {
        ALT: () => this.SUBRULE(this.weightFilter),
      },
      {
        ALT: () => this.SUBRULE(this.tagFilter),
      },
    ]);
  } );

  private yearFilter = this.RULE("yearFilter", () => {
    this.CONSUME(YearIdentifier);
    this.CONSUME(Colon);
    this.OR([
      {
        ALT: () => this.SUBRULE(this.range),
      }, // range
      {
        ALT: () => this.SUBRULE(this.shortRange),
      }, // short range
      {
        ALT: () => this.CONSUME(NumberLiteral),
      }, // exact value
    ]);
  } );

  private weightFilter = this.RULE("weightFilter", () => {
    this.CONSUME(WeightIdentifier);
    this.CONSUME(Colon);
    this.OR([
      {
        ALT: () => this.SUBRULE(this.range),
      }, // range
      {
        ALT: () => this.SUBRULE(this.shortRange),
      }, // short range
      {
        ALT: () => this.CONSUME(NumberLiteral),
      }, // exact value
    ]);
  } );

  private tagFilter = this.RULE("tagFilter", () => {
    this.CONSUME(TagIdentifier); // tag
    this.CONSUME(Colon);
    this.CONSUME(StringLiteral); // tag value
  } );

  // Nueva regla para rangos
  private range = this.RULE("range", () => {
    this.CONSUME1(LBracket);
    this.OR([
      {
        ALT: () => {
          this.CONSUME1(NumberLiteral); // min value
          this.CONSUME1(Comma);
          this.CONSUME2(NumberLiteral); // max value
        },
      },
      {
        ALT: () => {
          this.CONSUME2(Comma);
          this.CONSUME3(NumberLiteral); // max value
        },
      },
      {
        ALT: () => {
          this.CONSUME4(NumberLiteral); // min value
          this.CONSUME3(Comma);
        },
      },
    ]);
    this.CONSUME3(RBracket);
  } );

  private shortRange = this.RULE("shortRange", () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(GreaterEqual);
          this.CONSUME5(NumberLiteral); // min value
        },
      },
      {
        ALT: () => {
          this.CONSUME(GreaterThan);
          this.CONSUME6(NumberLiteral); // min value
        },
      },
      {
        ALT: () => {
          this.CONSUME(LessEqual);
          this.CONSUME7(NumberLiteral); // max value
        },
      },
      {
        ALT: () => {
          this.CONSUME(LessThan);
          this.CONSUME8(NumberLiteral); // max value
        },
      },
    ]);
  } );
}