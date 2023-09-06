import { isDebugging } from "#shared/utils/vscode";
import { NotFoundError } from "#utils/http/validation";
import { NextFunction, Request, Response } from "express";

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if ((process.env.NODE_ENV !== "test" || (process.env.NODE_ENV === "test" && isDebugging())) && err instanceof Error && err.stack) {// TODO: usar enums
    let output = `${ err.name }`;

    if (err.message)
      output += `: ${ err.message }`;

    process.stderr.write(["\x1b[", "1;91", "m", output, "\x1b[", "0;30" , "m", "\n"].join(""));
    process.stderr.write(err.stack.split("\n").slice(1)
      .map(line => {
        // color cyan from '(' to ':' (not included)
        const parenthesisStartIndex = line.indexOf("(");
        const parenthesisEndIndex = line.indexOf(")", parenthesisStartIndex);
        const parenthesisContent = line.slice(parenthesisStartIndex + 1, parenthesisEndIndex);

        // if (content) is not a path
        if (!parenthesisContent.includes("/"))
          return line;

        const cyanEnd = line.lastIndexOf(":", line.lastIndexOf(":", parenthesisEndIndex) - 1);
        const cyan = parenthesisContent.slice(0, cyanEnd - parenthesisStartIndex - 1);

        if (!cyan.includes("/"))
          return line;

        // construct full line with cyan
        return `${line.slice(0, parenthesisStartIndex + 1) }\x1b[0;36m${ cyan }\x1b[0;30m${ line.slice(cyanEnd)}`;
      } )
      .join("\n"));
    process.stderr.write("\n\x1b[0m");
  }

  if (err instanceof NotFoundError)
    res.sendStatus(404);
  else
    res.sendStatus(500);

  next();
} ;

export default errorHandler;