export const TravelPersonality = {
    Adventurer: 0,
    Relaxer: 1,
    Explorer: 2,
    LuxuryTraveler: 3
} as const;

export type TravelPersonality = typeof TravelPersonality[keyof typeof TravelPersonality];