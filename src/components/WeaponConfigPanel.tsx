import React from 'react';
import { Icon } from './Icon';
import { LevelSlider } from './LevelSlider';
import { CollapsiblePanel } from './CollapsiblePanel';
import { Weapon, WeaponSelectionConfig } from '../types';

interface WeaponConfigPanelProps {
  weapons: Weapon[];
  selections: WeaponSelectionConfig[];
  onUpdate: (id: string, config: Partial<WeaponSelectionConfig>) => void;
  onRemove: (id: string) => void;
  containerBorderClass: string;
}

const allowedLevels = [1, 20, 40, 50, 60, 70, 80, 90];

export const WeaponConfigPanel: React.FC<WeaponConfigPanelProps> = ({
  weapons,
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

  return (
    <div className="space-y-4">
      {selections.map(sel => {
        const weapon = weapons.find(w => w.id === sel.id);
        if (!weapon) return null;

        return (
          <CollapsiblePanel
            key={sel.id}
            title={
              <div className="flex items-center gap-3">
                {weapon.icon && (
                  <Icon src={weapon.icon} alt={weapon.name} className={`w-8 h-8 rounded-full ${getRarityGlowClass(weapon.rarity)}`} />
                )}
                <span className="text-lg font-semibold">{weapon.name}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(sel.id); }}
                  className="ml-auto text-gray-400 hover:text-red-400 transition-colors"
                  title={`Remove ${weapon.name}`}
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
                {weapon.icon && (
                  <Icon src={weapon.icon} alt={weapon.name} className={`w-24 h-24 rounded-full ${getRarityGlowClass(weapon.rarity)}`} />
                )}
                <h3 className="text-2xl font-bold mt-2">{weapon.name}</h3>
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
                  onClick={() => onUpdate(sel.id, { currentLevel: 90, targetLevel: 90 })}
                  className="text-sm bg-gray-700 hover:bg-red-700 text-white py-1.5 px-3 rounded-md transition-colors duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </CollapsiblePanel>
        );
      })}
    </div>
  );
};
