import { type Ref, ref } from 'vue';
import type { DeskWithContext } from '#vue-airport';

export interface TransferableItem {
  id: string;
  name: string;
  data?: Record<string, any>[];
}

export type UseTransferListReturn<T extends TransferableItem = TransferableItem> = {
  available: Ref<T[]>;
  transferred: Ref<T[]>;
  size: Ref<number>;
  transfer: (key: T['id']) => void;
  retrieve: (key: T['id']) => void;
  isTransferred: (key: T['id']) => boolean;
  getTransferableByKey: (key: T['id']) => T | undefined;
  dataForKey: (key: T['id']) => Record<string, any>[];
};

export const useTransferList = <T extends TransferableItem>(
  desk: DeskWithContext<T>,
  data: Record<string, any>[]
): UseTransferListReturn<T> => {
  {
    const available: Ref<T[]> = ref([]);
    const transferred: Ref<T[]> = ref([]);
    const uniqueKeys = Object.keys(data[0] ?? {});

    available.value = uniqueKeys.map((key) => ({
      id: key,
      name: key,
      // Gather all data entries for this key and remove the header
      data: data.map((d) => d[key as keyof typeof d]),
    })) as T[];

    for (const item of available.value) {
      // Check in the transferable items
      desk.checkIn(item.id, item);
    }

    const size = ref(0);

    const computeSize = () => {
      const transferredDataLengths = transferred.value.map((item) => item.data?.length || 0);
      size.value = Math.max(...transferredDataLengths, 0);
    };

    const transfer = (key: T['id']) => {
      const availableItem = available.value.find((i) => i.id === key);
      if (!availableItem) return;

      const itemIndex = available.value.indexOf(availableItem);
      if (itemIndex === -1) return;

      const [item] = available.value.splice(itemIndex, 1);
      transferred.value.push(item as T);

      computeSize();
    };

    const retrieve = (key: T['id']) => {
      const transferredItem = transferred.value.find((i) => i.id === key);
      if (!transferredItem) return;

      const itemIndex = transferred.value.indexOf(transferredItem);
      if (itemIndex === -1) return;

      const [item] = transferred.value.splice(itemIndex, 1);
      available.value.push(item as T);

      computeSize();
    };

    const isTransferred = (key: T['id']) => {
      return transferred.value.find((i) => i.id === key) !== undefined;
    };

    const getTransferableByKey = (key: T['id']) => {
      return (
        available.value.find((i) => i.id === key) || transferred.value.find((i) => i.id === key)
      );
    };

    const dataForKey = (key: T['id']) => {
      return (
        [...available.value, ...transferred.value].find((i) => i.id === key)?.data ||
        ([] as Record<string, any>[])
      );
    };

    return {
      available,
      transferred,
      size,
      transfer,
      retrieve,
      isTransferred,
      getTransferableByKey,
      dataForKey,
    };
  }
};
