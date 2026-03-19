import { useState } from "react";
import { MenuItem, TextField, Grid, Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { marks, students, classes, exams, getSubjectName, getClassName } from "@/data/mock";

export default function MarksOverview() {
  const [classFilter, setClassFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");

  const rows = marks.map((m) => {
    const student = students.find((s) => s.id === m.student_id);
    const exam = exams.find((e) => e.id === m.exam_id);
    return {
      ...m,
      studentName: student?.name ?? "—",
      className: student ? getClassName(student.class_id) : "—",
      classId: student?.class_id ?? "",
      examName: exam?.name ?? m.exam_id,
      percent: Math.round((m.marks_obtained / m.max_marks) * 100),
    };
  }).filter((r) => (classFilter === "all" || r.classId === classFilter) && (examFilter === "all" || r.exam_id === examFilter));

  return (
    <>
      <PageHeader
        title="Marks Overview"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Examinations", to: "/admin/exams" },
          { label: "Marks" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="all">All Classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Exam" value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
            <MenuItem value="all">All Exams</MenuItem>
            {exams.map((exam) => <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          { key: "studentName", label: "Student" },
          { key: "className", label: "Class" },
          { key: "examName", label: "Exam" },
          { key: "subject_id", label: "Subject", render: (m) => getSubjectName(m.subject_id) },
          { key: "marks_obtained", label: "Marks", render: (m) => `${m.marks_obtained}/${m.max_marks}` },
          {
            key: "grade", label: "Grade",
            render: (m) => <Chip label={m.grade} size="small" color={m.percent >= 80 ? "success" : m.percent >= 50 ? "warning" : "error"} />,
          },
          { key: "percent", label: "%", render: (m) => `${m.percent}%` },
        ]}
        rows={rows}
      />
    </>
  );
}
