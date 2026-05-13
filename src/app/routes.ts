import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import LessonDetail from "./pages/LessonDetail";
import CourseDetail from "./pages/CourseDetail";
import NewsDetail from "./pages/NewsDetail";
import Courses from "./pages/Courses";
import News from "./pages/News";
import Feedback from "./pages/Feedback";
import Layout from "./components/common/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "admin", Component: AdminDashboard },
      { path: "teacher", Component: TeacherDashboard },
      { path: "student", Component: StudentDashboard },
      { path: "lesson/:id", Component: LessonDetail },
      { path: "course/:id", Component: CourseDetail },
      { path: "news/:id", Component: NewsDetail },
      { path: "courses", Component: Courses },
      { path: "news", Component: News },
      { path: "feedback", Component: Feedback },
    ],
  },
]);
