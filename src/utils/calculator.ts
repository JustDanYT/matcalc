import { Character, Weapon, CalculatedMaterial, LevelRequirement, CharacterSelectionConfig } from '../types';
import { getMaterialByName } from '../data/materials';

// Compute all materials a character selection requires (ascension + exp + skills + stat nodes + inherent skills)
export const calculateCharacterTotalMaterials = (
  char: Character,
  sel: CharacterSelectionConfig
): { [materialName: string]: number } => {
  const required: { [key: string]: number } = {};

  const add = (list: CalculatedMaterial[]) => {
    list.forEach(m => {
      required[m.material.name] = (required[m.material.name] || 0) + m.quantity;
    });
  };

  add(calculateMaterials(char, sel.currentLevel, sel.targetLevel, 'ascension'));
  add(calculateMaterials(char, sel.currentLevel, sel.targetLevel, 'exp'));

  sel.skills.forEach((current, index) => {
    add(calculateMaterials(char, current, sel.targetSkills[index], 'skill'));
  });

  sel.statNodeBooleans.forEach((levels) => {
    const [isL1Checked, isL2Checked] = levels;
    if (isL1Checked && isL2Checked) {
      add(calculateMaterials(char, 0, 2, 'statNode'));
    } else if (isL1Checked) {
      add(calculateMaterials(char, 0, 1, 'statNode'));
    } else if (isL2Checked) {
      add(calculateMaterials(char, 1, 2, 'statNode'));
    }
  });

  const [isL1Checked, isL2Checked] = sel.inherentSkillBooleans;
  if (isL1Checked && isL2Checked) {
    add(calculateMaterials(char, 0, 2, 'inherentSkill'));
  } else if (isL1Checked) {
    add(calculateMaterials(char, 0, 1, 'inherentSkill'));
  } else if (isL2Checked) {
    add(calculateMaterials(char, 1, 2, 'inherentSkill'));
  }

  return required;
};

export const calculateMaterials = (
  item: Character | Weapon | null,
  currentLevel: number,
  targetLevel: number,
  type: 'ascension' | 'skill' | 'exp' | 'statNode' | 'inherentSkill'
): CalculatedMaterial[] => {
  if (!item || currentLevel >= targetLevel) return [];

  const requiredMaterials: { [key: string]: number } = {};
  let relevantRequirements: LevelRequirement[] = [];

  // Determine the relevant requirements based on the type
  switch (type) {
    case 'ascension':
      if ('ascensionMaterials' in item) {
        relevantRequirements = item.ascensionMaterials;
      }
      break;
    case 'exp':
      if ('expMaterials' in item) {
        relevantRequirements = item.expMaterials;
      }
      break;
    case 'skill':
      if ('skillMaterials' in item) {
        relevantRequirements = item.skillMaterials;
      }
      break;
    case 'statNode':
      if ('statNodeMaterials' in item) {
        relevantRequirements = item.statNodeMaterials;
      }
      break;
    case 'inherentSkill':
      if ('inherentSkillMaterials' in item) {
        relevantRequirements = item.inherentSkillMaterials;
      }
      break;
    default:
      return [];
  }

  // Filter requirements between current and target level
  const levelsToConsider = relevantRequirements.filter(req => {
    if (type === 'ascension') {
      // For ascension, only include costs if targetLevel strictly exceeds the ascension threshold
      return req.level >= currentLevel && targetLevel > req.level;
    } else {
      return req.level > currentLevel && targetLevel >= req.level;
    }
  });

  levelsToConsider.forEach(req => {
    req.materials.forEach(mat => {
      requiredMaterials[mat.materialName] = (requiredMaterials[mat.materialName] || 0) + mat.quantity;
    });
  });

  return Object.entries(requiredMaterials).map(([name, quantity]) => ({
    material: getMaterialByName(name)!,
    quantity,
  }));
};