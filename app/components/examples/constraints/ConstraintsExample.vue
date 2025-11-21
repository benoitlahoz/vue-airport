<script setup lang="ts">
import { ref } from 'vue';
import { useCheckIn, getRegistry } from 'vue-airport';
import { createConstraintsPlugin } from '@vue-airport/plugins-validation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberItem, DESK_CONSTRAINTS_KEY } from './index';

/**
 * Constraints Example - Desk usage
 *
 * Demonstrates:
 * - Desk pattern with plugins
 * - Uniqueness, max count, custom constraints
 * - Real-time error feedback
 */

interface Member {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

const constraints = [
  { type: 'unique', key: 'name', message: 'Name must be unique' },
  { type: 'maxCount', count: 5, message: 'Maximum 5 members allowed' },
  (member: Member, members: Member[]) =>
    member.role === 'admin' && members.filter((m) => m.role === 'admin').length >= 2
      ? 'Maximum 2 admins allowed'
      : null,
];

const initialMembers: Member[] = [
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' },
];

const newName = ref('');
const newRole = ref<'admin' | 'user'>('user');
const error = ref<string | null>(null);

// Desk pattern

const members = ref<Member[]>([...initialMembers]);
const { createDesk } = useCheckIn<Member>();
const { desk } = createDesk(DESK_CONSTRAINTS_KEY, {
  plugins: [createConstraintsPlugin<Member>(constraints)],
  context: { members },
  devTools: true,
  debug: false,
});

const registry = getRegistry<Member>(desk);

function addMember() {
  error.value = null;
  const id = Date.now();
  const member: Member = { id, name: newName.value.trim(), role: newRole.value };
  try {
    desk.checkIn(id, member);
    members.value.push(member);
    newName.value = '';
    newRole.value = 'user';
  } catch (e: any) {
    error.value = e.message;
  }
}

function removeMember(id: number) {
  desk.checkOut(id);
}
</script>

<template>
  <div class="constraints-example">
    <h2>Constraints Example (with Desk)</h2>
    <div class="mb-2">
      <input v-model="newName" placeholder="Name" />
      <select v-model="newRole">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <Button :disabled="!newName" @click="addMember">Add Member</Button>
    </div>
    <div v-if="error" class="error">
      <Badge color="red">{{ error }}</Badge>
    </div>
    <ul>
      <li v-for="item in registry" :key="item.id" class="flex items-center gap-2">
        <MemberItem :member="item.data" />
        <Button size="sm" variant="ghost" @click="removeMember(Number(item.id))">Remove</Button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.constraints-example {
  max-width: 400px;
  margin: 0 auto;
}
.error {
  margin-bottom: 1em;
}
</style>
