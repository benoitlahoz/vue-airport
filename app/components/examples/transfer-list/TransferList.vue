<script setup lang="ts">
import { useCheckIn } from 'vue-airport';
import { createActiveItemPlugin } from '@vue-airport/plugins-base';
import { useTransferList, type TransferableItem } from './useTransferList';
import { useCsv } from './useCsv';
import { CsvFile } from './fixtures';
import { type TransferListContext, TransferListKey, Transferable } from '.';

import { Separator } from '@/components/ui/separator';

const { fromCsv } = useCsv();
const { rows } = fromCsv(CsvFile, true, ',');

const plugins = [createActiveItemPlugin<TransferableItem>()];

const { createDesk } = useCheckIn<TransferableItem, TransferListContext>();
const { desk } = createDesk(TransferListKey, {
  devTools: true,
  debug: false,
  plugins,
});
const ctx = desk.setContext(useTransferList<TransferableItem>(desk, rows));

const available = computed(() => ctx?.available.value || []);
const transferred = computed(() => ctx?.transferred.value || []);
const size = computed(() => ctx?.size.value || 0);
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex gap-2 h-64 min-h-64">
      <div class="flex-1 flex flex-col p-2 border border-border rounded-md gap-1">
        <Transferable v-for="item in available" :id="item.id" :key="item.id" />
      </div>
      <div class="flex-1 flex flex-col p-2 border border-border rounded-md gap-1">
        <Transferable v-for="item in transferred" :id="item.id" :key="item.id" />
      </div>
    </div>
    <Separator />
    <div class="text-lg font-bold">Available Transformations</div>
    <Separator />
    <div class="w-full border border-border rounded-md">
      <table class="w-full border-collapse table-fixed">
        <thead class="sticky top-0">
          <tr>
            <th v-for="item in transferred" :key="item.id" class="font-bold uppercase p-2 border-b">
              {{ item.name }}
            </th>
          </tr>
        </thead>
      </table>
      <div class="max-h-128 overflow-auto">
        <table class="w-full border-collapse table-fixed">
          <tbody>
            <tr v-for="(rowIndex, idx) in size" :key="`row-${String(idx)}`">
              <td
                v-for="item in transferred"
                :key="`row-${rowIndex}-col-${item.id}`"
                class="p-2 border-b text-center"
              >
                {{ item.data?.[rowIndex] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
