<script setup lang="ts">
import { useCheckIn } from '#vue-airport';
import { EncodedDataDeskKey, type TransferredDataItem } from '.';

const { checkIn: checkInEncodedDataDesk } = useCheckIn<TransferredDataItem>();
const { desk } = checkInEncodedDataDesk(EncodedDataDeskKey, {
  watchData: true,
});

// Get headers for encoded data table
const headers = computed(() => {
  const all = desk!.registryList.value || [];
  return all[0]
    ? Object.keys(all[0].data).map((key) => ({
        id: key,
        data: { name: key },
      }))
    : [];
});
const encoded = computed(() => desk!.registryList.value || []);
const size = computed(() => desk!.registryList.value.length || 0);
</script>

<template>
  <AccordionItem :disabled="size === 0" value="content">
    <AccordionTrigger class="hover:no-underline"
      >Transferred Content - {{ headers.length }} columns, {{ size }} rows</AccordionTrigger
    >
    <AccordionContent>
      <div class="w-full border border-border rounded-md">
        <table class="w-full border-collapse table-fixed">
          <thead class="sticky top-0">
            <tr>
              <th
                v-for="item in headers"
                :key="item.data.name"
                class="font-bold uppercase p-2 border-b"
              >
                {{ item.data.name }}
              </th>
            </tr>
          </thead>
        </table>
        <div class="max-h-64 md:max-h-128 overflow-auto">
          <table class="w-full border-collapse table-fixed">
            <tbody>
              <tr v-for="(item, idx) in encoded" :key="`row-${String(idx)}`">
                <td
                  v-for="key in Object.keys(item.data)"
                  :key="`row-${idx}-col-${key}`"
                  class="p-2 border-b text-center"
                >
                  {{ item.data?.[key] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</template>
