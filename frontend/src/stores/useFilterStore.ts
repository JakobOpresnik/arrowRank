import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FilterStore {
  clubFilter: string | null;
  categoryFilter: string | null;
  genderFilter: string | null;
  ageGroupFilter: string | null;
  setClubFilter: (club: string | null) => void;
  setCategoryFilter: (category: string | null) => void;
  setGenderFilter: (gender: string | null) => void;
  setAgeGroupFilter: (ageGroup: string | null) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      clubFilter: null,
      categoryFilter: null,
      genderFilter: null,
      ageGroupFilter: null,
      setClubFilter: (club: string | null) =>
        set((state) => ({ ...state, clubFilter: club })),
      setCategoryFilter: (category: string | null) =>
        set((state) => ({ ...state, categoryFilter: category })),
      setGenderFilter: (gender: string | null) =>
        set((state) => ({ ...state, genderFilter: gender })),
      setAgeGroupFilter: (ageGroup: string | null) =>
        set((state) => ({ ...state, ageGroupFilter: ageGroup })),
      clearFilters: () =>
        set(() => ({
          categoryFilter: null,
          genderFilter: null,
          ageGroupFilter: null,
        })),
    }),
    {
      name: 'filter-store', // name of the item in storage
    }
  )
);
