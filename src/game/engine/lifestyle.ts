import type { Appearance, GameState, ShowOffer } from '../models/types';
import { rng } from './rng';
import { FIRST_NAMES, LAST_NAMES } from '../data/names';
import {
  DATE_COST,
  SHOP_ITEMS,
  UNRELEASED_SONG_CAP,
  defaultAppearance,
  defaultLifestyle,
  getOwnedItems,
  getRecordEnergyCost,
  getStudioQualityBonus,
  jewelryFromOwned,
  outfitFromOwned,
} from '../data/lifestyle';
import { improveAttribute } from './player';
import { BALANCE } from '../balance/constants';

export interface ShowResult {
  venueName: string;
  venueType: ShowOffer['venueType'];
  city: string;
  pay: number;
  crowdSize: number;
  energyCost: number;
  followersGained: number;
  hypeGained: number;
  recap: string;
  quality: 'rough' | 'solid' | 'unforgettable';
}

export interface DateResult {
  partnerName: string;
  status: 'talking' | 'dating' | 'serious';
  scene: string;
  outcome: string;
  moodChange: number;
}

export function ensurePlayerLifestyle(state: GameState): GameState {
  if (!state.player.appearance) {
    state.player.appearance = defaultAppearance();
  }
  if (!state.player.lifestyle) {
    state.player.lifestyle = defaultLifestyle();
  }
  if (typeof state.player.lifestyle.showsPerformed !== 'number') {
    state.player.lifestyle.showsPerformed = 0;
  }
  if (typeof state.player.lifestyle.mood !== 'number') {
    state.player.lifestyle.mood = 55;
  }
  if (!Array.isArray(state.player.lifestyle.ownedItemIds)) {
    state.player.lifestyle.ownedItemIds = [];
  }
  return state;
}

export function canWriteMoreSongs(state: GameState): { can: boolean; reason?: string } {
  const unreleased = state.songs.filter((s) => s.status !== 'released').length;
  if (unreleased >= UNRELEASED_SONG_CAP) {
    return {
      can: false,
      reason: `You already have ${UNRELEASED_SONG_CAP} unfinished songs. Release or scrap one first.`,
    };
  }
  return { can: true };
}

export function scrapSong(
  state: GameState,
  songId: string
): { newState: GameState; success: boolean; message: string } {
  const newState: GameState = JSON.parse(JSON.stringify(state));
  const song = newState.songs.find((s) => s.id === songId);

  if (!song) {
    return { newState, success: false, message: 'Song not found' };
  }
  if (song.status === 'released') {
    return { newState, success: false, message: 'You cannot scrap a released song' };
  }

  newState.songs = newState.songs.filter((s) => s.id !== songId);
  return { newState, success: true, message: `Scrapped "${song.title}"` };
}

export function buyLifestyleItem(
  state: GameState,
  itemId: string
): { newState: GameState; success: boolean; message: string } {
  const newState: GameState = JSON.parse(JSON.stringify(state));
  ensurePlayerLifestyle(newState);

  const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
  if (!item) {
    return { newState, success: false, message: 'Item not found' };
  }
  if (newState.player.lifestyle.ownedItemIds.includes(itemId)) {
    return { newState, success: false, message: 'You already own that' };
  }
  if (item.unlockFollowers && newState.player.stats.followers < item.unlockFollowers) {
    return { newState, success: false, message: `Need ${item.unlockFollowers.toLocaleString()} followers` };
  }
  if (newState.player.stats.cash < item.price) {
    return { newState, success: false, message: 'Not enough cash' };
  }

  newState.player.stats.cash -= item.price;
  newState.player.lifestyle.ownedItemIds.push(itemId);

  if (item.studioTier > newState.player.lifestyle.studioTier) {
    newState.player.lifestyle.studioTier = item.studioTier;
  }

  if (item.appearance) {
    newState.player.appearance = {
      ...newState.player.appearance,
      ...item.appearance,
    };
  } else {
    newState.player.appearance.jewelry = jewelryFromOwned(newState.player.lifestyle.ownedItemIds);
    newState.player.appearance.outfit = outfitFromOwned(
      newState.player.lifestyle.ownedItemIds,
      newState.player.appearance.outfit
    );
  }

  if (item.weeklyHype > 0) {
    newState.player.stats.hype = Math.min(100, newState.player.stats.hype + item.weeklyHype);
  }

  newState.careerTimeline.push({
    week: newState.currentWeek,
    age: newState.player.age,
    event: `Bought ${item.name}`,
    type: 'event',
  });

  return { newState, success: true, message: `Bought ${item.name}` };
}

export function updateAppearance(
  state: GameState,
  appearance: Appearance
): GameState {
  const newState: GameState = JSON.parse(JSON.stringify(state));
  ensurePlayerLifestyle(newState);
  newState.player.appearance = {
    ...appearance,
    jewelry: jewelryFromOwned(newState.player.lifestyle.ownedItemIds) === 'none'
      ? appearance.jewelry
      : jewelryFromOwned(newState.player.lifestyle.ownedItemIds),
    outfit: outfitFromOwned(newState.player.lifestyle.ownedItemIds, appearance.outfit),
  };
  return newState;
}

export function performShow(
  state: GameState,
  offerId?: string
): { newState: GameState; success: boolean; message: string; result?: ShowResult } {
  const r = rng();
  const newState: GameState = JSON.parse(JSON.stringify(state));
  ensurePlayerLifestyle(newState);

  const offer = offerId
    ? newState.showOffers.find((o) => o.id === offerId)
    : newState.showOffers[0];

  if (!offer) {
    return { newState, success: false, message: 'No show booked this week' };
  }

  if (newState.player.stats.energy < offer.energyCost) {
    return { newState, success: false, message: 'Not enough energy to perform' };
  }

  newState.player.stats.energy -= offer.energyCost;
  newState.player.stats.cash += offer.pay;
  newState.player.stats.careerEarnings += offer.pay;
  newState.player.lifestyle.showsPerformed += 1;

  const jewelryBonus = getOwnedItems(newState.player.lifestyle.ownedItemIds)
    .reduce((sum, item) => sum + item.weeklyHype, 0);
  const performance = newState.player.attributes.performance;
  const roll = r.int(0, 100) + performance * 0.4 + jewelryBonus * 2;

  const quality: ShowResult['quality'] =
    roll >= 85 ? 'unforgettable' : roll >= 50 ? 'solid' : 'rough';

  const followerMult = quality === 'unforgettable' ? 2.2 : quality === 'solid' ? 1.2 : 0.6;
  const hypeGain = Math.round(
    (quality === 'unforgettable' ? 10 : quality === 'solid' ? 5 : 2) + jewelryBonus
  );
  const followersGained = Math.max(
    8,
    Math.floor((20 + offer.pay / 10 + newState.player.stats.followers * 0.01) * followerMult)
  );

  newState.player.stats.followers += followersGained;
  newState.player.stats.hype = Math.min(100, newState.player.stats.hype + hypeGain);
  newState.player.attributes.performance = improveAttribute(newState.player.attributes.performance, 0.8);
  newState.player.fanBase.core += quality === 'unforgettable' ? r.int(4, 18) : r.int(0, 6);
  newState.player.lifestyle.mood = Math.max(10, Math.min(100, newState.player.lifestyle.mood + (quality === 'rough' ? -4 : 8)));

  const recap =
    quality === 'unforgettable'
      ? `The room locked in. Phones up, people screaming the hook back.`
      : quality === 'solid'
        ? `A real night. Not perfect, but the room left knowing your name.`
        : `Rough set. A couple people stayed. You still got the reps.`;

  newState.careerTimeline.push({
    week: newState.currentWeek,
    age: newState.player.age,
    event: `Performed at ${offer.venueName} in ${offer.city}`,
    type: 'event',
  });

  newState.showOffers = newState.showOffers.filter((o) => o.id !== offer.id);

  const result: ShowResult = {
    venueName: offer.venueName,
    venueType: offer.venueType,
    city: offer.city,
    pay: offer.pay,
    crowdSize: Math.max(12, Math.floor(BALANCE.shows[offer.venueType].capacity * r.float(0.15, 0.7))),
    energyCost: offer.energyCost,
    followersGained,
    hypeGained: hypeGain,
    recap,
    quality,
  };

  return { newState, success: true, message: recap, result };
}

export function goOnDate(
  state: GameState
): { newState: GameState; success: boolean; message: string; result?: DateResult } {
  const r = rng();
  const newState: GameState = JSON.parse(JSON.stringify(state));
  ensurePlayerLifestyle(newState);

  if (newState.player.stats.cash < DATE_COST.money) {
    return { newState, success: false, message: `Need $${DATE_COST.money} to go out` };
  }
  if (newState.player.stats.energy < DATE_COST.energy) {
    return { newState, success: false, message: 'Not enough energy' };
  }

  newState.player.stats.cash -= DATE_COST.money;
  newState.player.stats.energy -= DATE_COST.energy;

  if (!newState.player.lifestyle.dating) {
    newState.player.lifestyle.dating = {
      partnerName: `${r.pick(FIRST_NAMES)} ${r.pick(LAST_NAMES)}`,
      chemistry: r.int(35, 70),
      weeksTogether: 0,
      status: 'talking',
    };
  }

  const dating = newState.player.lifestyle.dating;
  const spark = r.int(-8, 16);
  dating.chemistry = Math.max(5, Math.min(100, dating.chemistry + spark));
  dating.weeksTogether += 1;

  if (dating.chemistry >= 75 && dating.weeksTogether >= 4) {
    dating.status = 'serious';
  } else if (dating.chemistry >= 50 && dating.weeksTogether >= 2) {
    dating.status = 'dating';
  }

  const moodChange = spark >= 0 ? r.int(4, 12) : r.int(-8, 2);
  newState.player.lifestyle.mood = Math.max(5, Math.min(100, newState.player.lifestyle.mood + moodChange));

  if (spark >= 6) {
    newState.player.attributes.writing = improveAttribute(newState.player.attributes.writing, 0.35);
    newState.player.attributes.charisma = improveAttribute(newState.player.attributes.charisma, 0.25);
  }

  const scenes = [
    `Late dinner, phones face-down. ${dating.partnerName} actually listened to the unreleased verse.`,
    `A quiet rooftop. ${dating.partnerName} called you by your real name and it did not feel weird.`,
    `You two ended up at a dingy karaoke spot. The room was empty. That helped.`,
    `Walked the long way home. ${dating.partnerName} talked about leaving their city. You talked about staying.`,
  ];

  const outcome =
    spark >= 8
      ? 'The night gave you something to write about.'
      : spark >= 0
        ? 'Easy night. You needed that more than you thought.'
        : 'A little off. Not a fight, just not the spark.';

  const result: DateResult = {
    partnerName: dating.partnerName,
    status: dating.status,
    scene: r.pick(scenes),
    outcome,
    moodChange,
  };

  return { newState, success: true, message: outcome, result };
}

export function endRelationship(state: GameState): { newState: GameState; success: boolean; message: string } {
  const newState: GameState = JSON.parse(JSON.stringify(state));
  ensurePlayerLifestyle(newState);
  if (!newState.player.lifestyle.dating) {
    return { newState, success: false, message: 'You are not seeing anyone' };
  }
  const name = newState.player.lifestyle.dating.partnerName;
  newState.player.lifestyle.dating = null;
  newState.player.lifestyle.mood = Math.max(5, newState.player.lifestyle.mood - 8);
  return { newState, success: true, message: `You and ${name} cooled off` };
}

export function applyWeeklyLifestyle(state: GameState): { hype: number; followers: number; notes: string[] } {
  ensurePlayerLifestyle(state);
  const items = getOwnedItems(state.player.lifestyle.ownedItemIds);
  let hype = 0;
  let followers = 0;
  const notes: string[] = [];

  for (const item of items) {
    hype += item.weeklyHype;
    followers += item.weeklyFollowers;
  }

  if (state.player.lifestyle.dating) {
    state.player.lifestyle.dating.weeksTogether += 1;
    if (state.player.lifestyle.dating.status === 'serious') {
      state.player.lifestyle.mood = Math.min(100, state.player.lifestyle.mood + 1);
    }
  }

  state.player.lifestyle.mood = Math.max(20, state.player.lifestyle.mood - 1);
  state.player.stats.hype = Math.min(100, state.player.stats.hype + hype);
  state.player.stats.followers += followers;

  if (hype > 0) {
    notes.push(`Your look kept you in conversations (+${hype} hype).`);
  }

  return { hype, followers, notes };
}

export function recordEnergyFor(state: GameState): number {
  ensurePlayerLifestyle(state);
  return getRecordEnergyCost(state.player.lifestyle.ownedItemIds, state.player.lifestyle.studioTier);
}

export function studioBonusFor(state: GameState): number {
  ensurePlayerLifestyle(state);
  return getStudioQualityBonus(state.player.lifestyle.ownedItemIds, state.player.lifestyle.studioTier);
}
