import type { FeePayment, FeeReceipt } from "@/types";
import { fees } from "@/demo-data/fees/fees";
import { pick, randomInt, weightedPick } from "@/demo-data/generators/random";

const ACCOUNTANT_IDS = ["sf1", "sf2", "sf3"];

// Seed the payment/receipt history from the most recent paid fees so
// "Payment Records" and "Receipts" aren't empty before any staff member
// has recorded a live payment through the UI.
const recentPaidFees = fees
  .filter((f) => f.status === "paid")
  .sort((a, b) => b.due_date.localeCompare(a.due_date))
  .slice(0, 150);

export const feePayments: FeePayment[] = recentPaidFees.map((fee) => {
  const method = weightedPick([
    ["online", 4],
    ["cash", 3],
    ["card", 2],
    ["bank_transfer", 1],
  ] as const);
  return {
    id: `pay-${fee.id}`,
    fee_id: fee.id,
    student_id: fee.student_id,
    amount: fee.amount,
    method,
    payment_date: fee.paid_date ?? fee.due_date,
    recorded_by: pick(ACCOUNTANT_IDS),
    reference: method === "cash" ? undefined : `TXN-${randomInt(100000, 999999)}`,
  };
});

export const feeReceipts: FeeReceipt[] = feePayments.map((payment) => ({
  id: `rcp-${payment.fee_id}`,
  payment_id: payment.id,
  receipt_no: `RCP-${randomInt(100000, 999999)}`,
  student_id: payment.student_id,
  amount: payment.amount,
  issued_on: payment.payment_date,
}));
