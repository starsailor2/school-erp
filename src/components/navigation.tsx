import type { Role, TeacherType, StaffRole } from "@/types";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GradingIcon from "@mui/icons-material/Grading";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PaymentIcon from "@mui/icons-material/Payment";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import HotelIcon from "@mui/icons-material/Hotel";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CampaignIcon from "@mui/icons-material/Campaign";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TaskIcon from "@mui/icons-material/Task";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import GroupsIcon from "@mui/icons-material/Groups";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ChatIcon from "@mui/icons-material/Chat";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import EventIcon from "@mui/icons-material/Event";
import type { ReactNode } from "react";
import { canViewFeature } from "@/data/staffPermissions";

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  group?: string;
  children?: { label: string; path: string }[];
}

export function getNavItems(role: Role, teacherType?: TeacherType, staffRole?: StaffRole): NavItem[] {
  switch (role) {
    case "admin":
      return [
        { label: "Dashboard", path: "/admin", icon: <DashboardIcon />, group: "Academics" },
        {
          label: "Students", path: "/admin/students", icon: <PeopleIcon />, group: "Academics",
          children: [
            { label: "Student Directory", path: "/admin/students" },
            { label: "Admissions", path: "/admin/students/admissions" },
            { label: "Parent Linking", path: "/admin/students/parents" },
            { label: "Student Transfer", path: "/admin/students/transfer" },
            { label: "Student Documents", path: "/admin/students/documents" },
          ],
        },
        {
          label: "Teachers", path: "/admin/teachers", icon: <SchoolIcon />, group: "Academics",
          children: [
            { label: "Teacher Directory", path: "/admin/teachers" },
            { label: "Subject Allocation", path: "/admin/teachers/subjects" },
            { label: "Class Teacher Assignment", path: "/admin/teachers/class-assign" },
            { label: "HOD Assignment", path: "/admin/teachers/hod-assign" },
          ],
        },
        {
          label: "Academics", path: "/admin/academics/classes", icon: <ClassIcon />, group: "Academics",
          children: [
            { label: "Classes", path: "/admin/academics/classes" },
            { label: "Sections", path: "/admin/academics/sections" },
            { label: "Subjects", path: "/admin/academics/subjects" },
            { label: "Timetable", path: "/admin/academics/timetable" },
          ],
        },
        {
          label: "Attendance", path: "/admin/attendance/students", icon: <EventNoteIcon />, group: "Academics",
          children: [
            { label: "Student Attendance", path: "/admin/attendance/students" },
            { label: "Teacher Attendance", path: "/admin/attendance/teachers" },
            { label: "Attendance Reports", path: "/admin/attendance/reports" },
            { label: "Attendance Analytics", path: "/admin/attendance/analytics" },
          ],
        },
        {
          label: "Homework", path: "/admin/homework", icon: <AssignmentIcon />, group: "Academics",
          children: [
            { label: "Homework Monitor", path: "/admin/homework" },
            { label: "Homework Reports", path: "/admin/homework/reports" },
          ],
        },
        {
          label: "Examinations", path: "/admin/exams", icon: <GradingIcon />, group: "Academics",
          children: [
            { label: "Exam Setup", path: "/admin/exams" },
            { label: "Exam Schedule", path: "/admin/exams/schedule" },
            { label: "Marks Overview", path: "/admin/exams/marks" },
            { label: "Report Cards", path: "/admin/exams/report-cards" },
            { label: "Exam Analytics", path: "/admin/exams/analytics" },
          ],
        },
        {
          label: "Fees", path: "/admin/fees", icon: <PaymentIcon />, group: "Finance",
          children: [
            { label: "Fee Structure", path: "/admin/fees" },
            { label: "Fee Collection", path: "/admin/fees/collection" },
            { label: "Defaulters", path: "/admin/fees/defaulters" },
            { label: "Payment Reports", path: "/admin/fees/reports" },
          ],
        },
        {
          label: "Transport", path: "/admin/transport", icon: <DirectionsBusIcon />, group: "Operations",
          children: [
            { label: "Routes", path: "/admin/transport" },
            { label: "Vehicles", path: "/admin/transport/vehicles" },
            { label: "Drivers", path: "/admin/transport/drivers" },
            { label: "Student Allocation", path: "/admin/transport/allocation" },
          ],
        },
        {
          label: "Hostel", path: "/admin/hostel", icon: <HotelIcon />, group: "Operations",
          children: [
            { label: "Hostel Dashboard", path: "/admin/hostel" },
            { label: "Blocks & Rooms", path: "/admin/hostel/rooms" },
            { label: "Room Allocation", path: "/admin/hostel/allocation" },
            { label: "Hostel Fee Structure", path: "/admin/hostel/fees" },
          ],
        },
        {
          label: "Mess", path: "/admin/mess", icon: <RestaurantIcon />, group: "Operations",
          children: [
            { label: "Mess Dashboard", path: "/admin/mess" },
            { label: "Weekly Menu", path: "/admin/mess/menu" },
            { label: "Mess Plans", path: "/admin/mess/plans" },
            { label: "Mess Billing", path: "/admin/mess/billing" },
          ],
        },
        {
          label: "Communication", path: "/admin/communication/announcements", icon: <CampaignIcon />, group: "Engagement",
          children: [
            { label: "Announcements", path: "/admin/communication/announcements" },
            { label: "Notices", path: "/admin/communication/notices" },
            { label: "Messages", path: "/admin/communication/messages" },
            { label: "Parent Notifications", path: "/admin/communication/parent-notifications" },
          ],
        },
        {
          label: "School Staff", path: "/admin/staff", icon: <GroupsIcon />, group: "Administration",
          children: [
            { label: "Staff Directory", path: "/admin/staff" },
            { label: "Staff Roles", path: "/admin/staff/roles" },
            { label: "Leave Requests", path: "/admin/staff/leave" },
          ],
        },
        {
          label: "Reports", path: "/admin/reports/academic", icon: <AssessmentIcon />, group: "Administration",
          children: [
            { label: "Academic Reports", path: "/admin/reports/academic" },
            { label: "Attendance Reports", path: "/admin/reports/attendance" },
            { label: "Fee Reports", path: "/admin/reports/fees" },
            { label: "Performance Reports", path: "/admin/reports/performance" },
          ],
        },
        {
          label: "Settings", path: "/admin/settings", icon: <SettingsIcon />, group: "Administration",
          children: [
            { label: "School Profile", path: "/admin/settings" },
            { label: "Academic Year", path: "/admin/settings/academic-year" },
            { label: "Permissions", path: "/admin/settings/permissions" },
            { label: "System Settings", path: "/admin/settings/system" },
          ],
        },
      ];

    case "teacher": {
      const base: NavItem[] = [
        { label: "Dashboard", path: "/teacher", icon: <DashboardIcon /> },
        { label: "My Classes", path: "/teacher/classes", icon: <ClassIcon /> },
        { label: "My Students", path: "/teacher/students", icon: <PeopleIcon /> },
        {
          label: "Attendance", path: "/teacher/attendance", icon: <EventNoteIcon />,
          children: [
            { label: "Take Attendance", path: "/teacher/attendance" },
            { label: "Attendance History", path: "/teacher/attendance/history" },
          ],
        },
        {
          label: "Homework", path: "/teacher/homework", icon: <AssignmentIcon />,
          children: [
            { label: "Assign Homework", path: "/teacher/homework" },
            { label: "Homework List", path: "/teacher/homework/list" },
          ],
        },
        {
          label: "Exams", path: "/teacher/exams", icon: <GradingIcon />,
          children: [
            { label: "Marks Entry", path: "/teacher/exams" },
            { label: "Subject Results", path: "/teacher/exams/results" },
          ],
        },
        { label: "Timetable", path: "/teacher/timetable", icon: <ScheduleIcon /> },
        { label: "Announcements", path: "/teacher/announcements", icon: <CampaignIcon /> },
        { label: "Messages", path: "/teacher/messages", icon: <ChatIcon /> },
        { label: "Meetings", path: "/teacher/meetings", icon: <EventIcon /> },
        { label: "Leave", path: "/teacher/leave", icon: <EventBusyIcon /> },
        { label: "Profile", path: "/teacher/profile", icon: <PersonIcon /> },
      ];

      if (teacherType === "class_teacher" || teacherType === "hod") {
        base.splice(3, 0, {
          label: "Class Management", path: "/teacher/class-mgmt", icon: <GroupsIcon />,
          children: [
            { label: "My Class Overview", path: "/teacher/class-mgmt" },
            { label: "Student Performance", path: "/teacher/class-mgmt/performance" },
            { label: "Parent Communication", path: "/teacher/class-mgmt/parents" },
            { label: "Behaviour Notes", path: "/teacher/class-mgmt/behaviour" },
          ],
        });
      }

      if (teacherType === "hod") {
        base.push({
          label: "Department", path: "/teacher/department", icon: <AssessmentIcon />,
          children: [
            { label: "Department Dashboard", path: "/teacher/department" },
            { label: "Department Teachers", path: "/teacher/department/teachers" },
            { label: "Subject Allocation", path: "/teacher/department/subjects" },
            { label: "Syllabus Progress", path: "/teacher/department/syllabus" },
            { label: "Exam Review", path: "/teacher/department/exam-review" },
            { label: "Department Reports", path: "/teacher/department/reports" },
          ],
        });
      }
      return base;
    }

    case "staff": {
      const base: NavItem[] = [
        { label: "Dashboard", path: "/staff", icon: <DashboardIcon />, group: "Administration" },
        { label: "Tasks", path: "/staff/tasks", icon: <TaskIcon />, group: "Administration" },
        {
          label: "Students", path: "/staff/students", icon: <PeopleIcon />, group: "Administration",
          children: [
            { label: "Student Lookup", path: "/staff/students" },
            { label: "Student Requests", path: "/staff/students/requests" },
            { label: "Student Fee History", path: "/staff/students/fee-history" },
          ],
        },
      ];

      if (staffRole && canViewFeature(staffRole, "fees")) {
        base.push({
          label: "Fees", path: "/staff/fees/collection", icon: <PaymentIcon />, group: "Finance",
          children: [
            { label: "Fee Collection", path: "/staff/fees/collection" },
            { label: "Payment Records", path: "/staff/fees/records" },
            { label: "Defaulters", path: "/staff/fees/defaulters" },
            { label: "Receipts", path: "/staff/fees/receipts" },
            { label: "Fee Structure", path: "/staff/fees/structure" },
          ],
        });
      }

      if (staffRole && canViewFeature(staffRole, "transport")) {
        base.push({
          label: "Transport", path: "/staff/transport/routes", icon: <DirectionsBusIcon />, group: "Operations",
          children: [
            { label: "Routes", path: "/staff/transport/routes" },
            { label: "Vehicles", path: "/staff/transport/vehicles" },
            { label: "Drivers", path: "/staff/transport/drivers" },
            { label: "Student Transport List", path: "/staff/transport/students" },
            { label: "Transport Reports", path: "/staff/transport/reports" },
          ],
        });
      }

      if (staffRole && canViewFeature(staffRole, "library")) {
        base.push({
          label: "Library", path: "/staff/library/books", icon: <MenuBookIcon />, group: "Operations",
          children: [
            { label: "Books", path: "/staff/library/books" },
            { label: "Book Categories", path: "/staff/library/categories" },
            { label: "Issue Book", path: "/staff/library/issue" },
            { label: "Return Book", path: "/staff/library/return" },
            { label: "Library Records", path: "/staff/library/records" },
          ],
        });
      }

      if (staffRole && canViewFeature(staffRole, "hostel")) {
        base.push({
          label: "Hostel", path: "/staff/hostel/allocation", icon: <HotelIcon />, group: "Operations",
          children: [
            { label: "Room Allocation", path: "/staff/hostel/allocation" },
            { label: "Roster", path: "/staff/hostel/roster" },
          ],
        });
      }

      if (staffRole && canViewFeature(staffRole, "mess")) {
        base.push({
          label: "Mess", path: "/staff/mess/attendance", icon: <RestaurantIcon />, group: "Operations",
          children: [
            { label: "Daily Attendance", path: "/staff/mess/attendance" },
            { label: "Weekly Menu", path: "/staff/mess/menu" },
          ],
        });
      }

      if (staffRole === "office_staff") {
        base.push(
          { label: "Certificates", path: "/staff/certificates", icon: <ReceiptIcon />, group: "Administration" },
          { label: "ID Card Requests", path: "/staff/id-cards", icon: <ReceiptIcon />, group: "Administration" },
        );
      }

      base.push(
        { label: "Communication", path: "/staff/communication", icon: <CampaignIcon />, group: "Administration",
          children: [
            { label: "Notices", path: "/staff/communication" },
            { label: "Messages", path: "/staff/communication/messages" },
          ],
        },
        { label: "Reports", path: "/staff/reports", icon: <AssessmentIcon />, group: "Administration" },
        { label: "Leave", path: "/staff/leave", icon: <EventBusyIcon />, group: "Administration" },
        { label: "Profile", path: "/staff/profile", icon: <PersonIcon />, group: "Administration" },
      );
      return base;
    }

    case "parent":
      return [
        { label: "Dashboard", path: "/parent", icon: <DashboardIcon /> },
        { label: "My Children", path: "/parent/children", icon: <ChildCareIcon /> },
        { label: "Attendance", path: "/parent/attendance", icon: <EventNoteIcon /> },
        { label: "Homework", path: "/parent/homework", icon: <AssignmentIcon /> },
        { label: "Timetable", path: "/parent/timetable", icon: <ScheduleIcon /> },
        { label: "Exams & Results", path: "/parent/exams", icon: <GradingIcon /> },
        { label: "Fees", path: "/parent/fees", icon: <PaymentIcon /> },
        { label: "Transport", path: "/parent/transport", icon: <DirectionsBusIcon /> },
        { label: "My Hostel", path: "/parent/hostel", icon: <HotelIcon /> },
        { label: "My Mess", path: "/parent/mess", icon: <RestaurantIcon /> },
        { label: "Announcements", path: "/parent/announcements", icon: <CampaignIcon /> },
        { label: "Messages", path: "/parent/messages", icon: <ChatIcon /> },
        { label: "Meetings", path: "/parent/meetings", icon: <EventIcon /> },
        { label: "Profile", path: "/parent/profile", icon: <PersonIcon /> },
      ];

    case "student":
      return [
        { label: "Dashboard", path: "/student", icon: <DashboardIcon /> },
        { label: "My Profile", path: "/student/profile", icon: <PersonIcon /> },
        { label: "Attendance", path: "/student/attendance", icon: <EventNoteIcon /> },
        { label: "Homework", path: "/student/homework", icon: <AssignmentIcon /> },
        { label: "Timetable", path: "/student/timetable", icon: <ScheduleIcon /> },
        { label: "Exams & Results", path: "/student/exams", icon: <GradingIcon /> },
        { label: "Announcements", path: "/student/announcements", icon: <CampaignIcon /> },
        { label: "Messages", path: "/student/messages", icon: <ChatIcon /> },
        { label: "Library", path: "/student/library", icon: <MenuBookIcon /> },
        { label: "Transport", path: "/student/transport", icon: <DirectionsBusIcon /> },
        { label: "My Hostel", path: "/student/hostel", icon: <HotelIcon /> },
        { label: "My Mess", path: "/student/mess", icon: <RestaurantIcon /> },
      ];
  }
}
