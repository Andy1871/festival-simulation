import { useMemo } from 'react';
import { runSimulation } from '../calculations/runSimulation';
import type { FestivalConfig } from '../types';
import type { MetricsSnapshot } from '../calculations/types';

export function useSimulation(config: FestivalConfig): MetricsSnapshot {
    return useMemo(() => runSimulation(config), [config]);
}
