export enum MaterialRarity {
  ONE_STAR = 1,
  TWO_STAR = 2,
  THREE_STAR = 3,
  FOUR_STAR = 4,
  FIVE_STAR = 5,
}

export enum WeaponType {
  SWORD = 'Sword',
  PISTOL = 'Pistol',
  RECTIFIER = 'Rectifier',
  BROADBLADE = 'Broadblade',
  GAUNTLETS = 'Gauntlets',
}

// Define types for materials, characters, weapons, echoes, and levels
export interface Material {
  name: string;
  rarity?: MaterialRarity;
  type: 'character_exp' | 'weapon_exp' | 'echo_exp' | 'character_ascension' | 'weapon_ascension' | 'skill_material' | 'currency';
  icon?: string;
  xpValue?: number;
}

export interface LevelRequirement {
  level: number;
  ascension?: number;
  materials: { materialName: string; quantity: number }[];
}

// Define type for a character's specific material map
export interface CharacterSpecificMaterialMap {
  ascension: {
    boss?: string;
    enemy?: [string, string, string, string];
    specialty?: string;
    credits?: string;
  };
  exp: {
    xp?: string;
    credits?: string;
  };
  skill: {
    forgery?: [string, string, string, string];
    enemy?: [string, string, string, string];
    weekly?: string;
    credits?: string;
  };
  statNode: {
    forgery?: [string, string, string, string];
    enemy?: [string, string, string, string];
    weekly?: string;
    credits?: string;
  };
  inherentSkill: {
    forgery?: [string, string, string, string];
    enemy?: [string, string, string, string];
    weekly?: string;
    credits?: string;
  };
}

export interface Character {
  id: string;
  name: string;
  type: WeaponType;
  rarity: number;
  icon: string;
  statNodeNames?: string[];
  prerelease?: boolean;
  materialMap: CharacterSpecificMaterialMap;
  ascensionMaterials: LevelRequirement[];
  skillMaterials: LevelRequirement[];
  expMaterials: LevelRequirement[];
  statNodeMaterials: LevelRequirement[];
  inherentSkillMaterials: LevelRequirement[];
  ascensionOverrides?: { // Just for Rover, for now
    [level: number]: {
      [materialName: string]: {
        quantity: number;
      };
    };
  };
}

// Define a type for a weapon's specific material map
export interface WeaponSpecificMaterialMap {
  ascension: {
    forgery?: [string, string, string, string];
    enemy?: [string, string, string, string];
    credits?: string;
  };
  exp: {
    xp?: string;
    credits?: string;
  };
}

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  rarity: number;
  icon: string;
  prerelease?: boolean;
  materialMap: WeaponSpecificMaterialMap;
  ascensionMaterials: LevelRequirement[];
  expMaterials: LevelRequirement[];
}

export interface CalculatedMaterial {
  material: Material;
  quantity: number;
}

export interface CharacterSelectionConfig {
  id: string;
  currentLevel: number;
  targetLevel: number;
  skills: number[];
  targetSkills: number[];
  statNodeBooleans: boolean[][];
  inherentSkillBooleans: boolean[];
}

export interface WeaponSelectionConfig {
  id: string;
  currentLevel: number;
  targetLevel: number;
}
