import { JSX } from "react";
import { LoadingSpinner } from "./loading";

type DataRenderParams<T> = {
  data: T;
  error: unknown;
  isLoading: boolean;
  render: (data: NonNullable<T>)=> JSX.Element;
};
export function renderFetchedData<T>(
  { error, isLoading, render, data }: DataRenderParams<T>,
): JSX.Element {
  if (!data && error) {
    const errorShown = {
      message: error instanceof Error
        ? error.message
          .replaceAll("\\n", "\n")
          .replaceAll("\\\"", "\"")
        : undefined,
    };

    try {
      errorShown.message = JSON.parse(errorShown.message ?? "{}");
    } catch {
      // Ignore JSON parse errors
    }

    return <>
      <p>Failed to request.</p>
      {error && <pre>{errorShown.message?.split("\n").map(e=><pre key={e} style={{
        margin: 0,
      }}>{e}</pre>)}</pre>}
    </>;
  }

  if (!data && isLoading)
    return LoadingSpinner;

  if (!data)
    return <span>Empty data.</span>;

  return <>
    {render(data)}
    {isLoading
      ? <span style={{
        display: "block",
        marginTop: "2em",
      }}>{LoadingSpinner}</span>
      : null}
  </>;
}
