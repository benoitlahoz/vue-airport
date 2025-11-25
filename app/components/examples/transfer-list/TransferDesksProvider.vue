<script setup lang="ts">
import { useCheckIn } from 'vue-airport';
import {
  type Transferable,
  type TransferListContext,
  AvailableDeskKey,
  TransferredDeskKey,
  EncodedDataDeskKey,
  type TransferableHeader,
} from './';

export type TransferDesksProviderProps = {
  data?: Record<string, any>[];
};

const props = withDefaults(defineProps<TransferDesksProviderProps>(), {
  data: () => [],
});

const headers = computed(() => {
  if (props.data && props.data[0]) {
    return Object.keys(props.data[0]).map((key) => ({
      id: key,
      name: key,
    }));
  }
  return [];
});

const { createDesk: createHeadersDesk } = useCheckIn<TransferableHeader>();
const { desk: availableHeadersDesk } = createHeadersDesk(AvailableDeskKey, {
  devTools: true,
  debug: false,
  onCheckOut(id, desk) {
    console.log('Available Headers Desk - onCheckOut', id, desk);
    const item = desk.get(id);
    if (item) {
      transferredHeadersDesk.checkIn(id, item.data);
    }
  },
});
const { desk: transferredHeadersDesk } = createHeadersDesk(TransferredDeskKey, {
  devTools: true,
  debug: false,
  onCheckOut(id, desk) {
    console.log('Transferred Headers Desk - onCheckOut', id, desk);
    const item = desk.get(id);
    if (item) {
      availableHeadersDesk.checkIn(id, item.data);
      encodedDataDesk.checkIn(id, props.data);
    }
  },
});

const { createDesk: createDataDesk } = useCheckIn<Transferable>();
const { desk: encodedDataDesk } = createDataDesk(EncodedDataDeskKey, {
  devTools: true,
  debug: false,
});

watch(
  () => headers.value,
  (newHeaders) => {
    availableHeadersDesk.clear();
    transferredHeadersDesk.clear();
    encodedDataDesk.clear();
    newHeaders.forEach((header) => {
      availableHeadersDesk.checkIn(header.id, header);
    });
  },
  { immediate: true }
);
</script>

<template>
  <slot />
</template>

<style scoped></style>
