import type { FeeStructureItem } from "@/types";
import { classes } from "@/demo-data/academics/classes";

export const feeStructureItems: FeeStructureItem[] = classes.flatMap((c, i) => [
  { id: `fs-${c.id}-tuition`, class_id: c.id, fee_type: "tuition", amount: 4500 + i * 150, frequency: "monthly" },
  { id: `fs-${c.id}-transport`, class_id: c.id, fee_type: "transport", amount: 2000, frequency: "monthly" },
  { id: `fs-${c.id}-library`, class_id: c.id, fee_type: "library", amount: 500, frequency: "annual" },
  { id: `fs-${c.id}-activity`, class_id: c.id, fee_type: "activity", amount: 1200, frequency: "quarterly" },
]);
