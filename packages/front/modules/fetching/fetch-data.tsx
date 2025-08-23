import { useState, useEffect } from "react";

export type Props<D> = {
  fetchFn: ()=> Promise<D>;
};

type UseReturn<D extends unknown[]> = {
  data: D | null;
  error: unknown | undefined;
  isLoading: boolean;
};

export function useFetchStaticData<D extends unknown[]>(
  props: Props<D>,
): UseReturn<D> {
  const { fetchFn } = props;
  const [data, setData] = useState<D | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | undefined>(undefined);

  useEffect(() => {
    const fetchInitData = async () => {
      const result = await fetchFn();

      setData(result);
    };

    fetchInitData()
      .then(() => {
        setIsLoading(false);
      } )
      .catch(e => {
        setIsLoading(false);
        setError(e);
      } );
  }, []);

  return {
    data,
    error,
    isLoading,
  } as UseReturn<D>;
}
