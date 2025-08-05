function hashStringToNumber(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export default function getAvatarUrl(seed: string) {
  const colors = ["D3ADF7", "FFA39E", "F78FB3", "69C0FF", "95DE64", "FFC069"];

  const hash = hashStringToNumber(seed);
  const deterministicColor = colors[hash % colors.length];

  return `https://api.dicebear.com/9.x/big-smile/svg?seed=${seed}&backgroundColor=${deterministicColor}`;
}
