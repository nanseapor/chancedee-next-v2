export function rankResults(
  records: (Record<string, any> | undefined)[],
): (Record<string, any> | undefined)[] {
  return records?.sort((a, b) => {
    if (!a || !b) return 0;
    const scoreA = a.relevanceScore * 0.7 + a.popularity * 0.3;
    const scoreB = b.relevanceScore * 0.7 + b.popularity * 0.3;
    return scoreB - scoreA;
  });
}
