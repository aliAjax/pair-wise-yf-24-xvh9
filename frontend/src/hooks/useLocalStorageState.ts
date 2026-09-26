import { ref, watch, type Ref } from "vue";

const PREFIX = "policy-diff:";

// 响应式状态与 localStorage 双向同步，页面刷新后保留。
export function useLocalStorageState<T>(key: string, initial: T): Ref<T> {
  let value = initial;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) value = JSON.parse(raw) as T;
  } catch {
    // 读取失败时退回默认值。
  }
  const state = ref(value) as Ref<T>;
  watch(
    state,
    (next) => {
      localStorage.setItem(PREFIX + key, JSON.stringify(next));
    },
    { deep: true }
  );
  return state;
}
