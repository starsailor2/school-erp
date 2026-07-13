import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import StaffFeatureGuard from "@/components/StaffFeatureGuard";
import type { ReactElement } from "react";

function SG(feature: "fees" | "transport" | "library" | "student_lookup" | "student_requests" | "communication" | "reports" | "hostel" | "mess", element: ReactElement, minimum: "view" | "manage" = "view") {
  return (
    <StaffFeatureGuard feature={feature} minimum={minimum}>
      {element}
    </StaffFeatureGuard>
  );
}

const Layout = lazy(() => import("@/components/Layout"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const StudentDirectory = lazy(() => import("@/pages/admin/StudentDirectory"));
const StudentProfile = lazy(() => import("@/pages/admin/StudentProfile"));
const Admissions = lazy(() => import("@/pages/admin/Admissions"));
const ParentLinking = lazy(() => import("@/pages/admin/ParentLinking"));
const TeacherDirectory = lazy(() => import("@/pages/admin/TeacherDirectory"));
const SubjectAllocation = lazy(() => import("@/pages/admin/SubjectAllocation"));
const ClassTeacherAssign = lazy(() => import("@/pages/admin/ClassTeacherAssign"));
const HodAssign = lazy(() => import("@/pages/admin/HodAssign"));
const AdminClasses = lazy(() => import("@/pages/admin/Classes"));
const AdminSections = lazy(() => import("@/pages/admin/Sections"));
const AdminSubjects = lazy(() => import("@/pages/admin/Subjects"));
const AdminTimetable = lazy(() => import("@/pages/admin/Timetable"));
const AdminStudentAttendance = lazy(() => import("@/pages/admin/StudentAttendance"));
const AdminTeacherAttendance = lazy(() => import("@/pages/admin/TeacherAttendance"));
const AttendanceReports = lazy(() => import("@/pages/admin/AttendanceReports"));
const HomeworkMonitor = lazy(() => import("@/pages/admin/HomeworkMonitor"));
const HomeworkReports = lazy(() => import("@/pages/admin/HomeworkReports"));
const ExamSetup = lazy(() => import("@/pages/admin/ExamSetup"));
const ExamSchedule = lazy(() => import("@/pages/admin/ExamSchedule"));
const MarksOverview = lazy(() => import("@/pages/admin/MarksOverview"));
const ReportCards = lazy(() => import("@/pages/admin/ReportCards"));
const ExamAnalytics = lazy(() => import("@/pages/admin/ExamAnalytics"));
const FeeStructure = lazy(() => import("@/pages/admin/FeeStructure"));
const FeeCollection = lazy(() => import("@/pages/admin/FeeCollection"));
const FeeDefaulters = lazy(() => import("@/pages/admin/FeeDefaulters"));
const FeeReports = lazy(() => import("@/pages/admin/FeeReports"));
const TransportRoutes = lazy(() => import("@/pages/admin/TransportRoutes"));
const Vehicles = lazy(() => import("@/pages/admin/Vehicles"));
const TransportAllocation = lazy(() => import("@/pages/admin/TransportAllocation"));
const AdminAnnouncements = lazy(() => import("@/pages/admin/Announcements"));
const Notices = lazy(() => import("@/pages/admin/Notices"));
const AdminMessages = lazy(() => import("@/pages/admin/Messages"));
const StaffDirectory = lazy(() => import("@/pages/admin/StaffDirectory"));
const StaffRoles = lazy(() => import("@/pages/admin/StaffRoles"));
const AdminLeaveRequests = lazy(() => import("@/pages/admin/LeaveRequests"));
const Reports = lazy(() => import("@/pages/admin/Reports"));
const PerformanceReports = lazy(() => import("@/pages/admin/PerformanceReports"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const AdminTeacherProfile = lazy(() => import("@/pages/admin/TeacherProfile"));
const StudentTransfer = lazy(() => import("@/pages/admin/StudentTransfer"));
const StudentDocuments = lazy(() => import("@/pages/admin/StudentDocuments"));
const AttendanceAnalytics = lazy(() => import("@/pages/admin/AttendanceAnalytics"));
const DriverManagement = lazy(() => import("@/pages/admin/DriverManagement"));
const ParentNotifications = lazy(() => import("@/pages/admin/ParentNotifications"));
const HostelDashboard = lazy(() => import("@/pages/admin/HostelDashboard"));
const HostelRooms = lazy(() => import("@/pages/admin/HostelRooms"));
const HostelAllocationAdmin = lazy(() => import("@/pages/admin/HostelAllocation"));
const HostelFeeStructure = lazy(() => import("@/pages/admin/HostelFeeStructure"));
const MessDashboard = lazy(() => import("@/pages/admin/MessDashboard"));
const AdminMessMenu = lazy(() => import("@/pages/admin/MessMenu"));
const MessPlans = lazy(() => import("@/pages/admin/MessPlans"));
const MessBilling = lazy(() => import("@/pages/admin/MessBilling"));

// Teacher pages
const TeacherDashboard = lazy(() => import("@/pages/teacher/Dashboard"));
const MyClasses = lazy(() => import("@/pages/teacher/MyClasses"));
const MyStudents = lazy(() => import("@/pages/teacher/MyStudents"));
const TakeAttendance = lazy(() => import("@/pages/teacher/TakeAttendance"));
const AttendanceHistory = lazy(() => import("@/pages/teacher/AttendanceHistory"));
const AssignHomework = lazy(() => import("@/pages/teacher/AssignHomework"));
const HomeworkList = lazy(() => import("@/pages/teacher/HomeworkList"));
const MarksEntry = lazy(() => import("@/pages/teacher/MarksEntry"));
const SubjectResults = lazy(() => import("@/pages/teacher/SubjectResults"));
const TeacherTimetable = lazy(() => import("@/pages/teacher/Timetable"));
const TeacherAnnouncements = lazy(() => import("@/pages/teacher/Announcements"));
const TeacherMessages = lazy(() => import("@/pages/teacher/Messages"));
const TeacherProfile = lazy(() => import("@/pages/teacher/Profile"));
const ClassManagement = lazy(() => import("@/pages/teacher/ClassManagement"));
const StudentPerformance = lazy(() => import("@/pages/teacher/StudentPerformance"));
const ParentCommunication = lazy(() => import("@/pages/teacher/ParentCommunication"));
const BehaviourNotes = lazy(() => import("@/pages/teacher/BehaviourNotes"));
const DepartmentDashboard = lazy(() => import("@/pages/teacher/DepartmentDashboard"));
const DeptTeachers = lazy(() => import("@/pages/teacher/DepartmentTeachers"));
const TeacherSubjectAllocation = lazy(() => import("@/pages/teacher/SubjectAllocation"));
const SyllabusProgress = lazy(() => import("@/pages/teacher/SyllabusProgress"));
const DepartmentReports = lazy(() => import("@/pages/teacher/DepartmentReports"));
const ExamReview = lazy(() => import("@/pages/teacher/ExamReview"));
const TeacherLeave = lazy(() => import("@/pages/teacher/Leave"));
const TeacherMeetings = lazy(() => import("@/pages/teacher/Meetings"));

// Staff pages
const StaffDashboard = lazy(() => import("@/pages/staff/Dashboard"));
const Tasks = lazy(() => import("@/pages/staff/Tasks"));
const StudentLookup = lazy(() => import("@/pages/staff/StudentLookup"));
const StudentRequests = lazy(() => import("@/pages/staff/StudentRequests"));
const StaffFeeCollection = lazy(() => import("@/pages/staff/FeeCollection"));
const PaymentRecords = lazy(() => import("@/pages/staff/PaymentRecords"));
const FeeReceipts = lazy(() => import("@/pages/staff/FeeReceipts"));
const StudentFeeHistory = lazy(() => import("@/pages/staff/StudentFeeHistory"));
const LibraryBooks = lazy(() => import("@/pages/staff/LibraryBooks"));
const LibraryCategories = lazy(() => import("@/pages/staff/LibraryCategories"));
const LibraryIssue = lazy(() => import("@/pages/staff/LibraryIssue"));
const LibraryReturn = lazy(() => import("@/pages/staff/LibraryReturn"));
const LibraryRecords = lazy(() => import("@/pages/staff/LibraryRecords"));
const StaffTransportRoutes = lazy(() => import("@/pages/staff/TransportRoutes"));
const TransportRouteDetails = lazy(() => import("@/pages/staff/TransportRouteDetails"));
const TransportDrivers = lazy(() => import("@/pages/staff/TransportDrivers"));
const TransportReports = lazy(() => import("@/pages/staff/TransportReports"));
const Certificates = lazy(() => import("@/pages/staff/Certificates"));
const IDCardRequests = lazy(() => import("@/pages/staff/IDCardRequests"));
const StaffOperationalReports = lazy(() => import("@/pages/staff/OperationalReports"));
const StaffProfile = lazy(() => import("@/pages/staff/Profile"));
const StaffHostelAllocation = lazy(() => import("@/pages/staff/HostelAllocation"));
const HostelRoster = lazy(() => import("@/pages/staff/HostelRoster"));
const StaffMessAttendance = lazy(() => import("@/pages/staff/MessAttendance"));
const StaffMessMenu = lazy(() => import("@/pages/staff/MessMenu"));
const StaffLeave = lazy(() => import("@/pages/staff/Leave"));

// Parent pages
const ParentDashboard = lazy(() => import("@/pages/parent/Dashboard"));
const MyChildren = lazy(() => import("@/pages/parent/MyChildren"));
const ParentAttendance = lazy(() => import("@/pages/parent/Attendance"));
const ParentHomework = lazy(() => import("@/pages/parent/Homework"));
const ParentTimetable = lazy(() => import("@/pages/parent/Timetable"));
const ParentExams = lazy(() => import("@/pages/parent/Exams"));
const ParentFees = lazy(() => import("@/pages/parent/Fees"));
const ParentTransport = lazy(() => import("@/pages/parent/Transport"));
const ParentAnnouncements = lazy(() => import("@/pages/parent/Announcements"));
const ParentMessages = lazy(() => import("@/pages/parent/Messages"));
const ParentProfile = lazy(() => import("@/pages/parent/Profile"));
const ParentHostel = lazy(() => import("@/pages/parent/Hostel"));
const ParentMess = lazy(() => import("@/pages/parent/Mess"));
const ParentMeetings = lazy(() => import("@/pages/parent/Meetings"));

// Student pages
const StudentDashboard = lazy(() => import("@/pages/student/Dashboard"));
const StudentProfilePage = lazy(() => import("@/pages/student/Profile"));
const StudentAttendance = lazy(() => import("@/pages/student/Attendance"));
const StudentHomework = lazy(() => import("@/pages/student/Homework"));
const StudentTimetable = lazy(() => import("@/pages/student/Timetable"));
const StudentExams = lazy(() => import("@/pages/student/Exams"));
const StudentAnnouncements = lazy(() => import("@/pages/student/Announcements"));
const StudentMessages = lazy(() => import("@/pages/student/Messages"));
const StudentLibrary = lazy(() => import("@/pages/student/Library"));
const StudentTransport = lazy(() => import("@/pages/student/Transport"));
const StudentHostel = lazy(() => import("@/pages/student/Hostel"));
const StudentMess = lazy(() => import("@/pages/student/Mess"));

// Shared
const Notifications = lazy(() => import("@/pages/shared/Notifications"));
const PortalSelection = lazy(() => import("@/pages/PortalSelection"));
const LoginPage = lazy(() => import("@/pages/Login"));

export const router = createBrowserRouter([
  // Portal selection & login (outside Layout)
  {
    path: "/",
    element: <PortalSelection />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  // Main app layout
  {
    path: "/",
    element: (
      <Suspense fallback={null}>
        <Layout />
      </Suspense>
    ),
    children: [
      // ─── Admin ──────────────────────────────────
      { path: "admin", element: <AdminDashboard /> },
      { path: "admin/students", element: <StudentDirectory /> },
      { path: "admin/students/:id", element: <StudentProfile /> },
      { path: "admin/students/admissions", element: <Admissions /> },
      { path: "admin/students/parents", element: <ParentLinking /> },
      { path: "admin/students/transfer", element: <StudentTransfer /> },
      { path: "admin/students/documents", element: <StudentDocuments /> },
      { path: "admin/teachers", element: <TeacherDirectory /> },
      { path: "admin/teachers/:id", element: <AdminTeacherProfile /> },
      { path: "admin/teachers/subjects", element: <SubjectAllocation /> },
      { path: "admin/teachers/class-assign", element: <ClassTeacherAssign /> },
      { path: "admin/teachers/hod-assign", element: <HodAssign /> },
      { path: "admin/academics/classes", element: <AdminClasses /> },
      { path: "admin/academics/sections", element: <AdminSections /> },
      { path: "admin/academics/subjects", element: <AdminSubjects /> },
      { path: "admin/academics/timetable", element: <AdminTimetable /> },
      { path: "admin/attendance/students", element: <AdminStudentAttendance /> },
      { path: "admin/attendance/teachers", element: <AdminTeacherAttendance /> },
      { path: "admin/attendance/reports", element: <AttendanceReports /> },
      { path: "admin/attendance/analytics", element: <AttendanceAnalytics /> },
      { path: "admin/homework", element: <HomeworkMonitor /> },
      { path: "admin/homework/reports", element: <HomeworkReports /> },
      { path: "admin/exams", element: <ExamSetup /> },
      { path: "admin/exams/schedule", element: <ExamSchedule /> },
      { path: "admin/exams/marks", element: <MarksOverview /> },
      { path: "admin/exams/report-cards", element: <ReportCards /> },
      { path: "admin/exams/analytics", element: <ExamAnalytics /> },
      { path: "admin/fees", element: <FeeStructure /> },
      { path: "admin/fees/collection", element: <FeeCollection /> },
      { path: "admin/fees/defaulters", element: <FeeDefaulters /> },
      { path: "admin/fees/reports", element: <FeeReports /> },
      { path: "admin/transport", element: <TransportRoutes /> },
      { path: "admin/transport/vehicles", element: <Vehicles /> },
      { path: "admin/transport/allocation", element: <TransportAllocation /> },
      { path: "admin/transport/drivers", element: <DriverManagement /> },
      { path: "admin/hostel", element: <HostelDashboard /> },
      { path: "admin/hostel/rooms", element: <HostelRooms /> },
      { path: "admin/hostel/allocation", element: <HostelAllocationAdmin /> },
      { path: "admin/hostel/fees", element: <HostelFeeStructure /> },
      { path: "admin/mess", element: <MessDashboard /> },
      { path: "admin/mess/menu", element: <AdminMessMenu /> },
      { path: "admin/mess/plans", element: <MessPlans /> },
      { path: "admin/mess/billing", element: <MessBilling /> },
      { path: "admin/communication/announcements", element: <AdminAnnouncements /> },
      { path: "admin/communication/notices", element: <Notices /> },
      { path: "admin/communication/messages", element: <AdminMessages /> },
      { path: "admin/communication/parent-notifications", element: <ParentNotifications /> },
      { path: "admin/staff", element: <StaffDirectory /> },
      { path: "admin/staff/roles", element: <StaffRoles /> },
      { path: "admin/staff/leave", element: <AdminLeaveRequests /> },
      { path: "admin/reports/academic", element: <Reports /> },
      { path: "admin/reports/attendance", element: <AttendanceReports /> },
      { path: "admin/reports/fees", element: <FeeReports /> },
      { path: "admin/reports/performance", element: <PerformanceReports /> },
      { path: "admin/settings", element: <Settings /> },
      { path: "admin/settings/academic-year", element: <Settings /> },
      { path: "admin/settings/permissions", element: <Settings /> },
      { path: "admin/settings/system", element: <Settings /> },
      { path: "admin/notifications", element: <Notifications /> },

      // ─── Teacher ────────────────────────────────
      { path: "teacher", element: <TeacherDashboard /> },
      { path: "teacher/classes", element: <MyClasses /> },
      { path: "teacher/students", element: <MyStudents /> },
      { path: "teacher/attendance", element: <TakeAttendance /> },
      { path: "teacher/attendance/history", element: <AttendanceHistory /> },
      { path: "teacher/homework", element: <AssignHomework /> },
      { path: "teacher/homework/list", element: <HomeworkList /> },
      { path: "teacher/exams", element: <MarksEntry /> },
      { path: "teacher/exams/results", element: <SubjectResults /> },
      { path: "teacher/timetable", element: <TeacherTimetable /> },
      { path: "teacher/announcements", element: <TeacherAnnouncements /> },
      { path: "teacher/messages", element: <TeacherMessages /> },
      { path: "teacher/profile", element: <TeacherProfile /> },
      { path: "teacher/class-mgmt", element: <ClassManagement /> },
      { path: "teacher/class-mgmt/performance", element: <StudentPerformance /> },
      { path: "teacher/class-mgmt/parents", element: <ParentCommunication /> },
      { path: "teacher/class-mgmt/behaviour", element: <BehaviourNotes /> },
      { path: "teacher/department", element: <DepartmentDashboard /> },
      { path: "teacher/department/teachers", element: <DeptTeachers /> },
      { path: "teacher/department/subjects", element: <TeacherSubjectAllocation /> },
      { path: "teacher/department/syllabus", element: <SyllabusProgress /> },
      { path: "teacher/department/exam-review", element: <ExamReview /> },
      { path: "teacher/department/reports", element: <DepartmentReports /> },
      { path: "teacher/leave", element: <TeacherLeave /> },
      { path: "teacher/meetings", element: <TeacherMeetings /> },
      { path: "teacher/notifications", element: <Notifications /> },

      // ─── Staff ──────────────────────────────────
      { path: "staff", element: <StaffDashboard /> },
      { path: "staff/tasks", element: <Tasks /> },
      { path: "staff/students", element: SG("student_lookup", <StudentLookup />) },
      { path: "staff/students/requests", element: SG("student_requests", <StudentRequests />) },
      { path: "staff/students/fee-history", element: SG("fees", <StudentFeeHistory />) },
      { path: "staff/fees", element: SG("fees", <StaffFeeCollection />) },
      { path: "staff/fees/collection", element: SG("fees", <StaffFeeCollection />) },
      { path: "staff/fees/records", element: SG("fees", <PaymentRecords />) },
      { path: "staff/fees/defaulters", element: SG("fees", <FeeDefaulters />) },
      { path: "staff/fees/receipts", element: SG("fees", <FeeReceipts />) },
      { path: "staff/fees/structure", element: SG("fees", <FeeStructure />, "manage") },
      { path: "staff/transport", element: SG("transport", <StaffTransportRoutes />) },
      { path: "staff/transport/routes", element: SG("transport", <StaffTransportRoutes />) },
      { path: "staff/transport/routes/:routeId", element: SG("transport", <TransportRouteDetails />) },
      { path: "staff/transport/vehicles", element: SG("transport", <Vehicles />) },
      { path: "staff/transport/drivers", element: SG("transport", <TransportDrivers />) },
      { path: "staff/transport/students", element: SG("transport", <TransportAllocation />) },
      { path: "staff/transport/reports", element: SG("transport", <TransportReports />) },
      { path: "staff/library", element: SG("library", <LibraryBooks />) },
      { path: "staff/library/books", element: SG("library", <LibraryBooks />) },
      { path: "staff/library/categories", element: SG("library", <LibraryCategories />) },
      { path: "staff/library/issue", element: SG("library", <LibraryIssue />) },
      { path: "staff/library/return", element: SG("library", <LibraryReturn />) },
      { path: "staff/library/records", element: SG("library", <LibraryRecords />) },
      { path: "staff/hostel/allocation", element: SG("hostel", <StaffHostelAllocation />) },
      { path: "staff/hostel/roster", element: SG("hostel", <HostelRoster />) },
      { path: "staff/mess/attendance", element: SG("mess", <StaffMessAttendance />, "manage") },
      { path: "staff/mess/menu", element: SG("mess", <StaffMessMenu />) },
      { path: "staff/certificates", element: SG("student_requests", <Certificates />, "manage") },
      { path: "staff/id-cards", element: SG("student_requests", <IDCardRequests />, "manage") },
      { path: "staff/communication", element: SG("communication", <AdminAnnouncements />) },
      { path: "staff/communication/messages", element: <AdminMessages /> },
      { path: "staff/reports", element: SG("reports", <StaffOperationalReports />) },
      { path: "staff/leave", element: <StaffLeave /> },
      { path: "staff/profile", element: <StaffProfile /> },
      { path: "staff/notifications", element: <Notifications /> },

      // ─── Parent ─────────────────────────────────
      { path: "parent", element: <ParentDashboard /> },
      { path: "parent/children", element: <MyChildren /> },
      { path: "parent/attendance", element: <ParentAttendance /> },
      { path: "parent/homework", element: <ParentHomework /> },
      { path: "parent/timetable", element: <ParentTimetable /> },
      { path: "parent/exams", element: <ParentExams /> },
      { path: "parent/fees", element: <ParentFees /> },
      { path: "parent/transport", element: <ParentTransport /> },
      { path: "parent/hostel", element: <ParentHostel /> },
      { path: "parent/mess", element: <ParentMess /> },
      { path: "parent/meetings", element: <ParentMeetings /> },
      { path: "parent/announcements", element: <ParentAnnouncements /> },
      { path: "parent/messages", element: <ParentMessages /> },
      { path: "parent/profile", element: <ParentProfile /> },
      { path: "parent/notifications", element: <Notifications /> },

      // ─── Student ────────────────────────────────
      { path: "student", element: <StudentDashboard /> },
      { path: "student/profile", element: <StudentProfilePage /> },
      { path: "student/attendance", element: <StudentAttendance /> },
      { path: "student/homework", element: <StudentHomework /> },
      { path: "student/timetable", element: <StudentTimetable /> },
      { path: "student/exams", element: <StudentExams /> },
      { path: "student/announcements", element: <StudentAnnouncements /> },
      { path: "student/messages", element: <StudentMessages /> },
      { path: "student/library", element: <StudentLibrary /> },
      { path: "student/transport", element: <StudentTransport /> },
      { path: "student/hostel", element: <StudentHostel /> },
      { path: "student/mess", element: <StudentMess /> },
      { path: "student/notifications", element: <Notifications /> },
    ],
  },
]);
