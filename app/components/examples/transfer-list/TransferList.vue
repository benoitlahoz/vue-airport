<script setup lang="ts">
import { ref } from 'vue';
import { useCheckIn } from 'vue-airport';
import { useTransferList, type TransferableItem } from './useTransferList';
import { type TransferListContext, TransferListKey, Transferable } from '.';
import { createTransformValuePlugin } from '@vue-airport/plugins-base';

import { Separator } from '@/components/ui/separator';

const MockCsv = `name,age,city\nAlice Martin,28,Paris\nJulien Dubois,34,Lyon\nSophie Bernard,25,Marseille\nLucas Lefevre,41,Toulouse\nEmma Moreau,22,Nice\nHugo Laurent,36,Nantes\nChloé Petit,29,Strasbourg\nLouis Robert,31,Montpellier\nCamille Richard,27,Bordeaux\nLéa Simon,33,Lille\nNathan Rousseau,24,Rennes\nManon Garcia,38,Reims\nArthur Michel,26,Le Havre\nSarah Faure,30,Saint-Étienne\nTom Girard,35,Toulon\nInès Mercier,23,Grenoble\nMathis Dupont,40,Dijon\nJade Lambert,32,Angers\nPaul Fournier,28,Nîmes\nClara Chevalier,37,Aix-en-Provence\nNoah Gauthier,25,Brest\nEva Masson,39,Limoges\nRaphaël Perrin,27,Tours\nAnaïs Blanchard,34,Amiens\nEnzo Guerin,29,Metz\nMélanie Marchand,31,Besançon\nThéo Barbier,26,Orléans\nLaura Roy,33,Clermont-Ferrand\nMaxime Lemoine,24,Valence\nJulie Caron,38,Quimper\nAntoine Colin,30,La Rochelle\nElise Renaud,35,Chambéry\nVictor Leclerc,22,Avignon\nLucie Muller,41,Caen\nGabriel Gaillard,28,Perpignan\nMarine Adam,36,Boulogne-sur-Mer\nAlexandre Noel,25,Poitiers\nMargaux Charles,39,Calais\nBaptiste Aubert,27,Annecy\nCharlotte Da Silva,32,Colmar\nRomain Marty,29,Beauvais\nAmandine Lefort,31,Brive-la-Gaillarde\nQuentin Pires,26,Albi\nCélia Dupuis,33,Carcassonne\nSimon Renard,24,Châteauroux\nOcéane Pascal,38,Montluçon\nDylan Millet,30,Arles\nMorgane Gueret,35,Sète\nFlorian Dufour,23,Ajaccio\nEstelle Cousin,40,Gap`;
const { rows } = ((csv: string) => {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = lines[0]!.split(',');
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',');
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i]!;
    });
    return obj;
  });
  return { rows };
})(MockCsv);

const transforms = ref({
  name: {
    fn: (value: string) => {
      const [firstname, lastname] = value.split(' ');
      return { firstname, lastname };
    },
  },
});

const plugins = [
  createTransformValuePlugin<TransferableItem>({
    name: transforms.value.name,
  }),
];

const { createDesk } = useCheckIn<TransferableItem, TransferListContext>();
const { desk } = createDesk(TransferListKey, {
  devTools: true,
  debug: false,
  plugins,
});
desk.setContext(useTransferList<TransferableItem, TransferListContext>(desk, rows));
const ctx = desk.getContext<TransferListContext>();

const available = computed(() => ctx?.available.value || []);
const transferred = computed(() => ctx?.transferred.value || []);
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div ref="mainContainer" class="flex gap-2 h-64 min-h-64">
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
            <th
              v-for="header in transferred"
              :key="header.id"
              class="font-bold uppercase p-2 border-b"
            >
              {{ header.name }}
            </th>
          </tr>
        </thead>
      </table>
      <div class="max-h-128 overflow-auto">
        <table class="w-full border-collapse table-fixed">
          <tbody>
            <tr v-for="row in ctx?.data" :key="row.id">
              <td
                v-for="header in transferred"
                :key="`row-${row.id}-col-${header.id}`"
                class="p-2 border-b text-center"
              >
                {{ row[header.name] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
