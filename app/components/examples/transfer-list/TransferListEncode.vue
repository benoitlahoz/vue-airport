<script setup lang="ts">
import { useCsv } from './useCsv';
import { CsvFile } from './fixtures';
import { DesksProvider, TransferList, DataEncoder, DataTable } from '.';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const { fromCsv, toCsv, downloadCsv } = useCsv();
const { rows } = fromCsv(CsvFile, true, ',');
</script>

<template>
  <div>
    <DesksProvider :data="rows">
      <TransferList />
      <DataEncoder />
      <Accordion>
        <DataTable />
      </Accordion>
    </DesksProvider>
  </div>
</template>
