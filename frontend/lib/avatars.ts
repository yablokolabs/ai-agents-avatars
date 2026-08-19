import collection from './collection.json';

export interface Avatar {
  id: number;
  name: string;
  imageUrl: string;
  traits: { key: string; value: string }[];
}

export const avatars: Avatar[] = collection;

export const TOTAL = avatars.length;
