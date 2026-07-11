import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import StaffFeatureGuard from "@/components/StaffFeatureGuard";
import type { ReactElement } from "react";

function L(factory: () => Promise<{ default: React.ComponentType }>) {
  const Comp = lazy(factory);
  return (
    <Suspense fallback={null}>
      <Comp />
    </Suspense>
  );
}

function SG(feature: "fees" | "transport" | "library" | "student_lookup" | "student_requests" | "communication" | "reports" | "hostel" | "mess", element: ReactElement, minimum: "view" | "manage" = "view") {
  return (
    <StaffFeatureGuard feature={feature} minimum={minimum}>
      {element}
    </StaffFeatureGuard>
  );
}

const Layout = lazy(() => import("@/components/Layout"));

// Admin pages
const AdminDashboard = () => L(() => import("@/pages/admin/Dashboard"));
const StudentDirectory = () => L(() => import("@/pages/admin/StudentDirectory"));
const StudentProfile = () => L(() => import("@/pages/admin/StudentProfile"));
const Admissions = () => L(() => import("@/pages/admin/Admissions"));
const ParentLinking = () => L(() => import("@/pages/admin/ParentLinking"));
const TeacherDirectory = () => L(() => import("@/pages/admin/TeacherDirectory"));
const SubjectAllocation = () => L(() => import("@/pages/admin/SubjectAllocation"));
const ClassTeacherAssign = () => L(() => import("@/pages/admin/ClassTeacherAssign"));
const HodAssign = () => L(() => import("@/pages/admin/HodAssign"));
const AdminClasses = () => L(() => import("@/pages/admin/Classes"));
const AdminSections = () => L(() => import("@/pages/admin/Sections"));
const AdminSubjects = () => L(() => import("@/pages/admin/Subjects"));
const AdminTimetable = () => L(() => import("@/pages/admin/Timetable"));
const AdminStudentAttendance = () => L(() => import("@/pages/admin/StudentAttendance"));
const AdminTeacherAttendance = () => L(() => import("@/pages/admin/TeacherAttendance"));
const AttendanceReports = () => L(() => import("@/pages/admin/AttendanceReports"));
const HomeworkMonitor = () => L(() => import("@/pages/admin/HomeworkMonitor"));
const HomeworkReports = () => L(() => import("@/pages/admin/HomeworkReports"));
const ExamSetup = () => L(() => import("@/pages/admin/ExamSetup"));
const ExamSchedule = () => L(() => import("@/pages/admin/ExamSchedule"));
const MarksOverview = () => L(() => import("@/pages/admin/MarksOverview"));
const ReportCards = () => L(() => import("@/pages/admin/ReportCards"));
const ExamAnalytics = () => L(() => import("@/pages/admin/ExamAnalytics"));
const FeeStructure = () => L(() => import("@/pages/admin/FeeStructure"));
const FeeCollection = () => L(() => import("@/pages/admin/FeeCollection"));
const FeeDefaulters = () => L(() => import("@/pages/admin/FeeDefaulters"));
const FeeReports = () => L(() => import("@/pages/admin/FeeReports"));
const TransportRoutes = () => L(() => import("@/pages/admin/TransportRoutes"));
const Vehicles = () => L(() => import("@/pages/admin/Vehicles"));
const TransportAllocation = () => L(() => import("@/pages/admin/TransportAllocation"));
const AdminAnnouncements = () => L(() => import("@/pages/admin/Announcements"));
const Notices = () => L(() => import("@/pages/admin/Notices"));
const AdminMessages = () => L(() => import("@/pages/admin/Messages"));
const StaffDirectory = () => L(() => import("@/pages/admin/StaffDirectory"));
const StaffRoles = () => L(() => import("@/pages/admin/StaffRoles"));
const Reports = () => L(() => import("@/pages/admin/Reports"));
const PerformanceReports = () => L(() => import("@/pages/admin/PerformanceReports"));
const Settings = () => L(() => import("@/pages/admin/Settings"));
const AdminTeacherProfile = () => L(() => import("@/pages/admin/TeacherProfile"));
const StudentTransfer = () => L(() => import("@/pages/admin/StudentTransfer"));
const StudentDocuments = () => L(() => import("@/pages/admin/StudentDocuments"));
const AttendanceAnalytics = () => L(() => import("@/pages/admin/AttendanceAnalytics"));
const DriverManagement = () => L(() => import("@/pages/admin/DriverManagement"));
const ParentNotifications = () => L(() => import("@/pages/admin/ParentNotifications"));
const HostelDashboard = () => L(() => import("@/pages/admin/HostelDashboard"));
const HostelRooms = () => L(() => import("@/pages/admin/HostelRooms"));
const HostelAllocationAdmin = () => L(() => import("@/pages/admin/HostelAllocation"));
const HostelFeeStructure = () => L(() => import("@/pages/admin/HostelFeeStructure"));
const MessDashboard = () => L(() => import("@/pages/admin/MessDashboard"));
const AdminMessMenu = () => L(() => import("@/pages/admin/MessMenu"));
const MessPlans = () => L(() => import("@/pages/admin/MessPlans"));
const MessBilling = () => L(() => import("@/pages/admin/MessBilling"));

// Teacher pages
const TeacherDashboard = () => L(() => import("@/pages/teacher/Dashboard"));
const MyClasses = () => L(() => import("@/pages/teacher/MyClasses"));
const MyStudents = () => L(() => import("@/pages/teacher/MyStudents"));
const TakeAttendance = () => L(() => import("@/pages/teacher/TakeAttendance"));
const AttendanceHistory = () => L(() => import("@/pages/teacher/AttendanceHistory"));
const AssignHomework = () => L(() => import("@/pages/teacher/AssignHomework"));
const HomeworkList = () => L(() => import("@/pages/teacher/HomeworkList"));
const MarksEntry = () => L(() => import("@/pages/teacher/MarksEntry"));
const SubjectResults = () => L(() => import("@/pages/teacher/SubjectResults"));
const TeacherTimetable = () => L(() => import("@/pages/teacher/Timetable"));
const TeacherAnnouncements = () => L(() => import("@/pages/teacher/Announcements"));
const TeacherMessages = () => L(() => import("@/pages/teacher/Messages"));
const TeacherProfile = () => L(() => import("@/pages/teacher/Profile"));
const ClassManagement = () => L(() => import("@/pages/teacher/ClassManagement"));
const StudentPerformance = () => L(() => import("@/pages/teacher/StudentPerformance"));
const ParentCommunication = () => L(() => import("@/pages/teacher/ParentCommunication"));
const BehaviourNotes = () => L(() => import("@/pages/teacher/BehaviourNotes"));
const DepartmentDashboard = () => L(() => import("@/pages/teacher/DepartmentDashboard"));
const DeptTeachers = () => L(() => import("@/pages/teacher/DepartmentTeachers"));
const TeacherSubjectAllocation = () => L(() => import("@/pages/teacher/SubjectAllocation"));
const SyllabusProgress = () => L(() => import("@/pages/teacher/SyllabusProgress"));
const DepartmentReports = () => L(() => import("@/pages/teacher/DepartmentReports"));
const ExamReview = () => L(() => import("@/pages/teacher/ExamReview"));

// Staff pages
const StaffDashboard = () => L(() => import("@/pages/staff/Dashboard"));
const Tasks = () => L(() => import("@/pages/staff/Tasks"));
const StudentLookup = () => L(() => import("@/pages/staff/StudentLookup"));
const StudentRequests = () => L(() => import("@/pages/staff/StudentRequests"));
const StaffFeeCollection = () => L(() => import("@/pages/staff/FeeCollection"));
const PaymentRecords = () => L(() => import("@/pages/staff/PaymentRecords"));
const FeeReceipts = () => L(() => import("@/pages/staff/FeeReceipts"));
const StudentFeeHistory = () => L(() => import("@/pages/staff/StudentFeeHistory"));
const LibraryBooks = () => L(() => import("@/pages/staff/LibraryBooks"));
const LibraryCategories = () => L(() => import("@/pages/staff/LibraryCategories"));
const LibraryIssue = () => L(() => import("@/pages/staff/LibraryIssue"));
const LibraryReturn = () => L(() => import("@/pages/staff/LibraryReturn"));
const LibraryRecords = () => L(() => import("@/pages/staff/LibraryRecords"));
const StaffTransportRoutes = () => L(() => import("@/pages/staff/TransportRoutes"));
const TransportRouteDetails = () => L(() => import("@/pages/staff/TransportRouteDetails"));
const TransportDrivers = () => L(() => import("@/pages/staff/TransportDrivers"));
const TransportReports = () => L(() => import("@/pages/staff/TransportReports"));
const Certificates = () => L(() => import("@/pages/staff/Certificates"));
const IDCardRequests = () => L(() => import("@/pages/staff/IDCardRequests"));
const StaffOperationalReports = () => L(() => import("@/pages/staff/OperationalReports"));
const StaffProfile = () => L(() => import("@/pages/staff/Profile"));
const StaffHostelAllocation = () => L(() => import("@/pages/staff/HostelAllocation"));
const HostelRoster = () => L(() => import("@/pages/staff/HostelRoster"));
const StaffMessAttendance = () => L(() => import("@/pages/staff/MessAttendance"));
const StaffMessMenu = () => L(() => import("@/pages/staff/MessMenu"));

// Parent pages
const ParentDashboard = () => L(() => import("@/pages/parent/Dashboard"));
const MyChildren = () => L(() => import("@/pages/parent/MyChildren"));
const ParentAttendance = () => L(() => import("@/pages/parent/Attendance"));
const ParentHomework = () => L(() => import("@/pages/parent/Homework"));
const ParentTimetable = () => L(() => import("@/pages/parent/Timetable"));
const ParentExams = () => L(() => import("@/pages/parent/Exams"));
const ParentFees = () => L(() => import("@/pages/parent/Fees"));
const ParentTransport = () => L(() => import("@/pages/parent/Transport"));
const ParentAnnouncements = () => L(() => import("@/pages/parent/Announcements"));
const ParentMessages = () => L(() => import("@/pages/parent/Messages"));
const ParentProfile = () => L(() => import("@/pages/parent/Profile"));
const ParentHostel = () => L(() => import("@/pages/parent/Hostel"));
const ParentMess = () => L(() => import("@/pages/parent/Mess"));

// Student pages
const StudentDashboard = () => L(() => import("@/pages/student/Dashboard"));
const StudentProfilePage = () => L(() => import("@/pages/student/Profile"));
const StudentAttendance = () => L(() => import("@/pages/student/Attendance"));
const StudentHomework = () => L(() => import("@/pages/student/Homework"));
const StudentTimetable = () => L(() => import("@/pages/student/Timetable"));
const StudentExams = () => L(() => import("@/pages/student/Exams"));
const StudentAnnouncements = () => L(() => import("@/pages/student/Announcements"));
const StudentMessages = () => L(() => import("@/pages/student/Messages"));
const StudentLibrary = () => L(() => import("@/pages/student/Library"));
const StudentTransport = () => L(() => import("@/pages/student/Transport"));
const StudentHostel = () => L(() => import("@/pages/student/Hostel"));
const StudentMess = () => L(() => import("@/pages/student/Mess"));

// Shared
const Notifications = () => L(() => import("@/pages/shared/Notifications"));
const PortalSelection = () => L(() => import("@/pages/PortalSelection"));
const LoginPage = () => L(() => import("@/pages/Login"));

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
