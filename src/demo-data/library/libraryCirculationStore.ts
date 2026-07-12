import { libraryBooks } from "@/demo-data/library/books";
import type { LibraryBook, LibraryRecord } from "@/types";

const BOOK_STORAGE_KEY = "erp_staff_library_books";
const RECORD_STORAGE_KEY = "erp_staff_library_records";

function isBookArray(value: unknown): value is LibraryBook[] {
  return Array.isArray(value) && value.every((b) => b && typeof b === "object" && "id" in b && "title" in b);
}

function isRecordArray(value: unknown): value is LibraryRecord[] {
  return Array.isArray(value) && value.every((r) => r && typeof r === "object" && "id" in r && "book_id" in r);
}

export function getLibraryBooksState() {
  try {
    const raw = localStorage.getItem(BOOK_STORAGE_KEY);
    if (!raw) return libraryBooks;
    const parsed: unknown = JSON.parse(raw);
    return isBookArray(parsed) ? parsed : libraryBooks;
  } catch {
    return libraryBooks;
  }
}

export function saveLibraryBooksState(rows: LibraryBook[]) {
  localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-library-updated"));
}

export function getLibraryRecords() {
  try {
    const raw = localStorage.getItem(RECORD_STORAGE_KEY);
    if (!raw) return [] as LibraryRecord[];
    const parsed: unknown = JSON.parse(raw);
    return isRecordArray(parsed) ? parsed : [];
  } catch {
    return [] as LibraryRecord[];
  }
}

export function saveLibraryRecords(rows: LibraryRecord[]) {
  localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-library-updated"));
}

export function issueLibraryBook(input: {
  bookId: string;
  studentId: string;
  issuedBy: string;
  returnDate: string;
}) {
  const today = new Date().toISOString().split("T")[0];
  const books = getLibraryBooksState();
  const target = books.find((b) => b.id === input.bookId);
  if (!target || target.available_copies <= 0) return null;

  const updatedBooks = books.map((b) =>
    b.id === input.bookId
      ? {
          ...b,
          available_copies: b.available_copies - 1,
          issued_to: input.studentId,
          issue_date: today,
          return_date: input.returnDate,
        }
      : b,
  );

  const record: LibraryRecord = {
    id: `lib-${Date.now()}`,
    book_id: input.bookId,
    student_id: input.studentId,
    issue_date: today,
    return_date: input.returnDate,
    status: "issued",
    issued_by: input.issuedBy,
  };

  saveLibraryBooksState(updatedBooks);
  saveLibraryRecords([record, ...getLibraryRecords()]);
  return record;
}

export function returnLibraryBook(recordId: string) {
  const today = new Date().toISOString().split("T")[0];
  const records = getLibraryRecords();
  const record = records.find((r) => r.id === recordId);
  if (!record || record.status !== "issued") return;

  const updatedBooks = getLibraryBooksState().map((b) =>
    b.id === record.book_id
      ? {
          ...b,
          available_copies: Math.min(b.total_copies, b.available_copies + 1),
          issued_to: b.issued_to === record.student_id ? undefined : b.issued_to,
          issue_date: b.issued_to === record.student_id ? undefined : b.issue_date,
          return_date: b.issued_to === record.student_id ? undefined : b.return_date,
        }
      : b,
  );

  const updatedRecords = records.map((r) =>
    r.id === recordId ? { ...r, status: "returned" as const, actual_return_date: today } : r,
  );

  saveLibraryBooksState(updatedBooks);
  saveLibraryRecords(updatedRecords);
}
