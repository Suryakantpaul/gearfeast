const calculateReviewPoints = (reviewText, hasMedia = false) => {
  let points = 0;

  const wordCount = reviewText.trim().split(/\s+/).length;

  if (wordCount >= 10) points += 10;
  if (wordCount >= 25) points += 20;
  if (wordCount >= 50) points += 30;

  const keywords = [
    'delicious', 'amazing', 'terrible', 'fresh', 'cold',
    'hot', 'spicy', 'bland', 'fast', 'slow', 'friendly',
    'rude', 'clean', 'dirty', 'recommend', 'avoid'
  ];

  const lowerText = reviewText.toLowerCase();
  keywords.forEach(keyword => {
    if (lowerText.includes(keyword)) points += 5;
  });

  if (hasMedia) points += 20;

  return points;
};

module.exports = { calculateReviewPoints };