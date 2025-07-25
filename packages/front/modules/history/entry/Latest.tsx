import { Fragment, useEffect, useState } from "react";
import { DataResponse } from "$shared/utils/http/responses";
import { FetchingRender, UseRequest, makeFetcher, makeUseRequest } from "#modules/fetching";
import { DateFormat, formatDate } from "#modules/utils/dates";
import { Entry } from "#modules/utils/resources/useResourceEdition";

type Props<Req, Res> = {
  url: string;
  body: Req;
  validator: (resBody: Res)=> void;
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type HooksRet = {
  datesStr: string[];
};

export function Lastest<
T extends Entry<any, any>,
 ReqBody,
 ResBody extends DataResponse<T[]> = DataResponse<T[]>
 >(
  { validator, url, body, dateFormat = DATE_FORMAT_DEFAULT }: Props<ReqBody, ResBody>,
) {
  const method = "POST";
  const fetcher = makeFetcher<ReqBody, ResBody>( {
    method,
    body,
    resBodyValidator: validator,
  } );
  const useRequest: UseRequest<ResBody> = makeUseRequest<ReqBody, ResBody>( {
    key: {
      url,
      method,
      body,
    },
    fetcher,
  } );

  return FetchingRender<ResBody, HooksRet>( {
    useRequest,
    hooks: (res) => {
      const [datesStr, setDatesStr] = useState([] as string[]);

      useEffect(() => {
        const f = () => {
          const timestamps = res?.data.map((entry: T) => entry.date.timestamp);
          const newDatesStr = timestamps?.map(
            (timestamp) => formatDate(new Date(timestamp * 1000), dateFormat),
          ) ?? [];

          if (!deepCompareArrays(datesStr, newDatesStr))
            setDatesStr(newDatesStr);
        };

        f();

        const interval = setInterval(f, 5 * 1000);

        return () => clearInterval(interval);
      }, [res]);

      return {
        datesStr,
      };
    },
    render: (res, hooksRet) => {
      const { datesStr } = hooksRet;

      if (res.data.length === 0)
        return <span>No se había reproducido antes.</span>;

      return <>
        <span className={"height2"}>Últimas veces:</span>
        {datesStr.map((d: string, i) => <Fragment key={`${res.data[i].date.timestamp}`}>
          <span className={"line"}>{d}</span>
        </Fragment>)}
      </>;
    },
  } );
}

function deepCompareArrays<T>(a: T[], b: T[]) {
  if (a.length !== b.length)
    return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i])
      return false;
  }

  return true;
}
