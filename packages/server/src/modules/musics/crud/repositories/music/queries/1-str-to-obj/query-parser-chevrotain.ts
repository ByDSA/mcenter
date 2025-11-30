import { CstParser } from "chevrotain";
import { addedIdentifier, additionOperator, colon, comma, greaterEqual, greaterThan, isoDateLiteral, lBracket, lessEqual, lessThan, lParen, multiplicationOperator, numberLiteral, playedIdentifier, playlistIdentifier, privatePlaylistLiteral, publicPlaylistLiteral, rBracket, relativeDateLiteral, rParen, stringLiteral, tagIdentifier, tokens, weightIdentifier, yearIdentifier } from "./query-lexer";

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
      {
        ALT: () => this.SUBRULE(this.playedFilter),
      },
      {
        ALT: () => this.SUBRULE(this.addedFilter),
      },
      {
        ALT: () => this.SUBRULE(this.publicPlaylistFilter),
      },
      {
        ALT: () => this.SUBRULE(this.privatePlaylistFilter),
      },
    ]);
  } );

  private yearFilter = this.RULE("yearFilter", () => {
    this.CONSUME(yearIdentifier);
    this.CONSUME(colon);
    this.OR([
      {
        ALT: () => this.SUBRULE(this.rangeNumber),
      }, // range
      {
        ALT: () => this.SUBRULE(this.shortRangeNumber),
      }, // short range
      {
        ALT: () => this.CONSUME(numberLiteral),
      }, // exact value
    ]);
  } );

  private playedFilter = this.RULE("playedFilter", () => {
    this.CONSUME(playedIdentifier);
    this.CONSUME(colon);
    this.SUBRULE(this.shortRangeTime);
  } );

  private addedFilter = this.RULE("addedFilter", () => {
    this.CONSUME(addedIdentifier);
    this.CONSUME(colon);
    this.SUBRULE(this.shortRangeTime);
  } );

  private weightFilter = this.RULE("weightFilter", () => {
    this.CONSUME(weightIdentifier);
    this.CONSUME(colon);
    this.OR([
      {
        ALT: () => this.SUBRULE(this.rangeNumber),
      }, // range
      {
        ALT: () => this.SUBRULE(this.shortRangeNumber),
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

  private privatePlaylistFilter = this.RULE("privatePlaylistFilter", () => {
    this.CONSUME(playlistIdentifier);
    this.CONSUME(colon);
    this.CONSUME(privatePlaylistLiteral);
  } );

  private publicPlaylistFilter = this.RULE("publicPlaylistFilter", () => {
    this.CONSUME(playlistIdentifier);
    this.CONSUME(colon);
    this.CONSUME(publicPlaylistLiteral);
  } );

  // Nueva regla para rangos
  private rangeNumber = this.RULE("rangeNumber", () => {
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

  private timeValue = this.RULE("timeValue", () => {
    this.OR([
      {
        ALT: () => this.CONSUME(numberLiteral),
      }, // timestamps numéricos
      {
        ALT: () => this.CONSUME(relativeDateLiteral),
      }, // 1y-ago, 2months-ago, etc.
      {
        ALT: () => this.CONSUME(isoDateLiteral),
      }, // 2024-01-15
    ]);
  } );

  private shortRangeNumber = this.RULE("shortRangeNumber", () => {
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

private shortRangeTime = this.RULE("shortRangeTime", () => {
  this.OR([
    {
      ALT: () => {
        this.CONSUME(greaterEqual);
        this.SUBRULE(this.timeValue); // >= valor
      },
    },
    {
      ALT: () => {
        this.CONSUME(greaterThan);
        this.SUBRULE2(this.timeValue); // > valor
      },
    },
    {
      ALT: () => {
        this.CONSUME(lessEqual);
        this.SUBRULE3(this.timeValue); // <= valor
      },
    },
    {
      ALT: () => {
        this.CONSUME(lessThan);
        this.SUBRULE4(this.timeValue); // < valor
      },
    },
  ]);
} );
}
