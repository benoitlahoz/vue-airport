<script setup lang="ts">
import { useCsv } from './useCsv';
import { CsvFile } from './fixtures';
import { DesksProvider, TransferList } from '.';

const { fromCsv, toCsv, downloadCsv } = useCsv();
const { rows } = fromCsv(CsvFile, true, ',');
</script>

<template>
  <div>
    <DesksProvider :data="rows">
      <TransferList />
    </DesksProvider>
  </div>
</template>
