<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { DESK_CONSTRAINTS_KEY } from './index';
import { useCheckIn } from 'vue-airport';
import { Badge } from '@/components/ui/badge';

interface Member {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

const props = defineProps<{ member: Member }>();
const error = ref<string | null>(null);
const { checkIn } = useCheckIn<Member>();

onMounted(() => {
  try {
    checkIn(DESK_CONSTRAINTS_KEY, {
      id: props.member.id,
      data: props.member,
      autoCheckIn: true,
    });
  } catch (e: any) {
    error.value = e.message;
  }
});
</script>

<template>
  <div>
    <Badge>{{ member.name }}</Badge>
    <span>({{ member.role }})</span>
    <span v-if="error" class="text-red-500 ml-2">{{ error }}</span>
  </div>
</template>
