<script setup lang="ts">
import { useCheckIn } from '#vue-airport';
import { cn } from '@/lib/utils';
import { type TransferListContext, type TransferListDesk, TransferListKey } from '.';
import { Button } from '@/components/ui/button';
import type { TransferableItem } from './useTransferList';

const props = defineProps<{ id: string }>();

const { checkIn } = useCheckIn<TransferableItem, TransferListContext>();
const { desk } = checkIn(TransferListKey);
const deskWithPlugins = desk as typeof desk & TransferListDesk;
const ctx = desk?.getContext<TransferListContext>();

const item = computed(() => {
  const item = ctx?.getTransferableByKey(props.id) || null;
  return item;
});

const isTransferred = computed(() => ctx?.isTransferred(props.id) || false);

const isActive = computed(() => {
  return deskWithPlugins.activeId.value === props.id;
});

const setActive = () => {
  deskWithPlugins.setActive(props.id);
};
</script>

<template>
  <div
    data-slot="transferable-item"
    :class="
      cn(
        'p-2 border border-border rounded-md flex items-center justify-between select-none hover:bg-accent hover:text-accent-foreground group',
        isTransferred ? 'pr-4' : 'pl-4',
        isActive ? 'bg-accent text-accent-foreground' : ''
      )
    "
    @click="setActive"
  >
    <template v-if="isTransferred">
      <Button
        size="icon"
        variant="ghost"
        class="md:invisible md:group-hover:visible"
        @click="ctx?.retrieve(props.id)"
      >
        <UIcon name="lucide:arrow-left" class="hidden md:block" />
        <UIcon name="lucide:arrow-up" class="md:hidden" />
      </Button>
      <div class="flex items-center gap-1">
        <Button size="icon" variant="ghost" class="text-destructive/80 hover:text-destructive">
          <UIcon name="i-tabler:transform" />
        </Button>
        <div class="font-bold uppercase">{{ item?.name }}</div>
      </div>
    </template>
    <template v-else>
      <div class="font-bold uppercase">{{ item?.name }}</div>
      <Button
        size="icon"
        variant="ghost"
        class="md:invisible md:group-hover:visible"
        @click="ctx?.transfer(props.id)"
      >
        <UIcon name="lucide:arrow-right" class="hidden md:block" />
        <UIcon name="lucide:arrow-down" class="md:hidden" />
      </Button>
    </template>
  </div>
</template>
