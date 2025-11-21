import { JSX } from "react";
import { ScrollStatus } from "#modules/ui-kit/ScrollStatus";
import { PageSpinner } from "#modules/ui-kit/spinner/Spinner";

type DataRenderParams<T> = {
  data: T;
  error: unknown;
  scroll?: {
    observerRef: React.RefObject<HTMLDivElement | null>;
  };
  isLoading: boolean;
  render: (data: NonNullable<T>)=> JSX.Element;
};
export function renderFetchedData<T>(
  { error, isLoading, render, data, scroll }: DataRenderParams<T>,
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

    const errorMessage = errorShown.message;
    const hideMessages = ["Failed to fetch"];

    return <>
      <p style={{
        textAlign: "center",
      }}>Failed to request.</p>
      {errorMessage
        && !hideMessages.includes(errorMessage)
        && <pre>{errorMessage.split("\n").map(e=><pre key={e} style={{
          margin: 0,
        }}>{e}</pre>)}</pre>}
    </>;
  }

  if (!data && isLoading)
    return <PageSpinner />;

  if (!data)
    return <span>Empty data.</span>;

  return <>
    {render(data)}
    {scroll
      && <ScrollStatus ref={scroll.observerRef} isLoading={isLoading} error={error}/>}
  </>;
}
