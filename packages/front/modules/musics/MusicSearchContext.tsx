import { create } from "zustand";

type MusicFilters = {
  query: string | undefined;
};

interface MusicSearchState {
  filters: MusicFilters;

  // Setters
  setQueryFilter: (q: string | undefined)=> void;
}

export const useMusicSearch = create<MusicSearchState>()(
  (set, get) => ( {
    filters: {
      query: undefined,
    },
    setQueryFilter: (newValue) => set( {
      filters: {
        ...get().filters,
        query: newValue,
      },
    } ),

  } ),
);
