/**
 * Shared hunt list for dashboard (creator hunts) and Game Arcade (active hunts).
 * Persisted in SecureStore for mobile.
 */

import type { HuntStatus, StoredHunt, Clue } from "@lib/types";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "hunty_hunts";
const CLUES_KEY = "hunty_clues";

// Seed timestamps: active hunts end 7 days from first load, completed hunts in the past.
const NOW_SECONDS = Math.floor(Date.now() / 1000);

const SEED_HUNTS: StoredHunt[] = [
  {
    id: 1,
    title: "City Secrets",
    description: "Race across town to uncover hidden murals and landmarks.",
    cluesCount: 5,
    status: "Active",
    rewardType: "XLM",
    startTime: NOW_SECONDS - 86400,
    endTime: NOW_SECONDS + 7 * 86400,
    coverImageCid: "bafybeigdyrzt5sfp7udm7hmhd3km4gq6v2y24sqqew2qnp4o3k4xcoq2a",
  },
  {
    id: 2,
    title: "Campus Quest",
    description: "Solve riddles scattered around campus before the timer ends.",
    cluesCount: 7,
    status: "Active",
    rewardType: "NFT",
    startTime: NOW_SECONDS - 2 * 86400,
    endTime: NOW_SECONDS + 3 * 86400,
    coverImageCid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  },
  {
    id: 3,
    title: "Office Onboarding Hunt",
    description: "A playful intro game for new teammates around the office.",
    cluesCount: 4,
    status: "Completed",
    rewardType: "Both",
    startTime: NOW_SECONDS - 10 * 86400,
    endTime: NOW_SECONDS - 5 * 86400,
  },
  {
    id: 4,
    title: "Summer Treasure Hunt",
    description: "Find hidden clues in the park.",
    cluesCount: 3,
    status: "Draft",
    rewardType: "XLM",
  },
  {
    id: 5,
    title: "Museum Mystery",
    description: "Discover art and history through clues.",
    cluesCount: 0,
    status: "Draft",
    rewardType: "NFT",
  },
];

const SEED_CLUES: Clue[] = [
  {
    id: 1,
    huntId: 1,
    question: 'What landmark has a spiral mural at the east gate?',
    answer: 'Spiral mural',
    points: 10,
    hint: 'Look for painted stairs.',
  },
  {
    id: 2,
    huntId: 1,
    question: 'Which statue holds a lantern in the north plaza?',
    answer: 'Lantern statue',
    points: 10,
    hint: 'It shines in the night.',
  },
  {
    id: 3,
    huntId: 1,
    question: 'Name the coffee shop that shares a wall with the old clock tower.',
    answer: 'Clocktower Cafe',
    points: 10,
  },
  {
    id: 4,
    huntId: 1,
    question: 'What color is the hidden door behind the bicycle racks?',
    answer: 'Blue',
    points: 10,
  },
  {
    id: 5,
    huntId: 1,
    question: 'Which alley features the painted fox mural?',
    answer: 'Fox Alley',
    points: 10,
  },
  {
    id: 6,
    huntId: 2,
    question: 'What building has the golden dome at the center of campus?',
    answer: 'Golden Dome',
    points: 8,
  },
  {
    id: 7,
    huntId: 2,
    question: 'Which library wing is open 24/7?',
    answer: 'North Wing',
    points: 8,
  },
  {
    id: 8,
    huntId: 2,
    question: 'What landmark is beside the rose garden?',
    answer: 'Sculpture fountain',
    points: 8,
  },
  {
    id: 9,
    huntId: 2,
    question: 'What is the name of the student center cafe?',
    answer: 'Campus Brew',
    points: 8,
  },
  {
    id: 10,
    huntId: 2,
    question: 'Which gate faces the river trail?',
    answer: 'River Gate',
    points: 8,
  },
  {
    id: 11,
    huntId: 2,
    question: 'Which building holds the mural of a compass?',
    answer: 'Compass Hall',
    points: 8,
  },
  {
    id: 12,
    huntId: 2,
    question: 'Name the famous bench under the oak tree.',
    answer: 'Oak Bench',
    points: 8,
  },
];

async function readClues(): Promise<Clue[]> {
  try {
    const raw = await SecureStore.getItemAsync(CLUES_KEY);
    if (!raw) return [...SEED_CLUES];
    const parsed = JSON.parse(raw) as Clue[];
    return Array.isArray(parsed) ? parsed : [...SEED_CLUES];
  } catch {
    return [...SEED_CLUES];
  }
}

async function writeClues(clues: Clue[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(CLUES_KEY, JSON.stringify(clues));
  } catch {
    // ignore
  }
}

async function readHunts(): Promise<StoredHunt[]> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return [...SEED_HUNTS];
    const parsed = JSON.parse(raw) as StoredHunt[];
    return Array.isArray(parsed) ? parsed : [...SEED_HUNTS];
  } catch {
    return [...SEED_HUNTS];
  }
}

async function writeHunts(hunts: StoredHunt[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(hunts));
  } catch {
    // ignore
  }
}

/** Active hunts for feed (local fallback). */
export async function getActiveHuntsForFeed(): Promise<StoredHunt[]> {
  const hunts = await readHunts();
  return hunts.filter((h) => h.status === "Active" && !h.is_private);
}

/** Get a single hunt by ID */
export async function getHuntById(id: number): Promise<StoredHunt | undefined> {
  const hunts = await readHunts();
  return hunts.find((h) => h.id === id);
/** Active hunts for feed with cover images. */
export async function getActiveHuntsForFeed(): Promise<StoredHunt[]> {
  const hunts = await readHunts();
  return hunts.filter((h) => h.status === "Active" && !h.is_private);
/** Cache clues for a joined hunt offline in AsyncStorage */
export async function cacheJoinedHuntClues(huntId: number, clues: Clue[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`hunty_clues_hunt_${huntId}`, JSON.stringify(clues));
  } catch (error) {
    console.error(`Failed to cache clues for hunt ${huntId} offline:`, error);
  }
}

/** Get offline cached clues for a hunt from AsyncStorage */
export async function getOfflineCachedClues(huntId: number): Promise<Clue[]> {
  try {
    const raw = await AsyncStorage.getItem(`hunty_clues_hunt_${huntId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Clue[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** All hunts (for Game Arcade: filter by status === "Active"). Private hunts are excluded. */
export async function getAllHunts(): Promise<StoredHunt[]> {
  return (await readHunts()).filter((h) => !h.is_private);
  const hunts = await readHunts();
  return hunts.filter((h) => !h.is_private);
}

/** All hunts including private ones (for creator dashboard). */
export async function getAllHuntsIncludingPrivate(): Promise<StoredHunt[]> {
  return await readHunts();
}

/** Creator hunts for dashboard (all stored hunts including private; creator filter can be added later). */
export async function getCreatorHunts(): Promise<StoredHunt[]> {
  return await readHunts();
}

/** Get hunts for a creator (creator public-key filter not implemented yet; returns all hunts). */
export async function getHuntsByCreator(): Promise<StoredHunt[]> {
  return await readHunts();
}

/** Update a hunt's status (e.g. Draft → Active after activate_hunt). */
export async function updateHuntStatus(huntId: number, status: HuntStatus): Promise<void> {
  const hunts = (await readHunts()).map((h) => (h.id === huntId ? { ...h, status } : h));
  await writeHunts(hunts);
  const hunts = await readHunts();
  const updated = hunts.map((h) => (h.id === huntId ? { ...h, status } : h));
  await writeHunts(updated);
}

/** Delete multiple hunts by IDs. */
export async function deleteHunts(ids: number[]): Promise<void> {
  const hunts = (await readHunts()).filter((h) => !ids.includes(h.id));
  await writeHunts(hunts);
  const hunts = await readHunts();
  const remainingHunts = hunts.filter((h) => !ids.includes(h.id));
  await writeHunts(remainingHunts);
  
  // Also clean up clues for these hunts
  const allClues = await readClues();
  const remainingClues = allClues.filter((c) => !ids.includes(c.huntId));
  await writeClues(remainingClues);

  // Clean up offline cached clues from AsyncStorage
  for (const id of ids) {
    try {
      await AsyncStorage.removeItem(`hunty_clues_hunt_${id}`);
    } catch {
      // ignore
    }
  }
}

/** Archive (Cancel) multiple hunts by IDs. */
export async function archiveHunts(ids: number[]): Promise<void> {
  const hunts = (await readHunts()).map((h) =>
    ids.includes(h.id) ? { ...h, status: 'Cancelled' as HuntStatus } : h
  );
  await writeHunts(hunts);
  const hunts = await readHunts();
  const updated = hunts.map((h) => 
    ids.includes(h.id) ? { ...h, status: "Cancelled" as HuntStatus } : h
  );
  await writeHunts(updated);
}

/** Get a single hunt by ID */
export async function getHuntById(id: number): Promise<StoredHunt | undefined> {
  return (await readHunts()).find((h) => h.id === id);
  const hunts = await readHunts();
  return hunts.find((h) => h.id === id);
}

/** Add a new hunt (e.g. after createHunt). */
export async function addHunt(hunt: StoredHunt): Promise<void> {
  const hunts = await readHunts();
  if (hunts.some((h) => h.id === hunt.id)) return;
  await writeHunts([...hunts, hunt]);
}

/** Get all clues for a specific hunt. */
export async function getHuntClues(huntId: number): Promise<Clue[]> {
  return (await readClues()).filter((c) => c.huntId === huntId);
}

/** Persist a new clue locally and increment the hunt's cluesCount. */
export async function saveClueLocally(clue: Omit<Clue, 'id'>): Promise<void> {
  const all = await readClues();
  const newId = all.length > 0 ? Math.max(...all.map((c) => c.id)) + 1 : 1;
  await writeClues([...all, { ...clue, id: newId }]);
  const hunts = (await readHunts()).map((h) =>
    h.id === clue.huntId ? { ...h, cluesCount: h.cluesCount + 1 } : h
  );
  await writeHunts(hunts);
}

/** Get a single hunt by string ID */
export const getHunt = async (id: string): Promise<StoredHunt | undefined> => {
  return (await readHunts()).find((c) => c.id === Number(id));
};
/** Get all clues for a specific hunt with an offline cache fallback */
export async function getHuntClues(huntId: number): Promise<Clue[]> {
  // First attempt: read from the primary clues store
  const allClues = await readClues();
  const filtered = allClues.filter((c) => c.huntId === huntId);
  
  if (filtered.length > 0) {
    // Optimistically update the offline cache in case it changed
    await cacheJoinedHuntClues(huntId, filtered);
    return filtered;
  }
  
  // Fallback: if no clues in primary store (e.g., offline or cleared), read from the offline cache
  return await getOfflineCachedClues(huntId);
}

/** Persist a new clue locally, increment the hunt's cluesCount, and update the offline cache. */
export async function saveClueLocally(clue: Omit<Clue, "id">): Promise<void> {
  const all = await readClues();
  const newId = all.length > 0 ? Math.max(...all.map((c) => c.id)) + 1 : 1;
  const newClue: Clue = { ...clue, id: newId };
  const updatedClues = [...all, newClue];
  await writeClues(updatedClues);
  
  const hunts = await readHunts();
  const updatedHunts = hunts.map((h) =>
    h.id === clue.huntId ? { ...h, cluesCount: h.cluesCount + 1 } : h
  );
  await writeHunts(updatedHunts);

  // Update the offline cache for this hunt
  const huntClues = updatedClues.filter((c) => c.huntId === clue.huntId);
  await cacheJoinedHuntClues(clue.huntId, huntClues);
}

/** Get a single hunt by string ID */
export async function getHunt(id: string): Promise<StoredHunt | undefined> {
  const hunts = await readHunts();
  return hunts.find((c) => c.id === Number(id));
}

/**
 * Return up to `limit` featured hunts, ranked by a trending score.
 * Score factors: clue count, reward type variety, time remaining, recency.
 */
export async function getFeaturedHunts(limit = 3): Promise<StoredHunt[]> {
  const now = Math.floor(Date.now() / 1000);
  const active = (await readHunts()).filter((h) => h.status === 'Active' && !h.is_private);
  const hunts = await readHunts();
  const active = hunts.filter((h) => h.status === "Active" && !h.is_private);

  const scored = active.map((hunt) => {
    let score = 0;
    score += hunt.cluesCount * 10;
    if (hunt.rewardType === 'Both') score += 20;
    else if (hunt.rewardType === 'NFT') score += 10;
    if (hunt.endTime) {
      const hoursLeft = (hunt.endTime - now) / 3600;
      if (hoursLeft > 0 && hoursLeft < 48) score += 15;
    }
    if (hunt.startTime) {
      const daysSinceStart = (now - hunt.startTime) / 86400;
      if (daysSinceStart < 3) score += 10;
    }
    return { hunt, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.hunt);
}
