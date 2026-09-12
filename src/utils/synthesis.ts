import { ExpMaterial } from '../data/materials';
import * as materialSets from '../data/materialSets';

export interface TierGroup {
  id: string;
  tiers: string[];
}

function getAllTierGroups(): TierGroup[] {
  const groups: TierGroup[] = [];

  for (const key of Object.keys(materialSets)) {
    const set = (materialSets as any)[key];
    if (Array.isArray(set) && set.length === 4) {
      groups.push({ id: key, tiers: set as string[] });
    }
  }

  groups.push({
    id: 'EXP_RESONANCE',
    tiers: [
      ExpMaterial.BASIC_RESONANCE_POTION,
      ExpMaterial.MEDIUM_RESONANCE_POTION,
      ExpMaterial.ADVANCED_RESONANCE_POTION,
      ExpMaterial.PREMIUM_RESONANCE_POTION,
    ],
  });
  groups.push({
    id: 'EXP_ENERGY',
    tiers: [
      ExpMaterial.BASIC_ENERGY_CORE,
      ExpMaterial.MEDIUM_ENERGY_CORE,
      ExpMaterial.ADVANCED_ENERGY_CORE,
      ExpMaterial.PREMIUM_ENERGY_CORE,
    ],
  });

  return groups;
}

const allTierGroups = getAllTierGroups();

export function findTierGroup(materialName: string): TierGroup | null {
  for (const group of allTierGroups) {
    if (group.tiers.includes(materialName)) {
      return group;
    }
  }
  return null;
}

export interface SynthesisResult {
  adjustedNeeded: { [materialName: string]: number };
  savings: { materialName: string; reducedCount: number }[];
}

function convertTiers(effective: number[], need: number[]): void {
  const n = effective.length;

  for (let i = 0; i < n - 1; i++) {
    if (effective[i] > need[i]) {
      const surplus = effective[i] - need[i];
      const converted = Math.floor(surplus / 3);
      effective[i + 1] += converted;
      effective[i] -= converted * 3;
    }
  }

  for (let i = n - 1; i > 0; i--) {
    if (effective[i] > need[i]) {
      const surplus = effective[i] - need[i];
      effective[i - 1] += surplus * 3;
      effective[i] -= surplus;
    }
  }
}

// Compute how much of each material you can REMOVE and still have enough to
// cover every need in the chain, accounting for upward synthesis (3 lower ->
// 1 higher) but never downward. For each tier we compute "required to retain":
// its own need plus what must be synthesized up to cover higher deficits. The
// removable amount is what's owned beyond that retention.
export function calculateSynthesisExcess(
  required: { [materialName: string]: number },
  owned: { [materialName: string]: number }
): { materialName: string; excessCount: number }[] {
  const excess: { materialName: string; excessCount: number }[] = [];

  for (const group of allTierGroups) {
    const hasAnything = group.tiers.some(t => (owned[t] || 0) > 0);
    if (!hasAnything) continue;

    const n = group.tiers.length;
    const need = group.tiers.map(t => required[t] || 0);
    const own = group.tiers.map(t => owned[t] || 0);

    // req[i] = total tier-i materials that must be kept:
    //   its own need, plus 3x anything the tier above still has to source from it.
    const req = new Array<number>(n).fill(0);
    req[n - 1] = need[n - 1];
    for (let i = n - 2; i >= 0; i--) {
      req[i] = need[i] + 3 * Math.max(0, req[i + 1] - own[i + 1]);
    }

    for (let i = 0; i < n; i++) {
      const removable = Math.max(0, own[i] - req[i]);
      if (removable > 0) {
        excess.push({ materialName: group.tiers[i], excessCount: removable });
      }
    }
  }

  return excess;
}

export function calculateSynthesis(
  required: { [materialName: string]: number },
  owned: { [materialName: string]: number }
): SynthesisResult {
  const adjustedNeeded: { [materialName: string]: number } = {};
  const savings: { materialName: string; reducedCount: number }[] = [];

  for (const group of allTierGroups) {
    const hasRequirement = group.tiers.some(t => (required[t] || 0) > 0);
    if (!hasRequirement) continue;

    const n = group.tiers.length;
    const effective = group.tiers.map(t => owned[t] || 0);
    const need = group.tiers.map(t => required[t] || 0);

    convertTiers(effective, need);

    for (let i = 0; i < n; i++) {
      const deficit = Math.max(0, need[i] - effective[i]);
      adjustedNeeded[group.tiers[i]] = deficit;
      const rawDeficit = Math.max(0, need[i] - (owned[group.tiers[i]] || 0));
      const saved = rawDeficit - deficit;
      if (saved > 0) {
        savings.push({ materialName: group.tiers[i], reducedCount: saved });
      }
    }
  }

  return { adjustedNeeded, savings };
}
