export const getSuggestedCourse = ({
  bestRate,
  bestRateReversed,
  googleRate,
}: {
  bestRate?: number;
  bestRateReversed?: number;
  googleRate?: number;
}): number | undefined => {
  if (!bestRateReversed || !bestRate) return googleRate;
  const average = (bestRateReversed + bestRate) / 2;
  return (bestRate + average) / 2;
};

const differMoreThan10Percent = (a: number, b: number) =>
  Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)) > 0.1;
