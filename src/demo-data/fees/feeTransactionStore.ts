import { fees } from "@/demo-data/fees/fees";
import { feePayments, feeReceipts } from "@/demo-data/fees/feePayments";
import type { Fee, FeePayment, FeeReceipt, PaymentMethod } from "@/types";

const FEE_STORAGE_KEY = "erp_staff_fees";
const PAYMENT_STORAGE_KEY = "erp_staff_fee_payments";
const RECEIPT_STORAGE_KEY = "erp_staff_fee_receipts";

function isFeeArray(value: unknown): value is Fee[] {
  return Array.isArray(value) && value.every((f) => f && typeof f === "object" && "id" in f && "student_id" in f && "status" in f);
}

function isPaymentArray(value: unknown): value is FeePayment[] {
  return Array.isArray(value) && value.every((f) => f && typeof f === "object" && "id" in f && "fee_id" in f);
}

function isReceiptArray(value: unknown): value is FeeReceipt[] {
  return Array.isArray(value) && value.every((f) => f && typeof f === "object" && "id" in f && "receipt_no" in f);
}

export function getStaffFees() {
  try {
    const raw = localStorage.getItem(FEE_STORAGE_KEY);
    if (!raw) return fees;
    const parsed: unknown = JSON.parse(raw);
    return isFeeArray(parsed) ? parsed : fees;
  } catch {
    return fees;
  }
}

export function saveStaffFees(rows: Fee[]) {
  localStorage.setItem(FEE_STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-fees-updated"));
}

export function getFeePayments() {
  try {
    const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (!raw) return feePayments;
    const parsed: unknown = JSON.parse(raw);
    return isPaymentArray(parsed) ? parsed : feePayments;
  } catch {
    return feePayments;
  }
}

export function saveFeePayments(rows: FeePayment[]) {
  localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-fees-updated"));
}

export function getFeeReceipts() {
  try {
    const raw = localStorage.getItem(RECEIPT_STORAGE_KEY);
    if (!raw) return feeReceipts;
    const parsed: unknown = JSON.parse(raw);
    return isReceiptArray(parsed) ? parsed : feeReceipts;
  } catch {
    return feeReceipts;
  }
}

export function saveFeeReceipts(rows: FeeReceipt[]) {
  localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-fees-updated"));
}

export function recordFeePayment(input: {
  feeId: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  recordedBy: string;
  reference?: string;
}) {
  const today = new Date().toISOString().split("T")[0];
  const payment: FeePayment = {
    id: `pay-${Date.now()}`,
    fee_id: input.feeId,
    student_id: input.studentId,
    amount: input.amount,
    method: input.method,
    payment_date: today,
    recorded_by: input.recordedBy,
    reference: input.reference,
  };

  const receipt: FeeReceipt = {
    id: `rcp-${Date.now()}`,
    payment_id: payment.id,
    receipt_no: `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
    student_id: input.studentId,
    amount: input.amount,
    issued_on: today,
  };

  const feesRows = getStaffFees().map((fee) =>
    fee.id === input.feeId ? { ...fee, status: "paid" as const, paid_date: today } : fee,
  );
  const payments = [payment, ...getFeePayments()];
  const receipts = [receipt, ...getFeeReceipts()];

  saveStaffFees(feesRows);
  saveFeePayments(payments);
  saveFeeReceipts(receipts);

  return { payment, receipt };
}
