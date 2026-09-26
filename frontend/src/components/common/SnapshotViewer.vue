<script setup lang="ts">
import { computed } from "vue";
import type { ReleaseSnapshot } from "../../types/ReleaseSnapshot";
import { formatDate, formatDecision, formatDiffType, formatRisk } from "../../utils/formatters";

interface SnapshotClause {
  section_no: string;
  heading: string;
  diff_type: string;
  risk_level: string;
  decision: string;
  reviewer: string;
  decided_at: string;
  exception_reason: string;
  exception_expires_at: string;
}

interface SnapshotPayload {
  version_label: string;
  title: string;
  released_at: string;
  released_by: string;
  round: number;
  stats: { total: number; approved: number; exception: number; inherited: number; high_risk: number };
  exceptions: Array<{ section_no: string; heading: string; risk_level: string; reason: string; expires_at: string; reviewer: string }>;
  clauses: SnapshotClause[];
}

const props = defineProps<{ snapshot: ReleaseSnapshot }>();
const payload = computed<SnapshotPayload>(() => JSON.parse(props.snapshot.payload) as SnapshotPayload);
</script>

<template>
  <div class="snapshot-viewer readonly">
    <header class="snapshot-head">
      <div>
        <p class="eyebrow">只读快照 · 第 {{ payload.round }} 轮</p>
        <h3>{{ payload.title }} {{ payload.version_label }}</h3>
      </div>
      <span class="badge locked">已锁定</span>
    </header>
    <dl class="snapshot-meta">
      <div><dt>发布时间</dt><dd>{{ formatDate(payload.released_at) }}</dd></div>
      <div><dt>发布人</dt><dd>{{ payload.released_by || "-" }}</dd></div>
      <div><dt>条款总数</dt><dd>{{ payload.stats.total }}</dd></div>
      <div><dt>高风险条款</dt><dd>{{ payload.stats.high_risk }}</dd></div>
      <div><dt>通过</dt><dd>{{ payload.stats.approved }}</dd></div>
      <div><dt>例外</dt><dd>{{ payload.stats.exception }}</dd></div>
      <div><dt>沿用上一轮</dt><dd>{{ payload.stats.inherited }}</dd></div>
    </dl>

    <section v-if="payload.exceptions.length > 0" class="snapshot-exceptions">
      <h4>例外说明</h4>
      <article v-for="item in payload.exceptions" :key="item.section_no" class="exception-card">
        <header>
          <strong>{{ item.section_no }} {{ item.heading }}</strong>
          <span class="badge" :class="`risk-${item.risk_level.toLowerCase()}`">{{ formatRisk(item.risk_level) }}风险</span>
        </header>
        <p>理由：{{ item.reason }}</p>
        <p>到期时间：{{ formatDate(item.expires_at) }} ｜ 审阅人：{{ item.reviewer || "-" }}</p>
      </article>
    </section>

    <section>
      <h4>逐条结论</h4>
      <table class="snapshot-table">
        <thead>
          <tr><th>条款</th><th>标题</th><th>差异</th><th>风险</th><th>结论</th><th>审阅人</th></tr>
        </thead>
        <tbody>
          <tr v-for="clause in payload.clauses" :key="clause.section_no">
            <td>{{ clause.section_no }}</td>
            <td>{{ clause.heading }}</td>
            <td>{{ formatDiffType(clause.diff_type) }}</td>
            <td>{{ formatRisk(clause.risk_level) }}</td>
            <td>{{ formatDecision(clause.decision) }}</td>
            <td>{{ clause.reviewer || "-" }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
