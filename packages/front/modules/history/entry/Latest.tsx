import { Fragment, useEffect, useState } from "react";
import { ResultResponse } from "$shared/utils/http/responses";
import { assertIsDefined } from "$shared/utils/validation";
import { makeFetcher, renderFetchedData } from "#modules/fetching";
import { DateFormat, formatDate } from "#modules/utils/dates";
import { Entry } from "#modules/utils/resources/useResourceEdition";
import { useFetchStaticData } from "#modules/fetching/fetch-data";

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

export function Lastest<
T extends Entry<any, any>,
 ReqBody,
 ResBody extends ResultResponse<T[]> = ResultResponse<T[]>
 >(
  { validator, url, body, dateFormat = DATE_FORMAT_DEFAULT }: Props<ReqBody, ResBody>,
) {
  const { data, error, isLoading } = useFetchStaticData( {
    fetchFn: async () => {
      const method = "POST";
      const fetcher = makeFetcher<ReqBody, ResBody>( {
        method,
        body,
        parseResponse: validator as (m: unknown)=> any,
      } );
      const result = await fetcher( {
        body,
        url,
      } );

      return result.data;
    },
  } );
  const [datesStr, setDatesStr] = useState([] as string[]);

  useEffect(() => {
    const f = () => {
      if (!data)
        return;

      const timestamps = data.map((entry: T) => entry.date.timestamp);
      const newDatesStr = timestamps?.map(
        (timestamp) => formatDate(new Date(timestamp * 1000), dateFormat),
      ) ?? [];

      if (!deepCompareArrays(datesStr, newDatesStr))
        setDatesStr(newDatesStr);
    };

    f();

    const interval = setInterval(f, 5 * 1000);

    return () => clearInterval(interval);
  }, [data]);

  return renderFetchedData<T[] | null>( {
    data,
    error,
    isLoading,
    render: () => {
      assertIsDefined(data);

      if (data.length === 0)
        return <span>No se había reproducido antes.</span>;

      return <>
        <span className={"height2"}>Últimas veces:</span>
        {datesStr.map((d: string, i) => <Fragment key={`${data[i].date.timestamp}`}>
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
