<script setup lang="ts">
import { Badge } from '@/components/ui/badge';

interface Member {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

const props = defineProps<{ member: Member }>();
</script>

<template>
  <div>
    <Badge>{{ member.name }}</Badge>
    <span>({{ member.role }})</span>
  </div>
</template>
