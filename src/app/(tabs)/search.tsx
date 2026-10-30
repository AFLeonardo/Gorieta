import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FilterChips } from '@/components/filter-chips';
import { Screen } from '@/components/screen';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { StateView } from '@/components/ui/state-view';
import { TextField } from '@/components/ui/text-field';
import { VehicleShowcaseCard } from '@/components/vehicle-showcase-card';
import { Spacing } from '@/constants/theme';
import { VEHICLE_TYPES } from '@/constants/vehicle-types';
import { useAsync } from '@/hooks/use-async';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { useSavedVehicles } from '@/hooks/use-saved-vehicles';
import { useTheme } from '@/hooks/use-theme';
import { searchVehiclesByText } from '@/services/carvector';
import { toSnapshot } from '@/types/vehicle';

const ALL = 'all';

export default function SearchScreen() {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [yearText, setYearText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [type, setType] = useState(ALL);
  const [submitted, setSubmitted] = useState<{ text: string; year?: number } | null>(null);

  // Sin `submitted!.text`: el React Compiler leería la propiedad durante el render
  // (para comparar dependencias) y fallaría cuando `submitted` es null.
  const results = useAsync(
    async () => (submitted ? searchVehiclesByText(submitted.text, submitted.year) : undefined),
    [submitted],
    { enabled: submitted !== null }
  );
  const saved = useSavedVehicles();
  useRefreshOnFocus(saved.reload);

  function submit() {
    const year = Number.parseInt(yearText, 10);
    if (!text.trim() && Number.isNaN(year)) return;
    setSubmitted({ text: text.trim(), year: Number.isNaN(year) ? undefined : year });
  }

  const vehicles = results.data?.results ?? [];
  const selectedType = VEHICLE_TYPES.find((t) => t.key === type);
  const filtered = selectedType ? vehicles.filter(selectedType.matches) : vehicles;
  const hasResults = results.data !== undefined;

  const chips = [
    { key: ALL, label: 'Todos', count: hasResults ? vehicles.length : undefined },
    ...VEHICLE_TYPES.map((t) => ({
      key: t.key,
      label: t.label,
      count: hasResults ? vehicles.filter(t.matches).length : undefined,
    })),
  ];

  return (
    <Screen
      title="Búsqueda"
      headerRight={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filtros"
          accessibilityState={{ expanded: showFilters }}
          onPress={() => setShowFilters((s) => !s)}
          style={[
            styles.iconButton,
            { backgroundColor: showFilters ? theme.tint : theme.backgroundElement },
          ]}>
          <Icon
            name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
            size={22}
            color={showFilters ? theme.onTint : theme.text}
          />
        </Pressable>
      }>
      <View style={styles.controls}>
        <SearchBar
          placeholder="Busca autos… ej. Toyota Corolla 2020"
          value={text}
          onChangeText={setText}
          onSubmit={submit}
        />

        {showFilters && (
          <View style={styles.filters}>
            <View style={styles.yearField}>
              <TextField
                label="Año"
                placeholder="Cualquiera"
                value={yearText}
                onChangeText={setYearText}
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="search"
                onSubmitEditing={submit}
              />
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.filtersHint}>
              Escribe marca y modelo arriba; el año limita los resultados.
            </ThemedText>
          </View>
        )}

        <FilterChips chips={chips} selected={type} onSelect={setType} />
      </View>

      {!submitted ? (
        <StateView
          empty
          emptyText="Busca por marca y modelo, y filtra por tipo de auto: SUV, sedán, pickup, eléctrico…"
        />
      ) : results.loading ? (
        <StateView loading />
      ) : (
        <>
          <StateView
            error={results.error}
            onRetry={results.reload}
            empty={filtered.length === 0}
            emptyText={
              vehicles.length === 0
                ? 'No encontramos vehículos con esos datos.'
                : `Ningún resultado es de tipo ${selectedType?.label}.`
            }
          />
          {filtered.length > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              {filtered.length === vehicles.length
                ? `${vehicles.length} resultados`
                : `${filtered.length} de ${vehicles.length} resultados`}
            </ThemedText>
          )}
          {filtered.map((v) => (
            <VehicleShowcaseCard
              key={v.id}
              vehicle={v}
              saved={saved.isSaved(v.id)}
              saving={saved.pendingId === v.id}
              onToggleSave={() => saved.toggle(toSnapshot(v))}
            />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    gap: Spacing.three,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.three,
  },
  yearField: {
    width: 140,
  },
  filtersHint: {
    flex: 1,
    paddingBottom: Spacing.two,
  },
});
