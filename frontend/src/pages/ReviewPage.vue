<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { useGateReviewStore, type DecidePatch } from "../stores/GateReviewStore";
import { useReleaseSnapshotStore } from "../stores/ReleaseSnapshotStore";
import { useReleaseGate } from "../hooks/useReleaseGate";
import { formatDate } from "../utils/formatters";
import ReviewChecklist from "../components/common/ReviewChecklist.vue";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import EmptyState from "../components/common/EmptyState.vue";

const documentStore = usePolicyDocumentStore();
const gateStore = useGateReviewStore();
const snapshotStore = useReleaseSnapshotStore();
const { candidate } = storeToRefs(documentStore);
const { active, status } = useReleaseGate();

const error = ref("");
const message = ref("");
const releasedSnapshotId = ref<number | null>(null);

const released = computed(() => (candidate.value ? snapshotStore.isReleased(candidate.value.id) : false));

async function onDecide(id: number, patch: DecidePatch) {
  error.value = "";
  message.value = "";
  try {
    await gateStore.decide(id, patch);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
}

async function onReset(id: number) {
  error.value = "";
  await gateStore.resetDecision(id);
}

async function onRelease() {
  error.value = "";
  message.value = "";
  if (!candidate.value) return;
  const reviewer = localStorage.getItem("policy-diff:reviewer") ?? "";
  try {
    const snapshot = await snapshotStore.release(candidate.value, reviewer || "未署名");
    releasedSnapshotId.value = snapshot.id;
    message.value = `发布成功：${snapshot.version_label} 的只读快照已生成（发布时间 ${formatDate(snapshot.released_at)}），可到「发布快照」页查看。`;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
}
</script>

<template>
  <section class="stack">
    <div class="panel gate-panel">
      <div class="gate-head">
        <div>
          <h2>发布门禁 · {{ candidate?.version_label ?? "无候选版本" }}</h2>
          <p class="hint">规则：高风险条款必须全部有结论，且不能存在「需修改」项；例外必须填写理由和未过期的到期时间。</p>
        </div>
        <StatusBadge v-if="released" value="已发布 · 清单已锁定" />
        <StatusBadge v-else-if="status.canRelease" value="门禁已通过" />
        <StatusBadge v-else value="门禁拦截中" />
      </div>

      <div class="metrics five">
        <StatCard label="条款总数" :value="status.total" />
        <StatCard label="待办" :value="status.pending" />
        <StatCard label="通过" :value="status.approved" />
        <StatCard label="需修改" :value="status.needsChanges" />
        <StatCard label="接受例外" :value="status.exception" />
      </div>

      <ul v-if="status.blockers.length > 0" class="blocker-list">
        <li v-for="blocker in status.blockers" :key="blocker">⛔ {{ blocker }}</li>
      </ul>
      <p v-else-if="status.total > 0 && !released" class="notice ok">✅ 门禁条件已满足，可以执行发布。</p>
      <p v-if="status.pending > 0 && status.highRiskPending.length === 0" class="hint">
        提示：还有 {{ status.pending }} 个低风险条款未结论，不阻塞发布，但建议完成审阅。
      </p>

      <div class="gate-actions">
        <button
          class="primary release"
          :disabled="!status.canRelease || released"
          @click="onRelease"
        >
          {{ released ? "已发布" : "执行发布并生成只读快照" }}
        </button>
        <span v-if="status.inherited > 0" class="hint">{{ status.inherited }} 条结论沿用自上一轮</span>
      </div>
      <p v-if="message" class="notice ok">{{ message }}</p>
      <p v-if="error" class="notice error">{{ error }}</p>
    </div>

    <div class="panel">
      <h2>审阅清单（第 {{ gateStore.currentRound }} 轮）</h2>
      <ReviewChecklist
        v-if="active.length > 0"
        :rows="active"
        :released="released"
        @decide="onDecide"
        @reset="onReset"
      />
      <EmptyState v-else message="还没有门禁清单：请先在「文档导入」导入至少两个版本" />
    </div>
  </section>
</template>
