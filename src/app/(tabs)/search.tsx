import { useState } from 'react';

import { Screen } from '@/components/screen';
import { Section } from '@/components/section';
import { StateView } from '@/components/ui/state-view';
import { VehicleCard } from '@/components/vehicle-card';
import { VehicleSearchForm } from '@/components/vehicle-search-form';
import { useAsync } from '@/hooks/use-async';
import { searchVehicles, type VehicleQuery } from '@/services/carvector';
import { toSnapshot } from '@/types/vehicle';

export default function SearchScreen() {
  const [query, setQuery] = useState<VehicleQuery | null>(null);
  const results = useAsync(() => searchVehicles({ ...query, limit: 50 }), [query], {
    enabled: query !== null,
  });

  return (
    <Screen title="Búsqueda" subtitle="Encuentra un vehículo por marca, modelo y año.">
      <VehicleSearchForm onSearch={setQuery} loading={results.loading} />

      {query && (
        <Section title={results.data ? `${results.data.count} resultados` : 'Resultados'}>
          <StateView
            error={results.error}
            onRetry={results.reload}
            empty={results.data?.results.length === 0}
            emptyText="No encontramos vehículos con esos datos."
          />
          {results.data?.results.map((v) => (
            <VehicleCard key={v.id} vehicle={toSnapshot(v)} />
          ))}
        </Section>
      )}
    </Screen>
  );
}
