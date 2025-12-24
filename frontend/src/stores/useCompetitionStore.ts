import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Competition } from '../types';

export interface CompetitionStore {
  selectedCompetition: Competition | null;
  setSelectedCompetition: (competition: Competition | null) => void;
  deselectCompetition: (competitionId: number) => void;
}

export const useCompetitionStore = create<CompetitionStore>()(
  persist(
    (set) => ({
      selectedCompetition: null,
      setSelectedCompetition: (competition: Competition | null) =>
        set({ selectedCompetition: competition }),
      deselectCompetition: (competitionId: number) =>
        set((state) => ({
          selectedCompetition:
            state.selectedCompetition?.id === competitionId
              ? null
              : state.selectedCompetition,
        })),
    }),
    {
      name: 'competition-store', // key in localStorage
      //   partialize: (state) => ({
      //     selectedCompetition: state.selectedCompetition,
      //   }),
    }
  )
);

// export const useCompetitionStore = create<CompetitionStore>((set) => ({
//   selectedCompetition: null,
//   setSelectedCompetition: (competition: Competition | null) =>
//     set({ selectedCompetition: competition }),
// }));
