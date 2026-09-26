<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { useReleaseGateStore, type GateItem } from "../stores/ReleaseGateStore";
import { GateDecisionType, GateDecisionTypeText } from "../constants/GateDecisionType";
import { formatDate, formatDateShort, formatDiffType, formatGateDecision, formatRisk } from "../utils/formatters";
import RiskTag from "../components/common/RiskTag.vue";
import ReviewChecklist from "../components/common/ReviewChecklist.vue";
import EmptyState from "../components/common/EmptyState.vue";
import type { ReleaseSnapshot } from "../types/ReleaseSnapshot";

const docStore = usePolicyDocumentStore();
const gate = useReleaseGateStore();
const { rows: documents, sections } = storeToRefs(docStore);
const { snapshots, decisionHistory, lastError } = storeToRefs(gate);

const oldId = ref<number>(0);
const newId = ref<number>(0);
const reviewer = ref("法务-王敏");
const releasedBy = ref("发布管理员");
const openSnapshotId = ref<number | null>(null);

const oldDoc = computed(() => documents.value.find((d) => d.id === oldId.value));
const newDoc = computed(() => documents.value.find((d) => d.id === newId.value));

const items = computed<GateItem[]>(() =>
  oldDoc.value && newDoc.value ? gate.buildGateItems(oldDoc.value, newDoc.value, sections.value) : []
);
const blockers = computed(() => gate.evaluate(items.value));
const canRelease = computed(() => blockers.value.length === 0 && items.value.length > 0);

const drafts = reactive<Record<string, { decision: string; reason: string; expires: string; reviewer: string }>>({});

const draftFor = (item: GateItem) => {
  if (!drafts[item.section_no]) {
    drafts[item.section_no] = {
      decision: item.decision,
      reason: item.exception_reason,
      expires: item.exception_expires_at ? item.exception_expires_at.slice(0, 10) : "",
      reviewer: item.reviewer || reviewer.value
    };
  }
  return drafts[item.section_no];
};

const saveDecision = async (item: GateItem) => {
  const draft = draftFor(item);
  await gate.decide({
    target_document_id: newDoc.value!.id,
    item,
    decision: draft.decision,
    reviewer: draft.reviewer,
    exception_reason: draft.reason,
    exception_expires_at: draft.expires ? new Date(`${draft.expires}T23:59:59`).toISOString() : ""
  });
};

const resetDraft = (item: GateItem) => {
  delete drafts[item.section_no];
};

const doRelease = async () => {
  if (!oldDoc.value || !newDoc.value) return;
  if (!window.confirm(`确认发布 ${newDoc.value.version_label}？发布后将生成只读快照。`)) return;
  await gate.release(oldDoc.value, newDoc.value, items.value, releasedBy.value);
};

const openSnapshot = computed<ReleaseSnapshot | undefined>(() =>
  snapshots.value.find((s) => s.id === openSnapshotId.value)
);

onMounted(async () => {
  await Promise.all([docStore.load(), gate.load()]);
  if (documents.value.length >= 2) {
    const sorted = [...documents.value].sort((a, b) => new Date(a.imported_at).getTime() - new Date(b.imported_at).getTime());
    oldId.value = sorted[0].id;
    newId.value = sorted[sorted.length - 1].id;
  }
});
</script>

<template>
  <div class="page-stack">
    <section class="panel">
      <h2>发布门禁 · 选择对比版本</h2>
      <div class="version-picker">
        <label>已发布旧版
          <select v-model.number="oldId"><option v-for="doc in documents" :key="`o-${doc.id}`" :value="doc.id">{{ doc.title }} {{ doc.version_label }}</option></select>
        </label>
        <label>待发布新版
          <select v-model.number="newId"><option v-for="doc in documents" :key="`n-${doc.id}`" :value="doc.id">{{ doc.title }} {{ doc.version_label }}</option></select>
        </label>
        <label>当前审阅人
          <input v-model="reviewer" placeholder="姓名或工号" />
        </label>
      </div>
      <p class="hint">未变条款自动沿用上次结论（标记“沿用”）；正文发生变化的条款回到“待审阅”；结论历史追加保存，不覆盖旧记录。</p>
    </section>

    <div class="gate-grid" v-if="items.length > 0">
      <section class="panel clause-panel">
        <h2>条款结论清单</h2>
        <table class="data-table">
          <thead>
            <tr><th>条款</th><th>差异 / 风险</th><th>审阅结论</th><th>例外理由与到期</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.section_no" :class="{ 'row-blocked': item.decision === 'NEEDS_CHANGES' || item.exception_expired }">
              <td class="nowrap">
                <strong>第{{ item.section_no }}条</strong>
                <p class="muted">{{ item.heading }}</p>
                <span v-if="item.carried_over" class="badge badge-carried">沿用原结论</span>
                <span v-if="item.exception_expired" class="badge badge-expired">例外已到期</span>
              </td>
              <td>
                <span :class="`diff-type diff-${item.diff_type.toLowerCase()}`">{{ formatDiffType(item.diff_type) }}</span>
                <RiskTag :level="item.risk_level" plain />
                <p class="muted">{{ item.category }}</p>
              </td>
              <td>
                <select v-model="draftFor(item).decision">
                  <option v-for="type in GateDecisionType" :key="type" :value="type">{{ GateDecisionTypeText[type] }}</option>
                </select>
                <input v-model="draftFor(item).reviewer" placeholder="审阅人" class="reviewer-input" />
                <p v-if="item.decided_at" class="muted">{{ item.decision !== draftFor(item).decision ? "未保存" : `已于 ${formatDate(item.decided_at)} 结论` }}</p>
              </td>
              <td>
                <template v-if="draftFor(item).decision === 'EXCEPTION'">
                  <textarea v-model="draftFor(item).reason" rows="2" placeholder="接受例外的理由（必填）"></textarea>
                  <input v-model="draftFor(item).expires" type="date" />
                </template>
                <p v-else-if="item.exception_reason" class="muted exception-cell">{{ item.exception_reason }}（到期：{{ formatDateShort(item.exception_expires_at) }}）</p>
                <span v-else class="muted">—</span>
              </td>
              <td><button type="button" class="primary small" @click="saveDecision(item); resetDraft(item)">保存结论</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <aside class="gate-side">
        <section class="panel">
          <ReviewChecklist :items="items" :blockers="blockers" />
        </section>
        <section class="panel release-panel">
          <h2>执行发布</h2>
          <label>发布操作人<input v-model="releasedBy" /></label>
          <button type="button" class="primary block-btn" :disabled="!canRelease" @click="doRelease">
            发布 {{ newDoc?.version_label }}
          </button>
          <p v-if="!canRelease" class="error-text">门禁未放行，请先处理左侧阻塞项。</p>
          <p v-if="lastError" class="error-text">{{ lastError }}</p>
        </section>
      </aside>
    </div>

    <section class="panel" v-else>
      <EmptyState text="请先在「文档导入」准备两个版本，再回到此页面进行发布门禁审阅" />
    </section>

    <section class="panel">
      <h2>只读发布快照</h2>
      <EmptyState v-if="snapshots.length === 0" text="尚未执行过发布；满足门禁条件后可生成首个快照" />
      <article v-for="snapshot in snapshots" :key="snapshot.id" class="snapshot-row">
        <div @click="openSnapshotId = openSnapshotId === snapshot.id ? null : snapshot.id" class="snapshot-head">
          <strong>{{ snapshot.version_label }}</strong>
          <span class="badge">只读</span>
          <span class="muted">发布时间：{{ formatDate(snapshot.released_at) }} · 操作人：{{ snapshot.released_by }}</span>
          <span class="muted">新增 {{ snapshot.added }} / 移除 {{ snapshot.removed }} / 改写 {{ snapshot.modified }} / 未变 {{ snapshot.unchanged }} · 高风险 {{ snapshot.high_risk }} · 例外 {{ snapshot.exception_count }}</span>
          <button type="button" class="link-btn">{{ openSnapshotId === snapshot.id ? "收起" : "查看" }}</button>
        </div>
        <div v-if="openSnapshotId === snapshot.id" class="snapshot-detail">
          <pre v-if="snapshot.exception_notes" class="exception-notes">{{ snapshot.exception_notes }}</pre>
          <p v-else class="muted">本次发布无接受例外项。</p>
          <table class="data-table compact">
            <thead><tr><th>条款</th><th>差异</th><th>风险</th><th>结论</th><th>审阅人</th><th>来源</th></tr></thead>
            <tbody>
              <tr v-for="snapItem in snapshot.items" :key="snapItem.section_no">
                <td>第{{ snapItem.section_no }}条 {{ snapItem.heading }}</td>
                <td>{{ formatDiffType(snapItem.diff_type) }}</td>
                <td>{{ formatRisk(snapItem.risk_level) }}</td>
                <td :class="`decision-${snapItem.decision.toLowerCase()}`">{{ formatGateDecision(snapItem.decision) }}</td>
                <td>{{ snapItem.reviewer }}</td>
                <td>{{ snapItem.carried_over ? "沿用" : "本轮" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <section class="panel">
      <h2>结论历史（旧记录保留）</h2>
      <EmptyState v-if="decisionHistory.length === 0" text="尚无审阅结论" />
      <ul v-else class="history-list">
        <li v-for="record in decisionHistory" :key="record.id">
          <span>{{ formatDate(record.decided_at) }}</span>
          <strong>第{{ record.section_no }}条</strong>
          <span :class="`decision-${record.decision.toLowerCase()}`">{{ formatGateDecision(record.decision) }}</span>
          <RiskTag :level="record.risk_level" plain />
          <span class="muted">{{ record.reviewer }} · 目标版本文档 #{{ record.target_document_id }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
