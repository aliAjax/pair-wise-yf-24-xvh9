<script setup lang="ts">
import { computed } from "vue";
import type { GateBlocker } from "../../stores/ReleaseGateStore";
import { formatGateDecision } from "../../utils/formatters";
import type { GateItem } from "../../stores/ReleaseGateStore";

const props = defineProps<{
  items: GateItem[];
  blockers: GateBlocker[];
}>();

const stats = computed(() => ({
  pending: props.items.filter((i) => i.decision === "PENDING").length,
  approved: props.items.filter((i) => i.decision === "APPROVED").length,
  changes: props.items.filter((i) => i.decision === "NEEDS_CHANGES").length,
  exceptions: props.items.filter((i) => i.decision === "EXCEPTION").length
}));

const rows = [
  { key: "PENDING", count: computed(() => stats.value.pending) },
  { key: "APPROVED", count: computed(() => stats.value.approved) },
  { key: "NEEDS_CHANGES", count: computed(() => stats.value.changes) },
  { key: "EXCEPTION", count: computed(() => stats.value.exceptions) }
];
</script>
<template>
  <div class="checklist">
    <h3>审阅结论汇总</h3>
    <ul class="checklist-stats">
      <li v-for="row in rows" :key="row.key" :class="`decision-${row.key.toLowerCase()}`">
        <span>{{ formatGateDecision(row.key) }}</span><strong>{{ row.count.value }}</strong>
      </li>
    </ul>
    <h3>放行条件</h3>
    <ul class="checklist-blockers">
      <li v-if="blockers.length === 0" class="ok">✓ 高风险项均有结论，且没有待修改项，门禁已放行</li>
      <li v-for="(blocker, index) in blockers" :key="index" class="block">✗ {{ blocker.message }}</li>
    </ul>
  </div>
</template>
