import { get, set } from 'idb-keyval';

const SLIP_STORAGE_KEY = 'opd_saathi_active_slip';
const GRAPH_STORAGE_KEY = 'opd_saathi_cached_graph';
const SYNC_TIMESTAMP_KEY = 'opd_saathi_last_sync';

export async function saveActiveSlipOffline(slip) {
  try {
    const serialized = JSON.stringify(slip);
    localStorage.setItem(SLIP_STORAGE_KEY, serialized);
    await set(SLIP_STORAGE_KEY, slip);
    localStorage.setItem(SYNC_TIMESTAMP_KEY, new Date().toISOString());
  } catch (err) {
    console.warn('[OfflineStore] Failed saving to IndexedDB, fallback to localStorage:', err);
  }
}

export async function getActiveSlipOffline() {
  try {
    const idbSlip = await get(SLIP_STORAGE_KEY);
    if (idbSlip) return idbSlip;
  } catch {
    // fallback
  }

  const localSlip = localStorage.getItem(SLIP_STORAGE_KEY);
  if (localSlip) {
    try {
      return JSON.parse(localSlip);
    } catch {
      return null;
    }
  }
  return null;
}

export async function saveGraphOffline(graph) {
  try {
    localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(graph));
    await set(GRAPH_STORAGE_KEY, graph);
  } catch (err) {
    console.warn('[OfflineStore] Error saving graph:', err);
  }
}

export async function getGraphOffline() {
  try {
    const idbGraph = await get(GRAPH_STORAGE_KEY);
    if (idbGraph) return idbGraph;
  } catch {
    // fallback
  }

  const localGraph = localStorage.getItem(GRAPH_STORAGE_KEY);
  if (localGraph) {
    try {
      return JSON.parse(localGraph);
    } catch {
      return null;
    }
  }
  return null;
}

export function getLastSyncTime() {
  return localStorage.getItem(SYNC_TIMESTAMP_KEY) || 'Never';
}
