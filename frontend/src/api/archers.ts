import i18n from '../i18n';
import { BE_BASE_URL } from '../constants';
import {
  ArchersUploadProps,
  Archer,
  ArcherUpdate,
  ArcherCreate,
} from '../types';

export const uploadArchers = async (
  uploadData: ArchersUploadProps,
): Promise<void> => {
  if (!uploadData.file) return;
  const formData = new FormData();
  formData.append('file', uploadData.file);
  formData.append('competition_id', `${uploadData.competitionId}`);
  formData.append('language', uploadData.language);

  const res: Response = await fetch(`${BE_BASE_URL}/archers/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    let message = i18n.t('errorUploadArchers', { status: res.status });
    try {
      const errorData = await res.json();
      const detail = Array.isArray(errorData.detail)
        ? errorData.detail.map((e: { loc: string[]; msg: string }) => `${e.loc.join('.')}: ${e.msg}`).join('; ')
        : errorData.detail;
      message = detail || errorData.message || message;
    } catch {
      /* response was not JSON */
    }
    throw new Error(message);
  }
};

export const fetchArcher = async (
  competitionId: number,
  archerId: number | null,
): Promise<Archer> => {
  if (!archerId) throw new Error(i18n.t('errorFetchArcher'));

  const res: Response = await fetch(
    `${BE_BASE_URL}/archer/${competitionId}/${archerId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  if (!res.ok) throw new Error(i18n.t('errorFetchArcher'));

  const data: Archer = await res.json();
  return data;
};

export const fetchArchers = async (
  competitionId: number,
  // excludeScores: boolean = false
): Promise<Archer[]> => {
  const res: Response = await fetch(`${BE_BASE_URL}/archers/${competitionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(i18n.t('errorFetchArchers'));

  const data: Archer[] = await res.json();
  return data;
};

export const fetchArchersFiltered = async (
  competitionId: number,
  club?: string,
  bowCategory?: string,
  gender?: string,
  ageGroup?: string,
  sort?: 'asc' | 'desc',
): Promise<Archer[]> => {
  const params = new URLSearchParams();
  if (club) params.append('club', club);
  if (bowCategory) params.append('bow_category', bowCategory);
  if (gender) params.append('gender', gender);
  if (ageGroup) params.append('age_group', ageGroup);
  if (sort) params.append('sort', sort);

  const res: Response = await fetch(
    `${BE_BASE_URL}/archers/filter/${competitionId}?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  if (!res.ok) throw new Error(i18n.t('errorFetchArchers'));

  const data: Archer[] = await res.json();
  return data;
};

export const updateArcherScore = async (
  update: ArcherUpdate,
): Promise<void> => {
  const res: Response = await fetch(`${BE_BASE_URL}/archers/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || i18n.t('errorUpdateScore'));
  }
};

export const clearArcherScore = async (archerId: number): Promise<void> => {
  const res: Response = await fetch(
    `${BE_BASE_URL}/archers/clear_score/${archerId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || i18n.t('errorClearScore'));
  }
};

export const clearArcherScores = async (
  competitionId: number,
): Promise<void> => {
  const res: Response = await fetch(
    `${BE_BASE_URL}/archers/clear_scores/${competitionId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || i18n.t('errorClearScores'));
  }
};

export const createArcher = async (data: ArcherCreate): Promise<void> => {
  if (
    !data.first_name ||
    !data.last_name ||
    !data.club ||
    !data.competition ||
    !data.category ||
    !data.gender ||
    !data.age_group
  )
    return;

  const res: Response = await fetch(`${BE_BASE_URL}/archers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const detail = Array.isArray(errorData.detail)
      ? errorData.detail
          .map(
            (e: { loc: string[]; msg: string }) =>
              `${e.loc.join('.')}: ${e.msg}`,
          )
          .join('; ')
      : errorData.detail;
    throw new Error(detail || errorData.message || i18n.t('errorCreateArcher'));
  }
};

export const deleteArcher = async (archerId: number): Promise<void> => {
  const res: Response = await fetch(`${BE_BASE_URL}/archers/${archerId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || i18n.t('errorDeleteArcher'));
  }
};

export const deleteAllArchers = async (competitionId: number): Promise<void> => {
  const res: Response = await fetch(
    `${BE_BASE_URL}/archers/competition/${competitionId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || i18n.t('errorDeleteArchers'));
  }
};
