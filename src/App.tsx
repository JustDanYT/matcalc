import React, { useState, useEffect } from 'react';
import { characters } from './data/characters';
import { weapons } from './data/weapons';
import { calculateMaterials, calculateCharacterTotalMaterials } from './utils/calculator';
import { Icon } from './components/Icon';
import { DataImport } from './components/DataImport';
import { CalculatedMaterial, CharacterSelectionConfig, WeaponSelectionConfig, Material } from './types';
import { getMaterialByName, allMaterials as allMaterialsData, BossMaterial, EnemyMaterial, SpecialtyMaterial, ForgeryMaterial, ExpMaterial, Currency, WeeklyBossMaterial } from './data/materials';
import { CollapsiblePanel } from './components/CollapsiblePanel';
import { MultiDropdown } from './components/MultiDropdown';
import { MaterialInputField } from './components/MaterialInputField';
import { CharacterConfigPanel } from './components/CharacterConfigPanel';
import { WeaponConfigPanel } from './components/WeaponConfigPanel';
import { getWaveplateCost, CLAIM_COST } from './data/waveplateCosts';
import { calculateSynthesis, calculateSynthesisExcess, findTierGroup, SynthesisResult } from './utils/synthesis';

const getMaterialSource = (material: Material): string => {
  if (Object.values(BossMaterial).includes(material.name as any)) return 'BossMaterial';
  if (Object.values(EnemyMaterial).includes(material.name as any)) return 'EnemyMaterial';
  if (Object.values(SpecialtyMaterial).includes(material.name as any)) return 'SpecialtyMaterial';
  if (Object.values(ForgeryMaterial).includes(material.name as any)) return 'ForgeryMaterial';
  if (Object.values(WeeklyBossMaterial).includes(material.name as any)) return 'WeeklyBossMaterial';
  if (Object.values(ExpMaterial).includes(material.name as any)) return 'ExpMaterial';
  if (Object.values(Currency).includes(material.name as any)) return 'Currency';
  return 'Other';
};

const materialDataIndex = new Map<string, number>();
allMaterialsData.forEach((mat, index) => materialDataIndex.set(mat.name, index));

const materialSourceDisplayNames: { [key: string]: string } = {
  BossMaterial: 'Boss Ascension Materials',
  ExpMaterial: 'EXP Materials',
  SpecialtyMaterial: 'World Specialties',
  ForgeryMaterial: 'Forgery Materials',
  EnemyMaterial: 'Enemy Materials',
  WeeklyBossMaterial: 'Weekly Skill Materials',
  Currency: 'Currencies',
  Other: 'Other Materials',
};

const formatNumber = (num: number): string => {
  const roundedNum = Math.round(num);
  if (roundedNum >= 1000000) {
    return (roundedNum / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  } else if (roundedNum >= 1000) {
    return (roundedNum / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return roundedNum.toString();
};

const formatWaveplateNumber = (num: number): string => {
  return Math.round(num).toString();
};

  const WAVEPLATE_ICON_PATH = getMaterialByName(Currency.WAVEPLATES)?.icon || '?';
  const CRYSTAL_SOLVENT_WAVEPLATES = 60;
const GITHUB_ICON_PATH = '/assets/icons/other/github-mark-white.svg';

const createDefaultCharSelection = (id: string): CharacterSelectionConfig => ({
  id,
  currentLevel: 90,
  targetLevel: 90,
  skills: Array(5).fill(1),
  targetSkills: Array(5).fill(10),
  statNodeBooleans: Array(4).fill([true, true]) as boolean[][],
  inherentSkillBooleans: [true, true],
});

const createDefaultWeaponSelection = (id: string): WeaponSelectionConfig => ({
  id,
  currentLevel: 90,
  targetLevel: 90,
});

// Restore a cached character config, filling any missing/newer fields with defaults
const mergeCharSelection = (id: string, cached?: CharacterSelectionConfig): CharacterSelectionConfig => ({
  ...createDefaultCharSelection(id),
  ...(cached || {}),
  id,
});

const App: React.FC = () => {
  const LOCAL_STORAGE_KEY = 'wuwaMaterialPlannerStateV2';

  const loadState = () => {
    try {
      const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (serializedState === null) {
        const oldState = localStorage.getItem('wuwaMaterialPlannerState');
        if (oldState) {
          const saved = JSON.parse(oldState);
          if (saved.selectedCharacterId && !saved.characterSelections) {
            saved.characterSelections = [{
              id: saved.selectedCharacterId,
              currentLevel: saved.charCurrentLevel ?? 90,
              targetLevel: saved.charTargetLevel ?? 90,
              skills: saved.skills ?? Array(5).fill(1),
              targetSkills: saved.targetSkills ?? Array(5).fill(10),
              statNodeBooleans: saved.statNodeBooleans ?? Array(4).fill([true, true]),
              inherentSkillBooleans: saved.inherentSkillBooleans ?? [true, true],
            }];
          }
          if (saved.selectedWeaponId && !saved.weaponSelections) {
            saved.weaponSelections = [{
              id: saved.selectedWeaponId,
              currentLevel: saved.weaponCurrentLevel ?? 1,
              targetLevel: saved.weaponTargetLevel ?? 90,
            }];
          }
          return saved;
        }
        return undefined;
      }
      return JSON.parse(serializedState);
    } catch (err) {
      console.error("Could not load state from localStorage", err);
      return undefined;
    }
  };

  const savedState = loadState();

  const [characterSelections, setCharacterSelections] = useState<CharacterSelectionConfig[]>(
    savedState?.characterSelections || []
  );
  const [weaponSelections, setWeaponSelections] = useState<WeaponSelectionConfig[]>(
    savedState?.weaponSelections || []
  );
  const [materialInventory, setMaterialInventory] = useState<{ [materialName: string]: number }>(
    savedState?.materialInventory || {}
  );
  const [characterConfigCache, setCharacterConfigCache] = useState<{ [id: string]: CharacterSelectionConfig }>(
    savedState?.characterConfigCache || {}
  );

  const [supplyPacks, setSupplyPacks] = useState<{ pack1: number; pack2: number; pack3: number; pack4: number; pack5: number }>(
    { pack1: 0, pack2: 0, pack3: 0, pack4: 0, pack5: 0, ...(savedState?.supplyPacks || {}) }
  );
  const [crystalSolvents, setCrystalSolvents] = useState<number>(savedState?.crystalSolvents || 0);
  const [shellCredits, setShellCredits] = useState<number>(savedState?.shellCredits || 0);
  const [inventoryEnabled, setInventoryEnabled] = useState(savedState?.inventoryEnabled ?? true);
  const [synthesisEnabled, setSynthesisEnabled] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<SynthesisResult | null>(null);
  const [allMaterials, setAllMaterials] = useState<CalculatedMaterial[]>([]);
  const [totalWaveplate, setTotalWaveplate] = useState<number>(0);

  const getInventory = (name: string) => {
    if (!inventoryEnabled) return 0;
    const base = materialInventory[name] || 0;
    return name === Currency.SHELL_CREDITS ? base + shellCredits : base;
  };

  useEffect(() => {
    try {
      const stateToSave = { characterSelections, weaponSelections, materialInventory, characterConfigCache, supplyPacks, crystalSolvents, shellCredits, inventoryEnabled };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error("Could not save state to localStorage", err);
    }
  }, [characterSelections, weaponSelections, materialInventory, characterConfigCache, supplyPacks, crystalSolvents, shellCredits]);

  const hasSelections = characterSelections.length > 0 || weaponSelections.length > 0;

  const selectedCharIds = characterSelections.map(s => s.id);
  const selectedWeaponIds = weaponSelections.map(s => s.id);

  const handleToggleCharacter = (id: string) => {
    const existing = characterSelections.find(s => s.id === id);
    if (existing) {
      setCharacterConfigCache(prev => ({ ...prev, [id]: existing }));
      setCharacterSelections(prev => prev.filter(s => s.id !== id));
    } else {
      setCharacterSelections(prev => [...prev, mergeCharSelection(id, characterConfigCache[id])]);
    }
  };

  const handleToggleWeapon = (id: string) => {
    setWeaponSelections(prev => {
      if (prev.some(s => s.id === id)) {
        return prev.filter(s => s.id !== id);
      }
      return [...prev, createDefaultWeaponSelection(id)];
    });
  };

  const roverIds = ['rover_spectro', 'rover_havoc', 'rover_aero', 'rover_electro'];

  const handleUpdateCharacter = (id: string, config: Partial<CharacterSelectionConfig>) => {
    setCharacterSelections(prev => {
      if (roverIds.includes(id)) {
        return prev.map(s => roverIds.includes(s.id) ? { ...s, ...config } : s);
      }
      return prev.map(s => s.id === id ? { ...s, ...config } : s);
    });
  };

  const handleUpdateWeapon = (id: string, config: Partial<WeaponSelectionConfig>) => {
    setWeaponSelections(prev => prev.map(s => s.id === id ? { ...s, ...config } : s));
  };

  useEffect(() => {
    const tempAllMaterials: CalculatedMaterial[] = [];

    characterSelections.forEach(sel => {
      const char = characters.find(c => c.id === sel.id);
      if (!char) return;

      const required = calculateCharacterTotalMaterials(char, sel);
      Object.entries(required).forEach(([name, quantity]) => {
        tempAllMaterials.push({ material: getMaterialByName(name)!, quantity });
      });
    });

    weaponSelections.forEach(sel => {
      const weapon = weapons.find(w => w.id === sel.id);
      if (!weapon) return;
      tempAllMaterials.push(...calculateMaterials(weapon, sel.currentLevel, sel.targetLevel, 'ascension'));
      tempAllMaterials.push(...calculateMaterials(weapon, sel.currentLevel, sel.targetLevel, 'exp'));
    });

    const consolidatedMaterials: { [key: string]: CalculatedMaterial } = {};
    tempAllMaterials.forEach(mat => {
      if (consolidatedMaterials[mat.material.name]) {
        consolidatedMaterials[mat.material.name].quantity += mat.quantity;
      } else {
        consolidatedMaterials[mat.material.name] = { ...mat };
      }
    });

    setAllMaterials(Object.values(consolidatedMaterials));
  }, [characterSelections, weaponSelections]);

  useEffect(() => {
    if (!synthesisEnabled) {
      setSynthesisResult(null);
      return;
    }
    const required: { [name: string]: number } = {};
    allMaterials.forEach(m => { required[m.material.name] = m.quantity; });
    setSynthesisResult(calculateSynthesis(required, inventoryEnabled ? materialInventory : {}));
  }, [allMaterials, materialInventory, synthesisEnabled]);

  const weeklyBossDeficits = React.useMemo(() => {
    const deficits: { [name: string]: number } = {};
    const weeklyMats = Object.values(WeeklyBossMaterial) as string[];
    for (const mat of weeklyMats) {
      const required = allMaterials.find(m => m.material.name === mat)?.quantity || 0;
      if (required === 0) continue;
      const owned = getInventory(mat);
      deficits[mat] = Math.max(0, required - owned);
    }

    let { pack1, pack2, pack3, pack4, pack5 } = supplyPacks;
    const weWhoQuestion = WeeklyBossMaterial.WE_WHO_QUESTION;
    const goldInMemory = WeeklyBossMaterial.GOLD_IN_MEMORY;
    const skywardGlazedHeart = WeeklyBossMaterial.SKYWARD_GLAZED_HEART;

    if ((deficits[skywardGlazedHeart] || 0) > 0 && pack5 > 0) {
      const cover = Math.min(deficits[skywardGlazedHeart], pack5);
      deficits[skywardGlazedHeart] -= cover;
      pack5 -= cover;
    }

    if ((deficits[weWhoQuestion] || 0) > 0 && pack4 > 0) {
      const cover = Math.min(deficits[weWhoQuestion], pack4);
      deficits[weWhoQuestion] -= cover;
      pack4 -= cover;
    }
    if ((deficits[weWhoQuestion] || 0) > 0 && pack5 > 0) {
      const cover = Math.min(deficits[weWhoQuestion], pack5);
      deficits[weWhoQuestion] -= cover;
      pack5 -= cover;
    }

    if ((deficits[goldInMemory] || 0) > 0) {
      const coverP3 = Math.min(deficits[goldInMemory], pack3);
      deficits[goldInMemory] -= coverP3;
      pack3 -= coverP3;
      if ((deficits[goldInMemory] || 0) > 0) {
        const coverP4 = Math.min(deficits[goldInMemory], pack4);
        deficits[goldInMemory] -= coverP4;
        pack4 -= coverP4;
      }
      if ((deficits[goldInMemory] || 0) > 0) {
        const coverP5 = Math.min(deficits[goldInMemory], pack5);
        deficits[goldInMemory] -= coverP5;
        pack5 -= coverP5;
      }
    }

    const oldWeeklyMats = [
      WeeklyBossMaterial.MONUMENT_BELL,
      WeeklyBossMaterial.UNENDING_DESTRUCTION,
      WeeklyBossMaterial.DREAMLESS_FEATHER,
      WeeklyBossMaterial.SENTINELS_DAGGER,
      WeeklyBossMaterial.THE_NETHERWORLDS_STARE,
      WeeklyBossMaterial.WHEN_IRISES_BLOOM,
    ];

    for (const mat of oldWeeklyMats) {
      if ((deficits[mat] || 0) <= 0) continue;
      const coverP1 = Math.min(deficits[mat], pack1);
      deficits[mat] -= coverP1;
      pack1 -= coverP1;
    }

    for (const mat of weeklyMats) {
      if (mat === weWhoQuestion || mat === goldInMemory || mat === skywardGlazedHeart || oldWeeklyMats.includes(mat as any)) continue;
      if ((deficits[mat] || 0) <= 0) continue;

      const coverP1 = Math.min(deficits[mat], pack1);
      deficits[mat] -= coverP1;
      pack1 -= coverP1;

      if ((deficits[mat] || 0) > 0) {
        const coverP2 = Math.min(deficits[mat], pack2);
        deficits[mat] -= coverP2;
        pack2 -= coverP2;
      }

      if ((deficits[mat] || 0) > 0) {
        const coverP3 = Math.min(deficits[mat], pack3);
        deficits[mat] -= coverP3;
        pack3 -= coverP3;
      }

      if ((deficits[mat] || 0) > 0) {
        const coverP4 = Math.min(deficits[mat], pack4);
        deficits[mat] -= coverP4;
        pack4 -= coverP4;
      }

      if ((deficits[mat] || 0) > 0) {
        const coverP5 = Math.min(deficits[mat], pack5);
        deficits[mat] -= coverP5;
        pack5 -= coverP5;
      }
    }

    return deficits;
  }, [allMaterials, materialInventory, supplyPacks]);

  const packsApplied = React.useMemo(() => {
    const weeklyMats = Object.values(WeeklyBossMaterial) as string[];
    let total = 0;
    for (const mat of weeklyMats) {
      const required = allMaterials.find(m => m.material.name === mat)?.quantity || 0;
      if (required === 0) continue;
      const owned = materialInventory[mat] || 0;
      const raw = Math.max(0, required - owned);
      const adj = weeklyBossDeficits[mat] || 0;
      total += raw - adj;
    }
    return total;
  }, [allMaterials, materialInventory, weeklyBossDeficits]);

  const materialSourceOrder = [
    'BossMaterial', 'ExpMaterial', 'SpecialtyMaterial',
    'ForgeryMaterial', 'EnemyMaterial', 'WeeklyBossMaterial', 'Currency', 'Other',
  ];

  const sortMaterials = (a: CalculatedMaterial, b: CalculatedMaterial) => {
    const aSource = getMaterialSource(a.material);
    const bSource = getMaterialSource(b.material);

    const aIndex = materialSourceOrder.indexOf(aSource);
    const bIndex = materialSourceOrder.indexOf(bSource);
    if (aIndex !== bIndex) return aIndex - bIndex;

    // Within a category, follow the registration order in materials.ts, which is
    // grouped by release version (and by tier low->high within each set).
    const aDataIndex = materialDataIndex.get(a.material.name) ?? Number.MAX_SAFE_INTEGER;
    const bDataIndex = materialDataIndex.get(b.material.name) ?? Number.MAX_SAFE_INTEGER;
    return aDataIndex - bDataIndex;
  };

  const sortedMaterials = [...allMaterials].sort(sortMaterials);

  const remainingNeededMaterials = sortedMaterials
    .map(mat => {
      if (weeklyBossDeficits[mat.material.name] !== undefined) {
        return { ...mat, quantity: weeklyBossDeficits[mat.material.name] };
      }
      if (synthesisEnabled && synthesisResult) {
        const adjusted = synthesisResult.adjustedNeeded[mat.material.name];
        if (adjusted !== undefined) return { ...mat, quantity: adjusted };
      }
      return mat;
    })
    .filter(mat => {
      if (weeklyBossDeficits[mat.material.name] !== undefined) {
        return weeklyBossDeficits[mat.material.name] > 0;
      }
      if (synthesisEnabled && synthesisResult) {
        const adjusted = synthesisResult.adjustedNeeded[mat.material.name];
        if (adjusted !== undefined) return adjusted > 0;
      }
      const currentInventory = getInventory(mat.material.name);
      return (mat.quantity - currentInventory) > 0;
    });


  const groupMaterialsByCategory = (materials: CalculatedMaterial[]) => {
    const groups: { [key: string]: { materials: CalculatedMaterial[]; totalWaveplateCost: number } } = {};

    materials.forEach(mat => {
      const source = getMaterialSource(mat.material);
      if (!groups[source]) {
        groups[source] = { materials: [], totalWaveplateCost: 0 };
      }
      groups[source].materials.push(mat);

      const neededToFarm = weeklyBossDeficits[mat.material.name] !== undefined
        ? mat.quantity
        : synthesisEnabled && synthesisResult && synthesisResult.adjustedNeeded[mat.material.name] !== undefined
          ? synthesisResult.adjustedNeeded[mat.material.name]
          : Math.max(0, mat.quantity - getInventory(mat.material.name));
      const materialDetails = getMaterialByName(mat.material.name);
      const materialRarity = materialDetails?.rarity;

      const waveplatePerUnit = getWaveplateCost(mat.material.name, source, materialRarity);
      groups[source].totalWaveplateCost += (neededToFarm * waveplatePerUnit);
    });

    for (const sourceCategory in groups) {
      const group = groups[sourceCategory];
      let claimCost = 0;

      if (sourceCategory === 'BossMaterial' || sourceCategory === 'WeeklyBossMaterial') {
        claimCost = CLAIM_COST.BOSS;
      } else if (sourceCategory === 'ForgeryMaterial' || sourceCategory === 'ExpMaterial' || sourceCategory === 'Currency') {
        claimCost = CLAIM_COST.CHALLENGE;
      }

      if (claimCost > 0 && group.totalWaveplateCost > 0) {
        group.totalWaveplateCost = Math.ceil(group.totalWaveplateCost / claimCost) * claimCost;
      }
    }

    return groups;
  };

  const materialGroups = groupMaterialsByCategory(remainingNeededMaterials);

  const excessMaterials = inventoryEnabled ? (() => {
    const required: { [name: string]: number } = {};
    const owned: { [name: string]: number } = {};
    allMaterials.forEach(m => {
      required[m.material.name] = m.quantity;
      owned[m.material.name] = getInventory(m.material.name);
    });

    const excessMap: { [name: string]: number } = {};

    // Tierable materials: how much of each tier you can REMOVE (discard / sell /
    // synthesize away) and still have enough to cover every need in the chain.
    // The count accounts for upward synthesis (3 lower -> 1 higher): a tier's
    // surplus is reduced by whatever must be retained to synthesize up and cover
    // deficits on higher tiers. No downward synthesis is applied.
    calculateSynthesisExcess(required, owned).forEach(({ materialName, excessCount }) => {
      excessMap[materialName] = (excessMap[materialName] || 0) + excessCount;
    });

    // Non-tierable materials (boss / specialty / weekly / currency): raw surplus,
    // since no conversion exists for them.
    allMaterials.forEach(mat => {
      if (findTierGroup(mat.material.name)) return;
      const rawExcess = owned[mat.material.name] - mat.quantity;
      if (rawExcess > 0) {
        excessMap[mat.material.name] = (excessMap[mat.material.name] || 0) + rawExcess;
      }
    });

    return Object.entries(excessMap)
      .map(([name, excess]) => ({ material: getMaterialByName(name)!, excess }))
      .filter(({ material, excess }) => material && excess > 0)
      .sort((a, b) => sortMaterials({ material: a.material, quantity: 0 } as CalculatedMaterial, { material: b.material, quantity: 0 } as CalculatedMaterial));
  })() : [];

  useEffect(() => {
    const calculatedTotalWaveplate = Object.values(materialGroups).reduce((sum, group) => {
      return sum + group.totalWaveplateCost;
    }, 0);
    setTotalWaveplate(calculatedTotalWaveplate);
  }, [materialGroups]);

  const distributeCategoriesToColumns = (groups: { [key: string]: { materials: CalculatedMaterial[]; totalWaveplateCost: number } }) => {
    const column1: { materials: CalculatedMaterial[]; totalWaveplateCost: number }[] = [];
    const column2: { materials: CalculatedMaterial[]; totalWaveplateCost: number }[] = [];

    const sortedCategories = Object.keys(groups).sort((a, b) => {
      const aIndex = materialSourceOrder.indexOf(a);
      const bIndex = materialSourceOrder.indexOf(b);
      return aIndex - bIndex;
    });

    let column1ItemCount = 0;
    let column2ItemCount = 0;

    sortedCategories.forEach(category => {
      const categoryGroup = groups[category];

      if (column1ItemCount <= column2ItemCount) {
        column1.push(categoryGroup);
        column1ItemCount += categoryGroup.materials.length;
      } else {
        column2.push(categoryGroup);
        column2ItemCount += categoryGroup.materials.length;
      }
    });

    return { column1, column2 };
  };

  const { column1: column1Remaining, column2: column2Remaining } = distributeCategoriesToColumns(materialGroups);

  const handleInventoryChange = (materialName: string) => (value: number) => {
    setMaterialInventory(prev => ({
      ...prev,
      [materialName]: value,
    }));
  };

  const clearAllInventory = () => {
    setMaterialInventory({});
    setCrystalSolvents(0);
    setShellCredits(0);
    setSupplyPacks({ pack1: 0, pack2: 0, pack3: 0, pack4: 0, pack5: 0 });
  };

  const getRarityGlowClass = (rarity?: number) => {
    switch (rarity) {
      case 1: return 'drop-shadow-[0_0_12px_rgba(156,163,175,0.8)]';
      case 2: return 'drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]';
      case 3: return 'drop-shadow-[0_0_12px_rgba(96,165,250,0.8)]';
      case 4: return 'drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]';
      case 5: return 'drop-shadow-[0_0_12px_rgba(252,211,77,0.8)]';
      default: return '';
    }
  };

  const getContainerBorderClass = () => 'border-gray-700';

  const renderMaterialColumn = (
    materialGroups: { materials: CalculatedMaterial[]; totalWaveplateCost: number }[],
    columnKey: string
  ) => {
    return materialGroups.map((group, groupIndex) => {
      const displaySource = materialSourceDisplayNames[getMaterialSource(group.materials[0].material)] || getMaterialSource(group.materials[0].material);
      const sourceCategory = getMaterialSource(group.materials[0].material);
      let claims = 0;
      let claimCost = 0;

      if (sourceCategory === 'BossMaterial' || sourceCategory === 'WeeklyBossMaterial') {
        claimCost = CLAIM_COST.BOSS;
      } else if (sourceCategory === 'ForgeryMaterial' || sourceCategory === 'ExpMaterial' || sourceCategory === 'Currency') {
        claimCost = CLAIM_COST.CHALLENGE;
      }

      if (claimCost > 0 && group.totalWaveplateCost > 0) {
        claims = Math.ceil(group.totalWaveplateCost / claimCost);
      }

      return (
        <React.Fragment key={`${columnKey}-group-${groupIndex}`}>
          <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-300 border-b border-gray-600 pb-1 first:mt-0 flex items-center justify-between">
            <span>
              {displaySource}
              {sourceCategory === 'WeeklyBossMaterial' && packsApplied > 0 && (
                <span className="ml-2 text-xs font-normal text-green-400">({packsApplied} from Supply Packs)</span>
              )}
            </span>
            {group.totalWaveplateCost > 0 && (
              <span className="flex items-center text-sm font-normal text-cyan-400 text-right">
                <Icon src={WAVEPLATE_ICON_PATH} alt="Waveplates" className="w-5 h-5 mr-1" />
                {formatWaveplateNumber(group.totalWaveplateCost)} Waveplates
                {claims > 0 && (
                  <span className="ml-1 text-gray-400">({claims} Runs)</span>
                )}
              </span>
            )}
          </h4>
          {group.materials.map((mat) => {
            const materialDetails = getMaterialByName(mat.material.name);
            const iconSrc = materialDetails?.icon || '?';
            const rarityGlowClass = getRarityGlowClass(materialDetails?.rarity);
            const currentInventory = getInventory(mat.material.name);
            const neededToFarm = weeklyBossDeficits[mat.material.name] !== undefined
              ? mat.quantity
              : synthesisEnabled && synthesisResult && synthesisResult.adjustedNeeded[mat.material.name] !== undefined
                ? synthesisResult.adjustedNeeded[mat.material.name]
                : Math.max(0, mat.quantity - currentInventory);

            return (
              <div key={`${columnKey}-${mat.material.name}`} className="flex items-center justify-between gap-4 text-gray-200 py-2">
                <div className="flex items-center flex-grow">
                  <Icon src={iconSrc} alt={mat.material.name} className={`w-10 h-10 mr-4 rounded-full border border-gray-500 ${rarityGlowClass}`} />
                  <span className="font-medium flex-grow truncate">{mat.material.name}</span>
                </div>
                <div className="flex-shrink-0 text-right min-w-[60px]">
                  <span className="text-xl font-extrabold text-gray-300">x{neededToFarm}</span>
                </div>
              </div>
            );
          })}
          {sourceCategory === 'WeeklyBossMaterial' && group.materials.length > 0 && (() => {
            const totalMats = group.materials.reduce((s, m) => s + m.quantity, 0);
            const matsPerWeek = 9;
            const weeks = Math.ceil(totalMats / matsPerWeek);
            const months = Math.round(weeks / 4.345);
            const years = Math.floor(weeks / 52);
            return (
              <div className="text-xs text-gray-400 text-right mt-2 border-t border-gray-700 pt-2">
                ~{weeks} weeks ({months} months{years > 0 ? ` / ${years} years` : ''}) at 3 claims/week
              </div>
            );
          })()}
        </React.Fragment>
      );
    });
  };

  const hasPrerelease = (() => {
    for (const sel of characterSelections) {
      const c = characters.find(ch => ch.id === sel.id);
      if (c?.prerelease) return true;
    }
    for (const sel of weaponSelections) {
      const w = weapons.find(wp => wp.id === sel.id);
      if (w?.prerelease) return true;
    }
    return false;
  })();

  const prereleaseWarnings = (() => {
    const names: string[] = [];
    for (const sel of characterSelections) {
      const c = characters.find(ch => ch.id === sel.id);
      if (c?.prerelease) names.push(c.name);
    }
    for (const sel of weaponSelections) {
      const w = weapons.find(wp => wp.id === sel.id);
      if (w?.prerelease) names.push(w.name);
    }
    return names;
  })();

  return (
    <div className="bg-gray-950 text-white min-h-screen p-8 font-sans">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row items-center justify-center relative mb-12">
          <h1 className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400 md:flex-grow leading-normal">
            Wuthering Waves Material Planner
          </h1>
          <div className="mt-4 md:mt-0 md:absolute md:top-1/2 md:-translate-y-9/20 md:right-0 flex items-center text-gray-300">
            <span className="text-sm mr-2 whitespace-nowrap">Feedback or issues?</span>
            <a
              href="https://github.com/blin03/matcalc"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400"
            >
              <img src={GITHUB_ICON_PATH} alt="GitHub" className="w-10 h-10" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          <MultiDropdown
            label="Characters"
            options={characters}
            selectedIds={selectedCharIds}
            onToggle={handleToggleCharacter}
            placeholder="-- Select Characters --"
          />
          <MultiDropdown
            label="Weapons"
            options={weapons}
            selectedIds={selectedWeaponIds}
            onToggle={handleToggleWeapon}
            placeholder="-- Select Weapons --"
          />
        </div>

        {hasPrerelease && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-xl">
            <p className="text-red-400 text-sm">
              Warning: Pre-release item(s) selected ({prereleaseWarnings.join(', ')}). Materials are subject to change.
            </p>
          </div>
        )}

        {hasSelections && (
          <div className={`bg-gray-800 p-8 rounded-2xl shadow-2xl mb-4 border ${getContainerBorderClass()}`}>
            <h2 className="text-3xl font-bold mb-6 text-white border-b-2 border-gray-700 pb-4">Progression</h2>
            <div className="flex flex-col gap-8">
              {characterSelections.length > 0 && (
                <CharacterConfigPanel
                  characters={characters}
                  selections={characterSelections}
                  onUpdate={handleUpdateCharacter}
                  onRemove={(id) => {
                    const existing = characterSelections.find(s => s.id === id);
                    if (existing) setCharacterConfigCache(prev => ({ ...prev, [id]: existing }));
                    setCharacterSelections(prev => prev.filter(s => s.id !== id));
                  }}
                  containerBorderClass={getContainerBorderClass()}
                />
              )}
              {characterSelections.length > 1 && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setCharacterConfigCache(prev => {
                        const next = { ...prev };
                        characterSelections.forEach(s => { next[s.id] = s; });
                        return next;
                      });
                      setCharacterSelections([]);
                    }}
                    className="text-sm bg-gray-700 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Clear All Characters
                  </button>
                </div>
              )}
              {weaponSelections.length > 0 && (
                <WeaponConfigPanel
                  weapons={weapons}
                  selections={weaponSelections}
                  onUpdate={handleUpdateWeapon}
                  onRemove={(id) => setWeaponSelections(prev => prev.filter(s => s.id !== id))}
                  containerBorderClass={getContainerBorderClass()}
                />
              )}
            </div>
          </div>
        )}

        <div className={`bg-gray-800 p-8 rounded-2xl shadow-2xl border ${getContainerBorderClass()}`}>
          <h2 className="text-3xl font-bold mb-6 text-white border-b-2 border-gray-700 pb-4">Materials</h2>
          {hasSelections ? (
            <>
              {allMaterials.length > 0 && (
                <CollapsiblePanel
                  title="Materials Needed"
                  defaultOpen={true}
                  panelClassName={`bg-gray-900 border ${getContainerBorderClass()} rounded-xl mb-8`}
                >
                  <div className="p-5">
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {sortedMaterials.map((mat, index) => {
                        const iconSrc = mat.material.icon || '?';
                        const rarityGlowClass = getRarityGlowClass(mat.material.rarity);
                        const currentInventory = getInventory(mat.material.name);

                        return (
                          <li key={index} className={`flex flex-col items-center justify-center p-3 rounded-xl transition-transform duration-200 transform hover:scale-105 border ${getContainerBorderClass()} hover:border-purple-500`}>
                            <Icon src={iconSrc} alt={mat.material.name} className={`w-16 h-16 mb-2 ${rarityGlowClass}`} />
                            <div className="text-center">
                              <div className="w-full text-sm text-gray-300 font-medium truncate mb-1">
                                {mat.material.name}
                              </div>
                              {inventoryEnabled ? (
                                <MaterialInputField
                                  currentInventory={currentInventory}
                                  totalRequired={mat.quantity}
                                  onInventoryChange={handleInventoryChange(mat.material.name)}
                                  formatNumber={formatNumber}
                                />
                              ) : (
                                <span className="text-lg font-bold text-gray-300">x{formatNumber(mat.quantity)}</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="flex flex-col items-center gap-3 mt-6">
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={inventoryEnabled}
                          onChange={e => setInventoryEnabled(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-500 bg-gray-700 text-cyan-400 focus:ring-cyan-500"
                        />
                        Track Inventory
                      </label>
                      {inventoryEnabled && (
                        <>
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={synthesisEnabled}
                          onChange={e => setSynthesisEnabled(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                        Use Synthesis/Purification (3:1 up, 1:3 down)
                      </label>
                      {synthesisEnabled && synthesisResult && synthesisResult.savings.length > 0 && (
                        <div className="text-xs text-cyan-400 text-center max-w-md">
                          Synthesis reduces farming needs for {synthesisResult.savings.length} material tier(s)
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span className="text-gray-400">Weekly Supply Packs:</span>
                        {(['pack1', 'pack2', 'pack3', 'pack4', 'pack5'] as const).map((pack) => (
                          <div key={pack} className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">{pack === 'pack1' ? 'I' : pack === 'pack2' ? 'II' : pack === 'pack3' ? 'III' : pack === 'pack4' ? 'IV' : 'V'}</span>
                            <button
                              onClick={() => setSupplyPacks(prev => ({ ...prev, [pack]: Math.max(0, prev[pack] - 1) }))}
                              className="w-5 h-5 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-xs"
                            >−</button>
                            <input
                              type="number"
                              min={0}
                              value={supplyPacks[pack]}
                              onChange={e => setSupplyPacks(prev => ({ ...prev, [pack]: Math.max(0, parseInt(e.target.value) || 0) }))}
                              className="w-8 text-center text-white font-medium bg-gray-800 border border-gray-600 rounded text-xs py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => setSupplyPacks(prev => ({ ...prev, [pack]: prev[pack] + 1 }))}
                              className="w-5 h-5 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-xs"
                            >+</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-gray-400">Crystal Solvents:</span>
                        <button
                          onClick={() => setCrystalSolvents(Math.max(0, crystalSolvents - 1))}
                          className="w-5 h-5 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-xs"
                        >−</button>
                        <input
                          type="number"
                          min={0}
                          value={crystalSolvents}
                          onChange={e => setCrystalSolvents(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-8 text-center text-white font-medium bg-gray-800 border border-gray-600 rounded text-xs py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setCrystalSolvents(crystalSolvents + 1)}
                          className="w-5 h-5 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-xs"
                        >+</button>
                        <span className="text-xs text-gray-500">({CRYSTAL_SOLVENT_WAVEPLATES} WP each)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-gray-400">Shell Credits:</span>
                        <button
                          onClick={() => setShellCredits(Math.max(0, shellCredits - 100000))}
                          className="w-9 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold"
                        >-100k</button>
                        <button
                          onClick={() => setShellCredits(Math.max(0, shellCredits - 10000))}
                          className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold"
                        >-10k</button>
                        <input
                          type="number"
                          min={0}
                          value={shellCredits}
                          onChange={e => setShellCredits(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-20 text-center text-white font-medium bg-gray-800 border border-gray-600 rounded text-xs py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setShellCredits(shellCredits + 10000)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold"
                        >+10k</button>
                        <button
                          onClick={() => setShellCredits(shellCredits + 100000)}
                          className="w-9 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold"
                        >+100k</button>
                      </div>
                      <DataImport onImport={(inv) => setMaterialInventory(prev => ({ ...prev, ...inv }))} currentInventory={materialInventory} />
                      <button
                        onClick={clearAllInventory}
                        className="text-sm bg-gray-700 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                      >
                        Clear Inventory
                      </button>
                        </>
                      )}
                    </div>
                  </div>
                </CollapsiblePanel>
              )}

              {inventoryEnabled && excessMaterials.length > 0 && (
                <CollapsiblePanel title="Excess Materials" defaultOpen={true} panelClassName={`bg-gray-900 border ${getContainerBorderClass()} rounded-xl mb-8`}>
                  <div className="p-5">
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {excessMaterials.map(({ material, excess }) => {
                        const iconSrc = material.icon || '?';
                        const rarityGlowClass = getRarityGlowClass(material.rarity);
                        return (
                          <li key={material.name} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getContainerBorderClass()}`}>
                            <Icon src={iconSrc} alt={material.name} className={`w-12 h-12 mb-2 ${rarityGlowClass}`} />
                            <div className="text-center">
                              <div className="w-full text-xs text-gray-300 font-medium truncate mb-1" title={material.name}>
                                {material.name}
                              </div>
                              <span className="text-lg font-bold text-green-400">+{formatNumber(excess)}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </CollapsiblePanel>
              )}

              {remainingNeededMaterials.length > 0 ? (
                <CollapsiblePanel title={synthesisEnabled ? "To Be Farmed (After Synthesis)" : "To Be Farmed"} defaultOpen={true} panelClassName={`bg-gray-900 border ${getContainerBorderClass()} rounded-xl`}>
                    {totalWaveplate > 0 && (() => {
                      const solventSavings = crystalSolvents * CRYSTAL_SOLVENT_WAVEPLATES;
                      const effectiveWaveplate = Math.max(0, totalWaveplate - solventSavings);
                      return (
                      <div className="flex flex-col items-center justify-center text-xl font-bold text-cyan-400 py-3 border-b border-gray-700 bg-gray-800 rounded-t-xl">
                        <div className="flex items-center">
                          <Icon src={WAVEPLATE_ICON_PATH} alt="Waveplates" className="w-6 h-6 mr-2" />
                          <span className="mr-2">Total Waveplate Cost: {formatWaveplateNumber(effectiveWaveplate)}
                            {solventSavings > 0 && (
                              <span className="text-base font-normal text-green-400 ml-1">(-{formatWaveplateNumber(solventSavings)} from Crystal Solvents)</span>
                            )}
                          </span>
                          <span className="text-xl font-bold text-gray-400">({Math.ceil(effectiveWaveplate / 240)} Days</span>
                          <span className="text-lg font-bold text-gray-500 ml-1">/ {Math.ceil(effectiveWaveplate / 1680)} Weeks)</span>
                        </div>
                        <p className="text-sm font-normal text-gray-400 mt-1">Estimations based on drop rate averages at UL70 and above.</p>
                      </div>
                      );
                    })()}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>{renderMaterialColumn(column1Remaining, 'remaining-col1')}</div>
                    <div>{renderMaterialColumn(column2Remaining, 'remaining-col2')}</div>
                  </div>
                </CollapsiblePanel>
              ) : (
                <p className="text-gray-400 text-center text-lg py-4">No materials needed! You have all the materials required.</p>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-center text-lg py-12">Select characters or weapons to begin calculating materials.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
