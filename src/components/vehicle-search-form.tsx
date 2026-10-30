import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import type { VehicleQuery } from '@/services/carvector';

type VehicleSearchFormProps = {
  onSearch: (query: VehicleQuery) => void;
  loading?: boolean;
};

export function VehicleSearchForm({ onSearch, loading }: VehicleSearchFormProps) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');

  const canSearch = make.trim().length > 0 || model.trim().length > 0;

  function submit() {
    if (!canSearch) return;
    const parsedYear = Number.parseInt(year, 10);
    onSearch({
      make: make.trim() || undefined,
      model: model.trim() || undefined,
      year: Number.isNaN(parsedYear) ? undefined : parsedYear,
    });
  }

  return (
    <View style={styles.form}>
      <TextField
        label="Marca"
        placeholder="Ej. Toyota"
        value={make}
        onChangeText={setMake}
        autoCapitalize="words"
        returnKeyType="search"
        onSubmitEditing={submit}
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField
            label="Modelo"
            placeholder="Ej. Corolla"
            value={model}
            onChangeText={setModel}
            autoCapitalize="words"
            returnKeyType="search"
            onSubmitEditing={submit}
          />
        </View>
        <View style={styles.year}>
          <TextField
            label="Año"
            placeholder="2020"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="search"
            onSubmitEditing={submit}
          />
        </View>
      </View>
      <Button title="Buscar" onPress={submit} disabled={!canSearch} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  year: {
    width: 100,
  },
});
