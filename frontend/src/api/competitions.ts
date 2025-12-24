import { BE_BASE_URL } from '../constants';
import {
  Competition,
  CompetitionCreate,
  CompetitionLogoUpload,
} from '../types';

export const fetchCompetitions = async (): Promise<Competition[]> => {
  const res: Response = await fetch(`${BE_BASE_URL}/competitions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch competitions');
  }

  const data: Competition[] = await res.json();
  return data;
};

export const createCompetition = async (
  data: CompetitionCreate
): Promise<void> => {
  if (!data.name || !data.date || !data.location) return;
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('date', data.date);
  formData.append('location', data.location);

  if (data.logoFile) {
    formData.append('logo', data.logoFile);
  }

  const res: Response = await fetch(`${BE_BASE_URL}/competitions`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Competition creation failed');
  }
};

export const uploadCompetitionLogo = async (
  update: CompetitionLogoUpload
): Promise<Competition> => {
  const { competitionId, logoFile } = update;

  const formData = new FormData();
  if (logoFile) {
    formData.append('logo', logoFile);
  }

  console.log('update:', update);
  console.log('formData logo:', formData);

  const res: Response = await fetch(
    `${BE_BASE_URL}/competitions/logo/${competitionId}`,
    {
      method: 'POST',
      body: formData,
    }
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Logo upload failed');
  }

  return res.json() as Promise<Competition>;
};
