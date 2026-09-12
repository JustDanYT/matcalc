import React, { useRef, useState } from 'react';
import { itemIdToMaterialName, wuwaInventoryKameraUrl } from '../data/itemIdMapping';
import { allMaterials } from '../data/materials';
import { CharacterSelectionConfig, WeaponSelectionConfig } from '../types';
import { Icon } from './Icon';


const plannerMaterialNames = new Set(allMaterials.map(m => m.name));

const plannerStateKeys = [
  'characterSelections',
  'weaponSelections',
  'materialInventory',
  'characterConfigCache',
  'supplyPacks',
  'crystalSolvents',
  'shellCredits',
  'inventoryEnabled',
] as const;

export interface PlannerState {
  characterSelections?: CharacterSelectionConfig[];
  weaponSelections?: WeaponSelectionConfig[];
  materialInventory?: { [materialName: string]: number };
  characterConfigCache?: { [id: string]: CharacterSelectionConfig };
  supplyPacks?: { pack1: number; pack2: number; pack3: number; pack4: number; pack5: number };
  crystalSolvents?: number;
  shellCredits?: number;
  inventoryEnabled?: boolean;
}

interface DisplayItem {
  id: string;
  name: string;
  qty: number;
  isPlannerMaterial: boolean;
}

interface DataImportProps {
  onImport: (inventory: { [materialName: string]: number }) => void;
  currentInventory: { [materialName: string]: number };
  fullState: PlannerState;
  onImportFullState: (state: PlannerState) => void;
}

export const DataImport: React.FC<DataImportProps> = ({ onImport, currentInventory, fullState, onImportFullState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stateFileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const inventory: { [materialName: string]: number } = {};
      let matched = 0;
      const items: DisplayItem[] = [];

      for (const [itemId, quantity] of Object.entries(data)) {
        if (itemId.startsWith('_')) continue;
        if (typeof quantity !== 'number' || quantity <= 0) continue;

        const materialName = itemIdToMaterialName[itemId];
        if (materialName) {
          const isPlannerMat = plannerMaterialNames.has(materialName);
          items.push({ id: itemId, name: materialName, qty: quantity, isPlannerMaterial: isPlannerMat });
          if (isPlannerMat) {
            inventory[materialName] = (inventory[materialName] || 0) + quantity;
            matched++;
          }
        } else {
          items.push({ id: itemId, name: itemId, qty: quantity, isPlannerMaterial: false });
        }
      }

      setDisplayItems(items);
      setShowDetails(false);

      if (matched === 0) {
        setImportStatus('No recognized materials found. Make sure this is a WuWa Inventory Kamera inventory.json file.');
        setStatusType('error');
        return;
      }

      onImport(inventory);
      const skipped = items.filter(i => !i.isPlannerMaterial).length;
      setImportStatus(`Imported ${matched} material${matched !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} item${skipped !== 1 ? 's' : ''} ignored — not tracked by planner)` : ''}.`);
      setStatusType('success');
    } catch {
      setImportStatus('Failed to parse file. Make sure it is a valid JSON file from WuWa Inventory Kamera.');
      setStatusType('error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    const entries = Object.entries(currentInventory).filter(([, v]) => v > 0);
    if (entries.length === 0) return;

    const blob = new Blob([JSON.stringify(currentInventory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matcalc-inventory.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFullStateExport = () => {
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matcalc-planner-state.json';
    a.click();
    URL.revokeObjectURL(url);
    setImportStatus('Full planner state exported.');
    setStatusType('success');
  };

  const handleFullStateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data || typeof data !== 'object' || Array.isArray(data) || plannerStateKeys.every(k => !(k in data))) {
        setImportStatus('No recognized planner state found. Make sure this is a matcalc-planner-state.json file exported from this app.');
        setStatusType('error');
        if (stateFileInputRef.current) stateFileInputRef.current.value = '';
        return;
      }

      onImportFullState(data as PlannerState);
      setImportStatus('Full planner state imported.');
      setStatusType('success');
    } catch {
      setImportStatus('Failed to parse file. Make sure it is a valid matcalc-planner-state.json file exported from this app.');
      setStatusType('error');
    } finally {
      if (stateFileInputRef.current) stateFileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
          id="inventory-upload"
        />
        <label
          htmlFor="inventory-upload"
          className="text-sm bg-gray-700 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer inline-block"
        >
          Import from WuWa Inventory Kamera
        </label>
        <button
          onClick={handleExport}
          className="text-sm bg-gray-700 hover:bg-cyan-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
        >
          Export Inventory
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={stateFileInputRef}
          type="file"
          accept=".json"
          onChange={handleFullStateUpload}
          className="hidden"
          id="planner-state-upload"
        />
        <label
          htmlFor="planner-state-upload"
          className="text-sm bg-gray-700 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer inline-block"
        >
          Import Full State
        </label>
        <button
          onClick={handleFullStateExport}
          className="text-sm bg-gray-700 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
        >
          Export Full State
        </button>
      </div>
      {importStatus && statusType === 'success' && (
        <div className="flex flex-col items-center w-full max-w-xs">
          <p className={`text-sm ${statusType === 'success' ? 'text-green-400' : 'text-red-400'} text-center max-w-md`}>
            {importStatus}
          </p>
          {displayItems.filter(i => !i.isPlannerMaterial).length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-gray-500 hover:text-gray-300 underline mt-1"
            >
              {showDetails ? 'Hide' : 'Show'} ignored items ({displayItems.filter(i => !i.isPlannerMaterial).length})
            </button>
          )}
          {showDetails && (
            <div className="mt-1 w-full max-h-56 overflow-y-auto border border-gray-700 rounded-lg bg-gray-900">
              {displayItems.filter(i => !i.isPlannerMaterial).map(item => {
                const mat = allMaterials.find(m => m.name === item.name);
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-gray-700 last:border-b-0 text-gray-500">
                    <div className="flex items-center gap-2 min-w-0">
                      {mat ? (
                        <Icon src={mat.icon} alt={item.name} className="w-6 h-6 shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-500 shrink-0">?</div>
                      )}
                      <span className="text-xs truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold shrink-0">x{item.qty}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {importStatus && statusType === 'error' && (
        <p className="text-sm text-red-400 text-center max-w-md">{importStatus}</p>
      )}
      <p className="text-xs text-gray-500 text-center max-w-md">
        Use{' '}
        <a href={wuwaInventoryKameraUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
          WuWa Inventory Kamera
        </a>
        {' '}to scan your game (fullscreen, 1920x1080), then upload the generated inventory.json.
      </p>
    </div>
  );
};
