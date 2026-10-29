import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CircleMember, FoodCircle, PantryItem } from '../types/models';
import { createId } from '../utils/format';
import { requireContext, useServices } from './ServicesContext';

interface CircleStore {
  circles: FoodCircle[];
  createCircle(name: string, owner: Omit<CircleMember, 'id'>): void;
  invite(email: string, circleId: string): Promise<void>;
  share(item: PantryItem, circleId: string): Promise<void>;
}

const CircleContext = createContext<CircleStore | null>(null);

export function CircleProvider({ children }: { children: ReactNode }) {
  const services = useServices();
  const [circles, setCircles] = useState<FoodCircle[]>([]);

  useEffect(() => {
    services.circles.fetchCircles().then(setCircles);
  }, [services]);

  const createCircle = useCallback((name: string, owner: Omit<CircleMember, 'id'>) => {
    // TODO(backend): create circle server-side.
    setCircles((prev) => [...prev, { id: createId(), name, members: [{ ...owner, id: createId() }], sharedItems: [] }]);
  }, []);

  const invite = useCallback((email: string, circleId: string) => services.circles.invite(email, circleId), [services]);

  const share = useCallback(
    async (item: PantryItem, circleId: string) => {
      await services.circles.share(item, circleId);
      setCircles((prev) =>
        prev.map((circle) =>
          circle.id === circleId
            ? { ...circle, sharedItems: [...circle.sharedItems, { ...item, sharedCircleId: circleId }] }
            : circle,
        ),
      );
    },
    [services],
  );

  const value = useMemo(() => ({ circles, createCircle, invite, share }), [circles, createCircle, invite, share]);
  return <CircleContext.Provider value={value}>{children}</CircleContext.Provider>;
}

export const useCircles = () => requireContext(useContext(CircleContext), 'useCircles');
