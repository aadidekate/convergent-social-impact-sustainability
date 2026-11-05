import { createContext, useContext, type ReactNode } from 'react';
import { mockServices, type Services } from '../services';

const ServicesContext = createContext<Services>(mockServices);

export function ServicesProvider({ services = mockServices, children }: { services?: Services; children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export const useServices = () => useContext(ServicesContext);

export function requireContext<T>(value: T | null, name: string): T {
  if (!value) throw new Error(`${name} must be used inside AppProviders`);
  return value;
}
