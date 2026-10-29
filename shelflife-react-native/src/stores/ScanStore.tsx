import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Receipt } from '../types/models';
import { requireContext } from './ServicesContext';

/** Holds the parsed receipt between the Scan tab and the review screen. */
interface ScanStore {
  draft: Receipt | null;
  setDraft(receipt: Receipt | null): void;
}

const ScanContext = createContext<ScanStore | null>(null);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Receipt | null>(null);
  const value = useMemo(() => ({ draft, setDraft }), [draft]);
  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export const useScanDraft = () => requireContext(useContext(ScanContext), 'useScanDraft');
