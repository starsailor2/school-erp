import type { LibraryBook } from "@/types";

export const libraryBooks: LibraryBook[] = [
  { id: "b1", title: "Science Basics", author: "R.K. Sharma", isbn: "978-0-1234-0001", category: "Science", total_copies: 5, available_copies: 3 },
  { id: "b2", title: "Mathematics Guide", author: "S. Gupta", isbn: "978-0-1234-0002", category: "Mathematics", total_copies: 4, available_copies: 0, issued_to: "stu1", issue_date: "2026-03-05", return_date: "2026-03-20" },
  { id: "b3", title: "English Grammar", author: "Wren & Martin", isbn: "978-0-1234-0003", category: "Language", total_copies: 6, available_copies: 4 },
  { id: "b4", title: "Indian History", author: "Bipin Chandra", isbn: "978-0-1234-0004", category: "History", total_copies: 3, available_copies: 0, issued_to: "stu5", issue_date: "2026-03-01", return_date: "2026-03-15" },
  { id: "b5", title: "Physics Fundamentals", author: "H.C. Verma", isbn: "978-0-1234-0005", category: "Science", total_copies: 5, available_copies: 5 },
  { id: "b6", title: "Chemistry Concepts", author: "O.P. Tandon", isbn: "978-0-1234-0006", category: "Science", total_copies: 4, available_copies: 2 },
  { id: "b7", title: "Biology Today", author: "Pradeep", isbn: "978-0-1234-0007", category: "Science", total_copies: 3, available_copies: 0, issued_to: "stu8", issue_date: "2026-03-07", return_date: "2026-03-21" },
  { id: "b8", title: "Computer Programming", author: "Sumita Arora", isbn: "978-0-1234-0008", category: "Computer Science", total_copies: 5, available_copies: 3 },
  { id: "b9", title: "Hindi Sahitya", author: "Premchand", isbn: "978-0-1234-0009", category: "Language", total_copies: 4, available_copies: 4 },
  { id: "b10", title: "Geography World", author: "D.R. Khullar", isbn: "978-0-1234-0010", category: "Geography", total_copies: 3, available_copies: 2 },
];
