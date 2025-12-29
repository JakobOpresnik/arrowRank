import type { ReactNode } from 'react';
import { SUPPORTED_LANGUAGES } from './constants';
import { SxProps } from '@mui/joy/styles/types';

export interface Archer {
  id: number;
  first_name: string;
  last_name: string;
  club: string;
  competition: string;
  category: string;
  gender: string;
  age_group: string;
  score20?: number;
  score18?: number;
  score16?: number;
  score14?: number;
  score12?: number;
  score10?: number;
  score8?: number;
  score6?: number;
  score4?: number;
  score0?: number;
}

export const scoreKeys = [20, 18, 16, 14, 12, 10, 8, 6, 4, 0] as const;
export type ScoreKey = `score${(typeof scoreKeys)[number]}`;
export type ArcherScores = Pick<Archer, ScoreKey>;
export type ArcherUpdate = Pick<Archer, 'first_name' | 'last_name'> &
  Partial<Pick<Archer, 'club' | 'category' | 'age_group' | 'gender'>> &
  ArcherScores;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export interface Competition {
  id: number;
  name: string;
  date: string; // ISO format date string
  location: string;
  logo_url?: string | null; // URL to the saved logo image
  logoFile?: File | null; // optional logo file when uploading
}

export type CompetitionCreate = Omit<Competition, 'id'>;

export type CompetitionLogoUpload = {
  competitionId: number;
  logoFile: File | null;
};

export type ArcherCreate = Omit<Archer, 'id'> & { email?: string };

export interface MissingDataProps<T> {
  data: T[] | undefined;
  isLoading: boolean;
  error: Error | null;
  isTable?: boolean;
  children?: ReactNode;
}

export interface SelectCompetitionProps {
  onSelect?: () => void;
}

export interface Filters {
  club: string | null;
  category: string | null;
  gender: string | null;
  ageGroup: string | null;
}

export interface ArcherListProps {
  allArchers: Archer[] | undefined;
  selectedCompetition: number;
  selectedFilters: Filters;
  isLoadingArchers: boolean;
  onChangeFilter?: (filter: Filters) => void;
}

export interface ArchersUploadProps {
  file: File | null;
  competitionId: number;
  language: Language;
}

export interface UploadArchersProps {
  competitionId: number | null;
  onDone: () => void;
}

export interface AddScoreProps {
  open: boolean;
  selectedCompetition: number | null;
  selectedArcherId?: number | null;
  onArcherUpdate: (update: ArcherUpdate) => void;
  onClose: () => void;
}

export interface ClearScoresDialogProps {
  open: boolean;
  onClose: () => void;
  onClear: () => void;
}

export interface DeleteArcherProps {
  open: boolean;
  archerId: number;
  onClose: () => void;
  onDelete: (archerId: number, action: DeletionAction) => void;
}

export interface SelectCategoryProps {
  competitionId: number;
  selectedCategory: string;
  onChange: (category: string) => void;
}

export interface SelectGenderProps {
  competitionId: number;
  selectedGender: string;
  onChange: (gender: string) => void;
}

export interface SelectAgeGroupProps {
  competitionId: number;
  selectedAgeGroup: string;
  onChange: (ageGroup: string) => void;
}

export interface SelectClubProps {
  competitionId: number;
  clubs: string[];
  selectedClub: string;
  onChange: (club: string) => void;
}

export interface SelectLanguageProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

export interface CreateCompetitionProps {
  open: boolean;
  selectedCompetition: Competition | null;
  isLogoUploadOnly?: boolean;
  onCreated?: () => void;
  onUpdated?: (updated?: Competition) => void;
  onClose: () => void;
}

export interface ArcherExtended extends Archer {
  total: number;
  scoreArray: number[];
  rank: number | null;
}

export type ExcelRow = (string | number)[];

export interface ModalWrapperProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: number;
  sx?: SxProps;
}

export type OnCloseReason = 'backdropClick' | 'escapeKeyDown' | 'closeClick';

export type DeletionAction = 'clear-score' | 'delete-archer';

export type FilterableColumn = 'age' | 'gender' | 'category';
