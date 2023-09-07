/* eslint-disable require-await */
import useSWR from "swr";
// eslint-disable-next-line import/no-relative-packages
import { HistoryEntry, HistoryListGetManyEntriesBySuperIdRequest, assertIsHistoryListGetManyEntriesBySearchResponse } from "../../shared/build/models/historyLists";

const URL = "http://localhost:8011/api/history-list/entries/search";
const bodyJson: HistoryListGetManyEntriesBySuperIdRequest["body"] = {
  "filter": {
  },
  "sort": {
    "timestamp": "desc",
  },
  "limit": 10,
  "expand": ["episodes", "series"],
};

export const fetcher = async (url: string) => {
  const options = {
    method: "POST",
    cors: "no-cors",
    body: JSON.stringify(bodyJson),
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  return fetch(url, options).then(r => r.json());
};

export default function Page() {
  const { data, error, isLoading } = useSWR(
    URL,
    fetcher,
  );

  if (error)
    return <p>Failed to load.</p>;

  if (isLoading)
    return <p>Loading...</p>;

  assertIsHistoryListGetManyEntriesBySearchResponse(data);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Serie</th>
            <th>Id</th>
            <th>Episodio</th>
            <th>weight</th>
            <th>Fecha</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry: HistoryEntry) => (
            <tr key={`${entry.serieId } ${ entry.episodeId}`}>
              <td>{entry.serie.name}</td>
              <td>{entry.episode.episodeId}</td>
              <td>{entry.episode.title}</td>
              <td>{entry.episode.weight}</td>
              <td>{new Date(entry.date.timestamp * 1000).toLocaleString()}</td>
              <td>{entry.episode.start}</td>
              <td>{entry.episode.end}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
    td, tr, th {
      padding: 0.5rem;
    }

    table {
      border-collapse: collapse;
      display: block;
    }
    `}</style>
    </>
  );
}