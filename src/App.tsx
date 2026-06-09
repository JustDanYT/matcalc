import React, { useState, useEffect } from 'react';
import { characters } from './data/characters';
import { weapons } from './data/weapons';
import { calculateMaterials } from './utils/calculator';
import { Icon } from './components/Icon';
import { CalculatedMaterial, CharacterSelectionConfig, WeaponSelectionConfig, Material } from './types';
import { getMaterialByName, BossMaterial, EnemyMaterial, SpecialtyMaterial, ForgeryMaterial, ExpMaterial, Currency, WeeklyBossMaterial } from './data/materials';
import * as materialSets from './data/materialSets';
import { CollapsiblePanel } from './components/CollapsiblePanel';
import { MultiDropdown } from './components/MultiDropdown';
import { MaterialInputField } from './components/MaterialInputField';
import { CharacterConfigPanel } from './components/CharacterConfigPanel';
import { WeaponConfigPanel } from './components/WeaponConfigPanel';
import { getWaveplateCost, CLAIM_COST } from './data/waveplateCosts';

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

const getMaterialSetId = (material: Material): string | null => {
  for (const key in materialSets) {
    const materialSet = (materialSets as any)[key];
    if (Array.isArray(materialSet) && materialSet.includes(material.name as any)) {
      return key;
    }
  }
  return null;
};

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

  const [allMaterials, setAllMaterials] = useState<CalculatedMaterial[]>([]);
  const [totalWaveplate, setTotalWaveplate] = useState<number>(0);

  useEffect(() => {
    try {
      const stateToSave = { characterSelections, weaponSelections, materialInventory };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error("Could not save state to localStorage", err);
    }
  }, [characterSelections, weaponSelections, materialInventory]);

  const hasSelections = characterSelections.length > 0 || weaponSelections.length > 0;

  const selectedCharIds = characterSelections.map(s => s.id);
  const selectedWeaponIds = weaponSelections.map(s => s.id);

  const handleToggleCharacter = (id: string) => {
    setCharacterSelections(prev => {
      if (prev.some(s => s.id === id)) {
        return prev.filter(s => s.id !== id);
      }
      return [...prev, createDefaultCharSelection(id)];
    });
  };

  const handleToggleWeapon = (id: string) => {
    setWeaponSelections(prev => {
      if (prev.some(s => s.id === id)) {
        return prev.filter(s => s.id !== id);
      }
      return [...prev, createDefaultWeaponSelection(id)];
    });
  };

  const handleUpdateCharacter = (id: string, config: Partial<CharacterSelectionConfig>) => {
    setCharacterSelections(prev => prev.map(s => s.id === id ? { ...s, ...config } : s));
  };

  const handleUpdateWeapon = (id: string, config: Partial<WeaponSelectionConfig>) => {
    setWeaponSelections(prev => prev.map(s => s.id === id ? { ...s, ...config } : s));
  };

  useEffect(() => {
    const tempAllMaterials: CalculatedMaterial[] = [];

    characterSelections.forEach(sel => {
      const char = characters.find(c => c.id === sel.id);
      if (!char) return;

      tempAllMaterials.push(...calculateMaterials(char, sel.currentLevel, sel.targetLevel, 'ascension'));
      tempAllMaterials.push(...calculateMaterials(char, sel.currentLevel, sel.targetLevel, 'exp'));

      sel.skills.forEach((current, index) => {
        tempAllMaterials.push(...calculateMaterials(char, current, sel.targetSkills[index], 'skill'));
      });

      sel.statNodeBooleans.forEach((levels) => {
        const [isL1Checked, isL2Checked] = levels;
        if (isL1Checked && isL2Checked) {
          tempAllMaterials.push(...calculateMaterials(char, 0, 2, 'statNode'));
        } else if (isL1Checked) {
          tempAllMaterials.push(...calculateMaterials(char, 0, 1, 'statNode'));
        } else if (isL2Checked) {
          tempAllMaterials.push(...calculateMaterials(char, 1, 2, 'statNode'));
        }
      });

      const [isL1Checked, isL2Checked] = sel.inherentSkillBooleans;
      if (isL1Checked && isL2Checked) {
        tempAllMaterials.push(...calculateMaterials(char, 0, 2, 'inherentSkill'));
      } else if (isL1Checked) {
        tempAllMaterials.push(...calculateMaterials(char, 0, 1, 'inherentSkill'));
      } else if (isL2Checked) {
        tempAllMaterials.push(...calculateMaterials(char, 1, 2, 'inherentSkill'));
      }
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

  const materialSourceOrder = [
    'BossMaterial', 'ExpMaterial', 'SpecialtyMaterial',
    'ForgeryMaterial', 'EnemyMaterial', 'WeeklyBossMaterial', 'Currency', 'Other',
  ];

  const sortMaterials = (a: CalculatedMaterial, b: CalculatedMaterial) => {
    const aSource = getMaterialSource(a.material);
    const bSource = getMaterialSource(b.material);
    const aSetId = getMaterialSetId(a.material);
    const bSetId = getMaterialSetId(b.material);

    const aIndex = materialSourceOrder.indexOf(aSource);
    const bIndex = materialSourceOrder.indexOf(bSource);
    if (aIndex !== bIndex) return aIndex - bIndex;

    if ((aSource === 'EnemyMaterial' || aSource === 'ForgeryMaterial') &&
        (bSource === 'EnemyMaterial' || bSource === 'ForgeryMaterial')) {
        if (aSetId && bSetId) {
            if (aSetId === bSetId) {
                return (a.material.rarity || 0) - (b.material.rarity || 0);
            }
            return aSetId.localeCompare(bSetId);
        }
    }

    if (a.material.rarity && b.material.rarity && a.material.rarity !== b.material.rarity) {
      return (a.material.rarity || 0) - (b.material.rarity || 0);
    }

    return a.material.name.localeCompare(b.material.name);
  };

  const sortedMaterials = [...allMaterials].sort(sortMaterials);

  const remainingNeededMaterials = sortedMaterials.filter(mat => {
    const currentInventory = materialInventory[mat.material.name] || 0;
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

      const neededToFarm = Math.max(0, mat.quantity - (materialInventory[mat.material.name] || 0));
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
            <span>{displaySource}</span>
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
            const currentInventory = materialInventory[mat.material.name] || 0;
            const neededToFarm = Math.max(0, mat.quantity - currentInventory);

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
                  onRemove={(id) => setCharacterSelections(prev => prev.filter(s => s.id !== id))}
                  containerBorderClass={getContainerBorderClass()}
                />
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
                        const currentInventory = materialInventory[mat.material.name] || 0;

                        return (
                          <li key={index} className={`flex flex-col items-center justify-center p-3 rounded-xl transition-transform duration-200 transform hover:scale-105 border ${getContainerBorderClass()} hover:border-purple-500`}>
                            <Icon src={iconSrc} alt={mat.material.name} className={`w-16 h-16 mb-2 ${rarityGlowClass}`} />
                            <div className="text-center">
                              <div className="w-full text-sm text-gray-300 font-medium truncate mb-1">
                                {mat.material.name}
                              </div>
                              <MaterialInputField
                                currentInventory={currentInventory}
                                totalRequired={mat.quantity}
                                onInventoryChange={handleInventoryChange(mat.material.name)}
                                formatNumber={formatNumber}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={clearAllInventory}
                        className="text-sm bg-gray-700 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </CollapsiblePanel>
              )}

              {remainingNeededMaterials.length > 0 ? (
                <CollapsiblePanel title="To Be Farmed" defaultOpen={true} panelClassName={`bg-gray-900 border ${getContainerBorderClass()} rounded-xl`}>
                    {totalWaveplate > 0 && (
                      <div className="flex flex-col items-center justify-center text-xl font-bold text-cyan-400 py-3 border-b border-gray-700 bg-gray-800 rounded-t-xl">
                        <div className="flex items-center">
                          <Icon src={WAVEPLATE_ICON_PATH} alt="Waveplates" className="w-6 h-6 mr-2" />
                          <span className="mr-2">Total Waveplate Cost: {formatWaveplateNumber(totalWaveplate)}</span>
                          <span className="text-xl font-bold text-gray-400">({Math.ceil(totalWaveplate / 240)} Days)</span>
                        </div>
                        <p className="text-sm font-normal text-gray-400 mt-1">Estimations based on drop rate averages at UL70 and above.</p>
                      </div>
                    )}
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
