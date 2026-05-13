import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  // Ensure the app is always in light mode
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    localStorage.setItem("theme", "light");
  }, []);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="min-h-screen flex bg-[#fafafa] transition-colors duration-300">
      {isLoggedIn && !isAuthPage && (
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        {!isAuthPage && (
          <Navbar onToggleSidebar={toggleSidebar} />
        )}
        <main className={`flex-1 w-full ${isAuthPage ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 md:pb-8 pt-0"} overflow-y-auto`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
