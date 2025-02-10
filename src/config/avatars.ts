export const AVATAR_STYLES = [
  { id: 'adventurer', name: 'Adventurer', preview: '👤' },
  { id: 'adventurer-neutral', name: 'Adventurer Neutral', preview: '👤' },
  { id: 'avataaars', name: 'Avataaars', preview: '👤' },
  { id: 'big-ears', name: 'Big Ears', preview: '👤' },
  { id: 'big-ears-neutral', name: 'Big Ears Neutral', preview: '👤' },
  { id: 'big-smile', name: 'Big Smile', preview: '😊' },
  { id: 'bottts', name: 'Bottts', preview: '🤖' },
  { id: 'croodles', name: 'Croodles', preview: '✏️' },
  { id: 'croodles-neutral', name: 'Croodles Neutral', preview: '✏️' },
  { id: 'fun-emoji', name: 'Fun Emoji', preview: '😄' },
  { id: 'icons', name: 'Icons', preview: '🎨' },
  { id: 'identicon', name: 'Identicon', preview: '🔷' },
  { id: 'initials', name: 'Initials', preview: 'AB' },
  { id: 'lorelei', name: 'Lorelei', preview: '👩' },
  { id: 'lorelei-neutral', name: 'Lorelei Neutral', preview: '👤' },
  { id: 'micah', name: 'Micah', preview: '👤' },
  { id: 'miniavs', name: 'Mini Avatars', preview: '👤' },
  { id: 'notionists', name: 'Notionists', preview: '👥' },
  { id: 'open-peeps', name: 'Open Peeps', preview: '👥' },
  { id: 'personas', name: 'Personas', preview: '👤' },
  { id: 'pixel-art', name: 'Pixel Art', preview: '🎮' },
  { id: 'rings', name: 'Rings', preview: '⭕' },
  { id: 'shapes', name: 'Shapes', preview: '⬡' },
  { id: 'thumbs', name: 'Thumbs', preview: '👍' }
];

export const generateAvatarUrl = (style: string, seed: string) => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}; 