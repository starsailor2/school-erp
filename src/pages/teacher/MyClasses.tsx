import { useNavigate } from "react-router-dom";
import { Chip, Button, Stack } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { teachers, getTeacherClasses, students, getClassName, getSubjectName } from "@/data/mock";

export default function MyClasses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];

  const rows = allocations.map((a) => {
    const sectionStudents = students.filter((s) => s.section_id === a.section_id);
    const avgAtt = sectionStudents.length > 0
      ? Math.round(sectionStudents.reduce((s, st) => s + st.attendance_pct, 0) / sectionStudents.length)
      : 0;
    return {
      ...a,
      className: getClassName(a.class_id),
      subjectName: getSubjectName(a.subject_id),
      studentCount: sectionStudents.length,
      avgAttendance: avgAtt,
    };
  });

  return (
    <>
      <PageHeader
        title="My Classes"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "My Classes" }]}
      />
      <DataTable
        columns={[
          { key: "className", label: "Class" },
          { key: "section_id", label: "Section", render: (r) => r.section_id.split("-")[1]?.toUpperCase() },
          { key: "subjectName", label: "Subject", render: (r) => <Chip label={r.subjectName} size="small" variant="outlined" /> },
          { key: "studentCount", label: "Students" },
          { key: "avgAttendance", label: "Avg Attendance", render: (r) => <Chip label={`${r.avgAttendance}%`} size="small" color={r.avgAttendance >= 85 ? "success" : "warning"} /> },
          {
            key: "id", label: "Actions",
            render: (r) => (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => navigate(`/teacher/students?class=${r.class_id}`)}>Students</Button>
                <Button size="small" variant="outlined" onClick={() => navigate(`/teacher/attendance`)}>Attendance</Button>
              </Stack>
            ),
          },
        ]}
        rows={rows}
        onRowClick={(r) => navigate(`/teacher/students?class=${r.class_id}`)}
      />
    </>
  );
}
