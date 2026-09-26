<script setup lang="ts">
import { computed, ref } from "vue";
import { useReleaseSnapshotStore } from "../stores/ReleaseSnapshotStore";
import { useGateReviewStore } from "../stores/GateReviewStore";
import { formatDate, formatDecision } from "../utils/formatters";
import SnapshotViewer from "../components/common/SnapshotViewer.vue";
import EmptyState from "../components/common/EmptyState.vue";
import DiffTypeBadge from "../components/common/DiffTypeBadge.vue";
import RiskTag from "../components/common/RiskTag.vue";

const snapshotStore = useReleaseSnapshotStore();
const gateStore = useGateReviewStore();

const selectedId = ref<number | null>(null);
const selected = computed(
  () => snapshotStore.rows.find((row) => row.id === selectedId.value) ?? snapshotStore.rows[snapshotStore.rows.length - 1]
);

// 旧轮次的结论记录按轮次分组展示，只读保留。
const archivedByRound = computed(() => {
  const groups = new Map<number, typeof gateStore.archivedRows>();
  for (const row of gateStore.archivedRows) {
    const list = groups.get(row.round) ?? [];
    list.push(row);
    groups.set(row.round, list);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]);
});
</script>

<template>
  <section class="stack">
    <div class="panel">
      <h2>发布快照</h2>
      <p class="hint">每次发布生成的只读快照，包含版本时间、风险与例外说明，不可编辑。</p>
      <EmptyState v-if="snapshotStore.rows.length === 0" message="还没有发布快照，请先在「发布门禁」完成审阅并执行发布" />
      <div v-else class="snapshot-list">
        <button
          v-for="snapshot in snapshotStore.rows"
          :key="snapshot.id"
          :class="{ active: selected?.id === snapshot.id }"
          @click="selectedId = snapshot.id"
        >
          {{ snapshot.title }} {{ snapshot.version_label }} · {{ formatDate(snapshot.released_at) }} · 例外 {{ snapshot.exception_total }}
        </button>
      </div>
    </div>

    <div class="panel" v-if="selected">
      <SnapshotViewer :snapshot="selected" />
    </div>

    <div class="panel">
      <h2>历史结论记录（旧记录保留）</h2>
      <EmptyState v-if="archivedByRound.length === 0" message="还没有历史结论记录，导入新版本后旧轮结论会保留在这里" />
      <div v-for="[round, rows] in archivedByRound" :key="round" class="archive-group">
        <h3>第 {{ round }} 轮（已被新一轮取代）</h3>
        <article v-for="row in rows" :key="row.id" class="archive-row">
          <strong class="section-no">{{ row.section_no }}</strong>
          <span class="heading">{{ row.heading }}</span>
          <DiffTypeBadge :value="row.diff_type" />
          <RiskTag :level="row.risk_level" />
          <span class="badge">{{ formatDecision(row.decision) }}</span>
          <span class="hint">
            {{ row.reviewer || "-" }} · {{ row.decided_at ? formatDate(row.decided_at) : "未结论" }}
            <template v-if="row.decision === 'EXCEPTION'">｜例外：{{ row.exception_reason }}（{{ formatDate(row.exception_expires_at) }} 到期）</template>
          </span>
        </article>
      </div>
    </div>
  </section>
</template>
