import { useMemo } from "react";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { getLibraryBooksState } from "@/data/libraryCirculationStore";

export default function LibraryCategories() {
  const rows = useMemo(() => {
    const map = new Map<string, { category: string; total: number; available: number }>();
    for (const book of getLibraryBooksState()) {
      const existing = map.get(book.category) ?? { category: book.category, total: 0, available: 0 };
      existing.total += book.total_copies;
      existing.available += book.available_copies;
      map.set(book.category, existing);
    }
    return Array.from(map.values());
  }, []);

  return (
    <>
      <PageHeader
        title="Book Categories"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Library", to: "/staff/library/books" }, { label: "Categories" }]}
      />
      <DataTable
        rows={rows}
        columns={[
          { key: "category", label: "Category" },
          { key: "total", label: "Total Copies" },
          { key: "available", label: "Available Copies" },
        ]}
      />
    </>
  );
}
