import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useGateReviewStore } from "../stores/GateReviewStore";
import { evaluateGate } from "../utils/gateRules";

// 汇总当前轮门禁清单，供发布门禁页驱动发布按钮与阻塞提示。
export function useReleaseGate() {
  const store = useGateReviewStore();
  const { rows } = storeToRefs(store);
  const active = computed(() => rows.value.filter((row) => !row.superseded));
  const status = computed(() => evaluateGate(active.value));
  return { active, status };
}
