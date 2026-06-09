import React from 'react';
import { Icon } from './Icon';
import { LevelSlider } from './LevelSlider';
import { LevelCheckbox } from './LevelCheckbox';
import { CollapsiblePanel } from './CollapsiblePanel';
import { Character, CharacterSelectionConfig } from '../types';

interface CharacterConfigPanelProps {
  characters: Character[];
  selections: CharacterSelectionConfig[];
  onUpdate: (id: string, config: Partial<CharacterSelectionConfig>) => void;
  onRemove: (id: string) => void;
  containerBorderClass: string;
}

const skillLabels = ["Basic Attack", "Resonance Skill", "Forte Circuit", "Resonance Liberation", "Intro Skill"];
const allowedLevels = [1, 20, 40, 50, 60, 70, 80, 90];

export const CharacterConfigPanel: React.FC<CharacterConfigPanelProps> = ({
  characters,
  selections,
  onUpdate,
  onRemove,
  containerBorderClass,
}) => {
  if (selections.length === 0) return null;

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

  const handleSkillChange = (charId: string, index: number, isCurrent: boolean) => (level: number) => {
    const sel = selections.find(s => s.id === charId);
    if (!sel) return;
    const key = isCurrent ? 'skills' : 'targetSkills';
    const arr = [...sel[key]];
    arr[index] = level;
    onUpdate(charId, { [key]: arr });
  };

  const handleStatNodeChange = (charId: string, index: number, level: 1 | 2) => (checked: boolean) => {
    const sel = selections.find(s => s.id === charId);
    if (!sel) return;
    const newLevels = [...sel.statNodeBooleans];
    const newBooleans = [...newLevels[index]];
    newBooleans[level === 1 ? 0 : 1] = checked;
    newLevels[index] = newBooleans;
    onUpdate(charId, { statNodeBooleans: newLevels });
  };

  const handleInherentSkillChange = (charId: string, level: 1 | 2) => (checked: boolean) => {
    const sel = selections.find(s => s.id === charId);
    if (!sel) return;
    const newBooleans = [...sel.inherentSkillBooleans];
    newBooleans[level === 1 ? 0 : 1] = checked;
    onUpdate(charId, { inherentSkillBooleans: newBooleans });
  };

  const resetCharLevels = (charId: string) => {
    onUpdate(charId, { currentLevel: 90, targetLevel: 90 });
  };

  const resetCharSkills = (charId: string) => {
    onUpdate(charId, {
      skills: Array(5).fill(1),
      targetSkills: Array(5).fill(10),
      statNodeBooleans: Array(4).fill([true, true]),
      inherentSkillBooleans: [true, true],
    });
  };

  return (
    <div className="space-y-4">
      {selections.map(sel => {
        const char = characters.find(c => c.id === sel.id);
        if (!char) return null;

        const statNodeName1 = char.statNodeNames?.[0] || 'Stat Node';
        const statNodeName2 = char.statNodeNames?.[1] || 'Stat Node';

        return (
          <CollapsiblePanel
            key={sel.id}
            title={
              <div className="flex items-center gap-3">
                {char.icon && (
                  <Icon src={char.icon} alt={char.name} className={`w-10 h-10 rounded-full ${getRarityGlowClass(char.rarity)}`} />
                )}
                <span className="text-lg font-semibold">{char.name}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(sel.id); }}
                  className="ml-auto text-gray-400 hover:text-red-400 transition-colors"
                  title={`Remove ${char.name}`}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            }
            defaultOpen={true}
            panelClassName={`bg-gray-800 border ${containerBorderClass} rounded-xl`}
          >
            <div className="p-4 space-y-4">
              <div className="flex flex-col items-center">
                {char.icon && (
                  <Icon src={char.icon} alt={char.name} className={`w-24 h-24 rounded-full ${getRarityGlowClass(char.rarity)}`} />
                )}
                <h3 className="text-2xl font-bold mt-2">{char.name}</h3>
              </div>
              <LevelSlider
                label="Level"
                currentLevel={sel.currentLevel}
                targetLevel={sel.targetLevel}
                allowedValues={allowedLevels}
                onCurrentChange={(l) => onUpdate(sel.id, { currentLevel: l })}
                onTargetChange={(l) => onUpdate(sel.id, { targetLevel: l })}
              />
              <div className="flex justify-center">
                <button
                  onClick={() => resetCharLevels(sel.id)}
                  className="text-sm bg-gray-700 hover:bg-red-700 text-white py-1.5 px-3 rounded-md transition-colors duration-200"
                >
                  Reset Levels
                </button>
              </div>

              <CollapsiblePanel title="Skills and Stats" defaultOpen={false} panelClassName={`bg-gray-900 border ${containerBorderClass} rounded-xl`}>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <LevelCheckbox
                      label={statNodeName1}
                      isL1Checked={sel.statNodeBooleans[0][0]}
                      isL2Checked={sel.statNodeBooleans[0][1]}
                      onL1Change={handleStatNodeChange(sel.id, 0, 1)}
                      onL2Change={handleStatNodeChange(sel.id, 0, 2)}
                    />
                    <LevelCheckbox
                      label={statNodeName2}
                      isL1Checked={sel.statNodeBooleans[1][0]}
                      isL2Checked={sel.statNodeBooleans[1][1]}
                      onL1Change={handleStatNodeChange(sel.id, 1, 1)}
                      onL2Change={handleStatNodeChange(sel.id, 1, 2)}
                    />
                    <LevelCheckbox
                      label="Inherent Skills"
                      isL1Checked={sel.inherentSkillBooleans[0]}
                      isL2Checked={sel.inherentSkillBooleans[1]}
                      onL1Change={handleInherentSkillChange(sel.id, 1)}
                      onL2Change={handleInherentSkillChange(sel.id, 2)}
                    />
                    <LevelCheckbox
                      label={statNodeName2}
                      isL1Checked={sel.statNodeBooleans[2][0]}
                      isL2Checked={sel.statNodeBooleans[2][1]}
                      onL1Change={handleStatNodeChange(sel.id, 2, 1)}
                      onL2Change={handleStatNodeChange(sel.id, 2, 2)}
                    />
                    <LevelCheckbox
                      label={statNodeName1}
                      isL1Checked={sel.statNodeBooleans[3][0]}
                      isL2Checked={sel.statNodeBooleans[3][1]}
                      onL1Change={handleStatNodeChange(sel.id, 3, 1)}
                      onL2Change={handleStatNodeChange(sel.id, 3, 2)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {sel.skills.map((_, index) => (
                      <LevelSlider
                        key={`skill-${sel.id}-${index}`}
                        label={skillLabels[index]}
                        currentLevel={sel.skills[index]}
                        targetLevel={sel.targetSkills[index]}
                        maxLevel={10}
                        minLevel={1}
                        onCurrentChange={handleSkillChange(sel.id, index, true)}
                        onTargetChange={handleSkillChange(sel.id, index, false)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-center pb-4">
                  <button
                    onClick={() => resetCharSkills(sel.id)}
                    className="text-sm bg-gray-700 hover:bg-red-700 text-white py-1.5 px-3 rounded-md transition-colors duration-200"
                  >
                    Reset Skills
                  </button>
                </div>
              </CollapsiblePanel>
            </div>
          </CollapsiblePanel>
        );
      })}
    </div>
  );
};
