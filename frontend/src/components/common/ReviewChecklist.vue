<script setup lang="ts">
import { computed, reactive } from "vue";
import type { GateReview } from "../../types/GateReview";
import type { GateDecision } from "../../types/GateDecision";
import { effectiveDecision } from "../../utils/gateRules";
import { formatDiffType, formatDecision, formatDate } from "../../utils/formatters";
import DiffTypeBadge from "./DiffTypeBadge.vue";
import RiskTag from "./RiskTag.vue";
import EmptyState from "./EmptyState.vue";

const props = defineProps<{
  rows: GateReview[];
  readonly?: boolean;
  released?: boolean;
}>();

const emit = defineEmits<{
  decide: [id: number, patch: { decision: GateDecision; exception_reason: string; exception_expires_at: string; reviewer: string }];
  reset: [id: number];
}>();

const sorted = computed(() =>
  [...props.rows].sort((a, b) => a.section_no.localeCompare(b.section_no, "zh-CN", { numeric: true }))
);

// 每条结论的本地编辑草稿， keyed by GateReview.id。
const drafts = reactive(new Map<number, { decision: GateDecision; exception_reason: string; exception_expires_at: string; reviewer: string }>());

function draftOf(row: GateReview) {
  if (!drafts.has(row.id)) {
    drafts.set(row.id, {
      decision: row.decision as GateDecision,
      exception_reason: row.exception_reason,
      exception_expires_at: row.exception_expires_at,
      reviewer: row.reviewer
    });
  }
  return drafts.get(row.id)!;
}

function pick(row: GateReview, decision: GateDecision) {
  const draft = draftOf(row);
  draft.decision = decision;
  if (decision !== "EXCEPTION") {
    emit("decide", row.id, { ...draft });
  }
}

function submitException(row: GateReview) {
  const draft = draftOf(row);
  emit("decide", row.id, { ...draft });
}

function decisionClass(row: GateReview) {
  return `decision-${effectiveDecision(row).toLowerCase().replace(/_/g, "-")}`;
}
</script>

<template>
  <div class="review-checklist">
    <EmptyState v-if="sorted.length === 0" message="还没有门禁清单，请先导入至少两个版本" />
    <article v-for="row in sorted" :key="row.id" class="review-row" :class="decisionClass(row)">
      <header>
        <strong class="section-no">{{ row.section_no }}</strong>
        <span class="heading">{{ row.heading }}</span>
        <DiffTypeBadge :value="row.diff_type" />
        <RiskTag :level="row.risk_level" />
        <span class="badge" :class="`decision-badge ${decisionClass(row)}`">{{ formatDecision(effectiveDecision(row)) }}</span>
        <span v-if="row.inherited" class="badge inherited">沿用上一轮结论</span>
      </header>

      <details class="review-detail">
        <summary>查看条款正文（{{ formatDiffType(row.diff_type) }}）</summary>
        <div class="diff-body">
          <div class="diff-side old" v-if="row.old_content"><p class="side-label">上一版本</p><pre>{{ row.old_content }}</pre></div>
          <div class="diff-side new" v-if="row.new_content"><p class="side-label">当前版本</p><pre>{{ row.new_content }}</pre></div>
        </div>
      </details>

      <p v-if="row.decision !== 'PENDING' && row.reviewer" class="decided-meta">
        {{ row.reviewer }} 结论于 {{ formatDate(row.decided_at) }}
        <template v-if="row.decision === 'EXCEPTION'">
          ｜例外理由：{{ row.exception_reason }} ｜到期：{{ formatDate(row.exception_expires_at) }}
        </template>
      </p>

      <div v-if="!readonly && !released" class="decision-bar">
        <div class="decision-buttons">
          <button :class="{ active: draftOf(row).decision === 'APPROVED' }" @click="pick(row, 'APPROVED')">通过</button>
          <button :class="{ active: draftOf(row).decision === 'NEEDS_CHANGES' }" @click="pick(row, 'NEEDS_CHANGES')">需修改</button>
          <button :class="{ active: draftOf(row).decision === 'EXCEPTION' }" @click="pick(row, 'EXCEPTION')">接受例外</button>
          <button v-if="row.decision !== 'PENDING'" class="ghost" @click="emit('reset', row.id)">重置为待办</button>
        </div>
        <div v-if="draftOf(row).decision === 'EXCEPTION'" class="exception-form">
          <label>审阅人<input v-model="draftOf(row).reviewer" placeholder="姓名" /></label>
          <label>例外理由<textarea v-model="draftOf(row).exception_reason" rows="2" placeholder="为什么可以接受这个例外"></textarea></label>
          <label>例外到期时间<input v-model="draftOf(row).exception_expires_at" type="datetime-local" /></label>
          <button class="primary" @click="submitException(row)">确认例外</button>
        </div>
        <div v-else-if="draftOf(row).decision !== 'PENDING'" class="reviewer-inline">
          <label>审阅人<input v-model="draftOf(row).reviewer" placeholder="姓名" @change="submitException(row)" /></label>
        </div>
      </div>
    </article>
  </div>
</template>
