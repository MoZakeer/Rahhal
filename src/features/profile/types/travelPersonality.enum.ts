export const TravelPersonality = {
    Explorer: 0,
    Relaxer: 1,
    SocialTraveler: 2,
    Backpacker: 3,
    LuxuryTraveler: 4,
} as const;

export type TravelPersonality = typeof TravelPersonality[keyof typeof TravelPersonality];
export const TravelPersonalityLabel = Object.fromEntries(
  Object.entries(TravelPersonality).map(([key, value]) => [value, key])
) as Record<TravelPersonality, keyof typeof TravelPersonality>;