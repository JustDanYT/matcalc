import { Weapon, WeaponSpecificMaterialMap, WeaponType } from '../types';
import { ASCENSION_TEMPLATES, EXP_TEMPLATES, applyTemplate } from './templates';
import { ExpMaterial, Currency } from './materials';
import { FORGERY_SWORD, FORGERY_PISTOL, FORGERY_RECTIFIER, FORGERY_BROADBLADE, FORGERY_GAUNTLETS,
        // @ts-ignore (unused imports for future)
         ENEMY_WHISPERIN, ENEMY_HOWLER, ENEMY_POLYGON, ENEMY_TIDAL_RESIDUUM, ENEMY_RING } from './materialSets';

const DEFAULT_WEAPON_ASCENSION_MAP: WeaponSpecificMaterialMap['ascension'] = {
  credits: Currency.SHELL_CREDITS,
};

const DEFAULT_WEAPON_EXP_MAP: WeaponSpecificMaterialMap['exp'] = {
  xp: ExpMaterial.PREMIUM_ENERGY_CORE,
  credits: Currency.SHELL_CREDITS,
};

/**
 * Creates a weapon object with materials generated from templates.
 * @param base - The base weapon object without material data.
 * @param overrides - Optional overrides for the default material maps.
 */
function createWeapon(
  base: Omit<Weapon, 'materialMap' | 'ascensionMaterials' | 'expMaterials'>,
  overrides?: Partial<WeaponSpecificMaterialMap>
): Weapon {
  const materialMap: WeaponSpecificMaterialMap = {
    ascension: { ...DEFAULT_WEAPON_ASCENSION_MAP, ...(overrides?.ascension || {}) },
    exp: { ...DEFAULT_WEAPON_EXP_MAP, ...(overrides?.exp || {}) },
  };

  let expTemplate;
  let ascensionTemplate;
  if (base.rarity === 5) {
    expTemplate = EXP_TEMPLATES.WEAPON_5;
    ascensionTemplate = ASCENSION_TEMPLATES.WEAPON_5;
  } else if (base.rarity === 4) {
    expTemplate = EXP_TEMPLATES.WEAPON_4;
    ascensionTemplate = ASCENSION_TEMPLATES.WEAPON_4;
  } else {
    throw new Error("No data available for rarities 3 and below."); 
  }

  return {
    ...base,
    materialMap,
    ascensionMaterials: applyTemplate(ascensionTemplate, materialMap.ascension),
    expMaterials: applyTemplate(expTemplate, materialMap.exp),
  };
}

// --- Weapon Definitions ---
export const abyssSurges: Weapon = createWeapon(
  {
    id: 'abyss_surges',
    name: 'Abyss Surges',
    type: WeaponType.GAUNTLETS,
    rarity: 5,
    icon: '/assets/icons/weapons/abyss_surges.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const amityAccord: Weapon = createWeapon(
  {
    id: 'amity_accord',
    name: 'Amity Accord',
    type: WeaponType.GAUNTLETS,
    rarity: 4,
    icon: '/assets/icons/weapons/amity_accord.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const augment: Weapon = createWeapon(
  {
    id: 'augment',
    name: 'Augment',
    type: WeaponType.RECTIFIER,
    rarity: 4,
    icon: '/assets/icons/weapons/augment.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const autumntrace: Weapon = createWeapon(
  {
    id: 'autumntrace',
    name: 'Autumntrace',
    type: WeaponType.BROADBLADE,
    rarity: 4,
    icon: '/assets/icons/weapons/autumntrace.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const cadenza: Weapon = createWeapon(
  {
    id: 'cadenza',
    name: 'Cadenza',
    type: WeaponType.PISTOL,
    rarity: 4,
    icon: '/assets/icons/weapons/cadenza.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const cometFlare: Weapon = createWeapon(
  {
    id: 'comet_flare',
    name: 'Comet Flare',
    type: WeaponType.RECTIFIER,
    rarity: 4,
    icon: '/assets/icons/weapons/comet_flare.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const commandoOfConviction: Weapon = createWeapon(
  {
    id: 'commando_of_conviction',
    name: 'Commando of Conviction',
    type: WeaponType.SWORD,
    rarity: 4,
    icon: '/assets/icons/weapons/commando_of_conviction.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const cosmicRipples: Weapon = createWeapon(
  {
    id: 'cosmic_ripples',
    name: 'Cosmic Ripples',
    type: WeaponType.RECTIFIER,
    rarity: 5,
    icon: '/assets/icons/weapons/cosmic_ripples.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const dauntlessEvernight: Weapon = createWeapon(
  {
    id: 'dauntless_evernight',
    name: 'Dauntless Evernight',
    type: WeaponType.BROADBLADE,
    rarity: 4,
    icon: '/assets/icons/weapons/dauntless_evernight.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const discord: Weapon = createWeapon(
  {
    id: 'discord',
    name: 'Discord',
    type: WeaponType.BROADBLADE,
    rarity: 4,
    icon: '/assets/icons/weapons/discord.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const emeraldOfGenesis: Weapon = createWeapon(
  {
    id: 'emerald_of_genesis',
    name: 'Emerald of Genesis',
    type: WeaponType.SWORD,
    rarity: 5,
    icon: '/assets/icons/weapons/emerald_of_genesis.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const heliosCleaver: Weapon = createWeapon(
  {
    id: 'helios_cleaver',
    name: 'Helios Cleaver',
    type: WeaponType.BROADBLADE,
    rarity: 4,
    icon: '/assets/icons/weapons/helios_cleaver.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const hollowMirage: Weapon = createWeapon(
  {
    id: 'hollow_mirage',
    name: 'Hollow Mirage',
    type: WeaponType.GAUNTLETS,
    rarity: 4,
    icon: '/assets/icons/weapons/hollow_mirage.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const jinzhouKeeper: Weapon = createWeapon(
  {
    id: 'jinzhou_keeper',
    name: 'Jinzhou Keeper',
    type: WeaponType.RECTIFIER,
    rarity: 4,
    icon: '/assets/icons/weapons/dauntless_evernight.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const lumingloss: Weapon = createWeapon(
  {
    id: 'lumingloss',
    name: 'Lumingloss',
    type: WeaponType.SWORD,
    rarity: 4,
    icon: '/assets/icons/weapons/lumingloss.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const lunarCutter: Weapon = createWeapon(
  {
    id: 'lunar_cutter',
    name: 'Lunar Cutter',
    type: WeaponType.SWORD,
    rarity: 4,
    icon: '/assets/icons/weapons/lunar_cutter.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const lustrousRazor: Weapon = createWeapon(
  {
    id: 'lustrous_razor',
    name: 'Lustrous Razor',
    type: WeaponType.BROADBLADE,
    rarity: 5,
    icon: '/assets/icons/weapons/lustrous_razor.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const marcato: Weapon = createWeapon(
  {
    id: 'marcato',
    name: 'Marcato',
    type: WeaponType.GAUNTLETS,
    rarity: 4,
    icon: '/assets/icons/weapons/marcato.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const novaburst: Weapon = createWeapon(
  {
    id: 'novaburst',
    name: 'Novaburst',
    type: WeaponType.PISTOL,
    rarity: 4,
    icon: '/assets/icons/weapons/novaburst.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const overture: Weapon = createWeapon(
  {
    id: 'overture',
    name: 'Overture',
    type: WeaponType.SWORD,
    rarity: 4,
    icon: '/assets/icons/weapons/overture.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const staticMist: Weapon = createWeapon(
  {
    id: 'static_mist',
    name: 'Static Mist',
    type: WeaponType.PISTOL,
    rarity: 5,
    icon: '/assets/icons/weapons/static_mist.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const stonard: Weapon = createWeapon(
  {
    id: 'stonard',
    name: 'Stonard',
    type: WeaponType.GAUNTLETS,
    rarity: 4,
    icon: '/assets/icons/weapons/stonard.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const stringmaster: Weapon = createWeapon(
  {
    id: 'stringmaster',
    name: 'Stringmaster',
    type: WeaponType.RECTIFIER,
    rarity: 5,
    icon: '/assets/icons/weapons/stringmaster.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const thunderbolt: Weapon = createWeapon(
  {
    id: 'thunderbolt',
    name: 'Thunderbolt',
    type: WeaponType.PISTOL,
    rarity: 4,
    icon: '/assets/icons/weapons/thunderbolt.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const undyingFlame: Weapon = createWeapon(
  {
    id: 'undying_flame',
    name: 'Undying Flame',
    type: WeaponType.PISTOL,
    rarity: 4,
    icon: '/assets/icons/weapons/undying_flame.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const variation: Weapon = createWeapon(
  {
    id: 'variation',
    name: 'Variation',
    type: WeaponType.RECTIFIER,
    rarity: 4,
    icon: '/assets/icons/weapons/variation.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const verdantSummit: Weapon = createWeapon(
  {
    id: 'verdant_summit',
    name: 'Verdant Summit',
    type: WeaponType.BROADBLADE,
    rarity: 5,
    icon: '/assets/icons/weapons/verdant_summit.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const agesOfHarvest: Weapon = createWeapon(
  {
    id: 'ages_of_harvest',
    name: 'Ages of Harvest',
    type: WeaponType.BROADBLADE,
    rarity: 5,
    icon: '/assets/icons/weapons/ages_of_harvest.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const blazingBrilliance: Weapon = createWeapon(
  {
    id: 'blazing_brilliance',
    name: 'Blazing Brilliance',
    type: WeaponType.SWORD,
    rarity: 5,
    icon: '/assets/icons/weapons/blazing_brilliance.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const rimeDrapedSprouts: Weapon = createWeapon(
  {
    id: 'rime_draped_sprouts',
    name: 'Rime-Draped Sprouts',
    type: WeaponType.RECTIFIER,
    rarity: 5,
    icon: '/assets/icons/weapons/rime_draped_sprouts.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const veritysHandle: Weapon = createWeapon(
  {
    id: 'veritys_handle',
    name: "Verity's Handle",
    type: WeaponType.GAUNTLETS,
    rarity: 5,
    icon: '/assets/icons/weapons/veritys_handle.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const stellarSymphony: Weapon = createWeapon(
  {
    id: 'stellar_symphony',
    name: 'Stellar Symphony',
    type: WeaponType.RECTIFIER,
    rarity: 5,
    icon: '/assets/icons/weapons/stellar_symphony.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const waningRedshift: Weapon = createWeapon(
  {
    id: 'waning_redshift',
    name: 'Waning Redshift',
    type: WeaponType.BROADBLADE,
    rarity: 4,
    icon: '/assets/icons/weapons/waning_redshift.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const endlessCollapse: Weapon = createWeapon(
  {
    id: 'endless_collapse',
    name: 'Endless Collapse',
    type: WeaponType.SWORD,
    rarity: 4,
    icon: '/assets/icons/weapons/endless_collapse.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const relativisticJet: Weapon = createWeapon(
  {
    id: 'relativistic_jet',
    name: 'Relativistic Jet',
    type: WeaponType.PISTOL,
    rarity: 4,
    icon: '/assets/icons/weapons/relativistic_jet.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const celestialSpiral: Weapon = createWeapon(
  {
    id: 'celestial_spiral',
    name: 'Celestial Spiral',
    type: WeaponType.GAUNTLETS,
    rarity: 4,
    icon: '/assets/icons/weapons/celestial_spiral.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const fusionAccretion: Weapon = createWeapon(
  {
    id: 'fusion_accretion',
    name: 'Fusion Accretion',
    type: WeaponType.RECTIFIER,
    rarity: 4,
    icon: '/assets/icons/weapons/fusion_accretion.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const redSpring: Weapon = createWeapon(
  {
    id: 'red_spring',
    name: 'Red Spring',
    type: WeaponType.SWORD,
    rarity: 5,
    icon: '/assets/icons/weapons/red_spring.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const somnoireAnchor: Weapon = createWeapon(
  {
    id: 'somnoire_anchor',
    name: 'Somnoire Anchor',
    type: WeaponType.SWORD,
    rarity: 4,
    icon: '/assets/icons/weapons/somnoire_anchor.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const theLastDance: Weapon = createWeapon(
  {
    id: 'the_last_dance',
    name: 'The Last Dance',
    type: WeaponType.PISTOL,
    rarity: 5,
    icon: '/assets/icons/weapons/the_last_dance.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const tragicomedy: Weapon = createWeapon(
  {
    id: 'tragicomedy',
    name: 'Tragicomedy',
    type: WeaponType.GAUNTLETS,
    rarity: 5,
    icon: '/assets/icons/weapons/tragicomedy.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const callOfTheAbyss: Weapon = createWeapon(
  {
    id: 'call_of_the_abyss',
    name: 'Call of the Abyss',
    type: WeaponType.RECTIFIER,
    rarity: 4,
    icon: '/assets/icons/weapons/call_of_the_abyss.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const meditationsOnMercy: Weapon = createWeapon(
  {
    id: 'meditationsOnMercy',
    name: 'Meditations on Mercy',
    type: WeaponType.BROADBLADE,
    rarity: 4,
    icon: '/assets/icons/weapons/meditations_on_mercy.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const legendOfDrunkenHero: Weapon = createWeapon(
  {
    id: 'legend_of_drunken_hero',
    name: 'Legend of Drunken Hero',
    type: WeaponType.GAUNTLETS,
    rarity: 4,
    icon: '/assets/icons/weapons/legend_of_drunken_hero.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const romanceInFarewell: Weapon = createWeapon(
  {
    id: 'romance_in_farewell',
    name: 'Romance in Farewell',
    type: WeaponType.PISTOL,
    rarity: 4,
    icon: '/assets/icons/weapons/romance_in_farewell.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const waltzInMasquerade: Weapon = createWeapon(
  {
    id: 'waltz_in_masquerade',
    name: 'Waltz in Masquerade',
    type: WeaponType.RECTIFIER,
    rarity: 4,
    icon: '/assets/icons/weapons/waltz_in_masquerade.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const fablesOfWisdom: Weapon = createWeapon(
  {
    id: 'fables_of_wisdom',
    name: 'Fables of Wisdom',
    type: WeaponType.SWORD,
    rarity: 4,
    icon: '/assets/icons/weapons/fables_of_wisdom.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const luminousHymn: Weapon = createWeapon(
  {
    id: 'luminous_hymn',
    name: 'Luminous Hymn',
    type: WeaponType.RECTIFIER,
    rarity: 5,
    icon: '/assets/icons/weapons/luminous_hymn.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const unflickeringValor: Weapon = createWeapon(
  {
    id: 'unflickering_valor',
    name: 'Unflickering Valor',
    type: WeaponType.SWORD,
    rarity: 5,
    icon: '/assets/icons/weapons/unflickering_valor.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const oceansGift: Weapon = createWeapon(
  {
    id: 'oceans_gift',
    name: "Ocean's Gift",
    type: WeaponType.RECTIFIER,
    rarity: 4,
    icon: '/assets/icons/weapons/oceans_gift.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const whispersOfSirens: Weapon = createWeapon(
  {
    id: 'whispers_of_sirens',
    name: 'Whispers of Sirens',
    type: WeaponType.RECTIFIER,
    rarity: 5,
    icon: '/assets/icons/weapons/whispers_of_sirens.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const bloodpactsPledge: Weapon = createWeapon(
  {
    id: 'bloodpacts_pledge',
    name: "Bloodpact's Pledge",
    type: WeaponType.SWORD,
    rarity: 5,
    icon: '/assets/icons/weapons/bloodpacts_pledge.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const blazingJustice: Weapon = createWeapon(
  {
    id: 'blazing_justice',
    name: 'Blazing Justice',
    type: WeaponType.GAUNTLETS,
    rarity: 5,
    icon: '/assets/icons/weapons/blazing_justice.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const woodlandAria: Weapon = createWeapon(
  {
    id: 'woodland_aria',
    name: 'Woodland Aria',
    type: WeaponType.PISTOL,
    rarity: 5,
    icon: '/assets/icons/weapons/woodland_aria.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const defiersThorn: Weapon = createWeapon(
  {
    id: 'defiers_thorn',
    name: "Defier's Thorn",
    type: WeaponType.SWORD,
    rarity: 5,
    icon: '/assets/icons/weapons/defiers_thorn.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const wildfireMark: Weapon = createWeapon(
  {
    id: 'wildfire_mark',
    name: 'Wildfire Mark',
    type: WeaponType.BROADBLADE,
    rarity: 5,
    icon: '/assets/icons/weapons/wildfire_mark.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const letheanElegy: Weapon = createWeapon(
  {
    id: 'lethean_elegy',
    name: 'Lethean Elegy',
    type: WeaponType.RECTIFIER,
    rarity: 5,
    icon: '/assets/icons/weapons/lethean_elegy.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const thunderflareDominion: Weapon = createWeapon(
  {
    id: 'thunderflare_dominion',
    name: 'Thunderflare Dominion',
    type: WeaponType.BROADBLADE,
    rarity: 5,
    icon: '/assets/icons/weapons/thunderflare_dominion.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const moongazersSigil: Weapon = createWeapon(
  {
    id: 'moongazers_sigil',
    name: "Moongazer's Sigil",
    type: WeaponType.GAUNTLETS,
    rarity: 5,
    icon: '/assets/icons/weapons/moongazers_sigil.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const aureateZenith: Weapon = createWeapon(
  {
    id: 'aureate_zenith',
    name: 'Aureate Zenith',
    type: WeaponType.BROADBLADE,
    rarity: 4,
    icon: '/assets/icons/weapons/aureate_zenith.webp',
  },
  {
    ascension: { forgery: FORGERY_BROADBLADE, enemy: ENEMY_WHISPERIN }
  }
);

export const featherEdge: Weapon = createWeapon(
  {
    id: 'feather_edge',
    name: 'Feather Edge',
    type: WeaponType.SWORD,
    rarity: 4,
    icon: '/assets/icons/weapons/feather_edge.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const solarFlame: Weapon = createWeapon(
  {
    id: 'solar_flame',
    name: 'Solar Flame',
    type: WeaponType.PISTOL,
    rarity: 4,
    icon: '/assets/icons/weapons/solar_flame.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const aetherStrike: Weapon = createWeapon(
  {
    id: 'aether_strike',
    name: 'Aether Strike',
    type: WeaponType.GAUNTLETS,
    rarity: 4,
    icon: '/assets/icons/weapons/aether_strike.webp',
  },
  {
    ascension: { forgery: FORGERY_GAUNTLETS, enemy: ENEMY_HOWLER }
  }
);

export const radiantDawn: Weapon = createWeapon(
  {
    id: 'radiant_dawn',
    name: 'Radiant Dawn',
    type: WeaponType.RECTIFIER,
    rarity: 4,
    icon: '/assets/icons/weapons/radiant_dawn.webp',
  },
  {
    ascension: { forgery: FORGERY_RECTIFIER, enemy: ENEMY_RING }
  }
);

export const luxAndUmbra: Weapon = createWeapon(
  {
    id: 'lux_and_umbra',
    name: 'Lux & Umbra',
    type: WeaponType.PISTOL,
    rarity: 5,
    icon: '/assets/icons/weapons/lux_and_umbra.webp',
  },
  {
    ascension: { forgery: FORGERY_PISTOL, enemy: ENEMY_RING }
  }
);

export const emeraldSentence: Weapon = createWeapon(
  {
    id: 'emerald_sentence',
    name: 'Emerald Sentence',
    type: WeaponType.SWORD,
    rarity: 5,
    icon: '/assets/icons/weapons/emerald_sentence.webp',
  },
  {
    ascension: { forgery: FORGERY_SWORD, enemy: ENEMY_HOWLER }
  }
);

export const weapons: Weapon[] = [
  // v1.0
  abyssSurges,
  amityAccord,
  augment,
  autumntrace,
  cadenza,
  cometFlare,
  cosmicRipples,
  dauntlessEvernight,
  discord,
  emeraldOfGenesis,
  heliosCleaver,
  hollowMirage,
  jinzhouKeeper,
  lumingloss,
  lunarCutter,
  lustrousRazor,
  marcato,
  novaburst,
  overture,
  staticMist,
  stonard,
  stringmaster,
  thunderbolt,
  undyingFlame,
  variation,
  verdantSummit,

  // v1.1
  agesOfHarvest,
  blazingBrilliance,

  // v1.2
  rimeDrapedSprouts,
  veritysHandle,

  // v1.3
  stellarSymphony,
  waningRedshift,
  endlessCollapse,
  relativisticJet,
  celestialSpiral,
  fusionAccretion,

  // v1.4
  redSpring,
  somnoireAnchor,

  // v2.0
  theLastDance,
  tragicomedy,
  callOfTheAbyss,
  meditationsOnMercy,
  legendOfDrunkenHero,
  romanceInFarewell,
  waltzInMasquerade,
  fablesOfWisdom,

  // v2.1
  luminousHymn,
  unflickeringValor,
  oceansGift,

  // v2.2
  whispersOfSirens,
  bloodpactsPledge,

  // v2.3
  blazingJustice,
  woodlandAria,

  // v2.4
  defiersThorn,
  wildfireMark,

  // v2.5
  letheanElegy,

  // v2.6
  thunderflareDominion,
  moongazersSigil,
  aureateZenith,
  featherEdge,
  solarFlame,
  aetherStrike,
  radiantDawn,

  // v2.7
  luxAndUmbra,
  emeraldSentence,
];