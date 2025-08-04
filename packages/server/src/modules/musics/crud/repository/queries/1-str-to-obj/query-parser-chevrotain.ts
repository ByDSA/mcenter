import { CstParser } from "chevrotain";
import { additionOperator, colon, comma, greaterEqual, greaterThan, lBracket, lessEqual, lessThan, lParen, multiplicationOperator, numberLiteral, rBracket, rParen, stringLiteral, tagIdentifier, tokens, weightIdentifier, yearIdentifier } from "./query-lexer";

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
      this.CONSUME(additionOperator);
      this.SUBRULE2(this.multiplicationExpression);
    } );
  } );

  private multiplicationExpression = this.RULE("multiplicationExpression", () => {
    this.SUBRULE(this.atomicExpression);
    this.MANY(() => {
      this.CONSUME(multiplicationOperator);
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
    this.CONSUME(lParen);
    this.SUBRULE(this.expression);
    this.CONSUME(rParen);
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
    this.CONSUME(yearIdentifier);
    this.CONSUME(colon);
    this.OR([
      {
        ALT: () => this.SUBRULE(this.range),
      }, // range
      {
        ALT: () => this.SUBRULE(this.shortRange),
      }, // short range
      {
        ALT: () => this.CONSUME(numberLiteral),
      }, // exact value
    ]);
  } );

  private weightFilter = this.RULE("weightFilter", () => {
    this.CONSUME(weightIdentifier);
    this.CONSUME(colon);
    this.OR([
      {
        ALT: () => this.SUBRULE(this.range),
      }, // range
      {
        ALT: () => this.SUBRULE(this.shortRange),
      }, // short range
      {
        ALT: () => this.CONSUME(numberLiteral),
      }, // exact value
    ]);
  } );

  private tagFilter = this.RULE("tagFilter", () => {
    this.CONSUME(tagIdentifier); // tag
    this.CONSUME(colon);
    this.CONSUME(stringLiteral); // tag value
  } );

  // Nueva regla para rangos
  private range = this.RULE("range", () => {
    this.CONSUME1(lBracket);
    this.OR([
      {
        ALT: () => {
          this.CONSUME1(numberLiteral); // min value
          this.CONSUME1(comma);
          this.CONSUME2(numberLiteral); // max value
        },
      },
      {
        ALT: () => {
          this.CONSUME2(comma);
          this.CONSUME3(numberLiteral); // max value
        },
      },
      {
        ALT: () => {
          this.CONSUME4(numberLiteral); // min value
          this.CONSUME3(comma);
        },
      },
    ]);
    this.CONSUME3(rBracket);
  } );

  private shortRange = this.RULE("shortRange", () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(greaterEqual);
          this.CONSUME5(numberLiteral); // min value
        },
      },
      {
        ALT: () => {
          this.CONSUME(greaterThan);
          this.CONSUME6(numberLiteral); // min value
        },
      },
      {
        ALT: () => {
          this.CONSUME(lessEqual);
          this.CONSUME7(numberLiteral); // max value
        },
      },
      {
        ALT: () => {
          this.CONSUME(lessThan);
          this.CONSUME8(numberLiteral); // max value
        },
      },
    ]);
  } );
}
