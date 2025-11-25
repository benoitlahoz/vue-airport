/**
 * This example creates a desk for a transfer list with optional transformation.
 * It demonstrates how to use a transfer list component with Vue Airport.
 */
import type { InjectionKey, Ref } from 'vue';
import type { DeskWithContext } from '#vue-airport';
import type { TransferableItem, UseTransferListReturn } from './useTransferList';
import type { ActiveItemPluginExports } from '@vue-airport/plugins-base/activeItem';

export type TransferListContext = UseTransferListReturn;

// What we want to transfer are headers.
export type TransferListDesk = DeskWithContext<TransferableItem, TransferListContext> &
  ActiveItemPluginExports<TransferableItem>;

// Definition of transferable header item
export interface TransferableHeader {
  id: string;
  name: string;
}

// The actual data item structure used in the transfer list
export interface TransferListDataItem {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Only base headers
export const AvailableDeskKey: InjectionKey<Ref<TransferableHeader>> = Symbol('AvailableDesk');
// Only transferred headers
export const TransferredDeskKey: InjectionKey<Ref<TransferableHeader>> = Symbol('TransferredDesk');
// Final data structure desk
export const EncodedDataDeskKey: InjectionKey<Ref<TransferListDataItem>> = Symbol('EncodedDesk');

export const TransferListKey: InjectionKey<Ref<TransferableItem> & TransferListContext> =
  Symbol('TransferList');

export { default as TransferDesksProvider } from './TransferDesksProvider.vue';
export { default as TransferList } from './TransferList.vue';
export { default as Transferable } from './Transferable.vue';
