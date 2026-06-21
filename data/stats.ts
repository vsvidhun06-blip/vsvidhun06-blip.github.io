import type { Stat } from "@/types";

/**
 * Selected Impact figures. Values and wording are taken verbatim from the
 * résumé — do not alter the numbers or labels. `value`/`decimals`/`suffix`
 * drive the count-up animation in the Impact section.
 */
export const stats: Stat[] = [
  {
    id: "rope-speedup",
    value: 7.4,
    decimals: 1,
    suffix: "x",
    label: "RoPE speedup",
  },
  {
    id: "cost-reduction",
    value: 71.5,
    decimals: 1,
    suffix: "%",
    label: "cost reduction",
  },
  {
    id: "tests-passing",
    value: 166,
    label: "tests passing",
  },
  {
    id: "litmus-tests",
    value: 12324,
    label: "litmus tests",
  },
  {
    id: "leetcode",
    value: 153,
    label: "LeetCode problems solved",
  },
];
