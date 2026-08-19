export interface Avatar {
  id: number;
  name: string;
  imageUrl: string;
  traits: { key: string; value: string }[];
  minted: boolean;
}

const TRAITS = [
  { key: 'Background', values: ['Cyan', 'Purple', 'Orange', 'Gray', 'Green'] },
  { key: 'Eyes', values: ['Blue', 'Red', 'Yellow', 'Black', 'White'] },
  { key: 'Hat', values: ['Cap', 'Helmet', 'Crown', 'None', 'Visor'] },
  { key: 'Expression', values: ['Smile', 'Neutral', 'Wink', 'Surprise', 'Laser'] },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateAvatar(index: number): Avatar {
  const h = hashString(`ai-agents-${index}`);
  const traits: Avatar['traits'] = TRAITS.map((t) => ({
    key: t.key,
    value: t.values[h % t.values.length],
  }));
  return {
    id: index,
    name: `AI Agent #${index + 1}`,
    imageUrl: `https://picsum.photos/seed/agent${index + 1}/300/300`,
    traits,
    minted: false,
  };
}

export function generateAvatars(count = 100): Avatar[] {
  return Array.from({ length: count }, (_, i) => generateAvatar(i));
}
