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
  const showNavbar = !isAuthPage;
  const showSidebar = isLoggedIn && !isAuthPage;
  const useAppPadding = isLoggedIn && !isAuthPage;

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="h-screen flex bg-[#F8F9FB] overflow-hidden">
      {showSidebar && (
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      )}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {showNavbar && (
          <Navbar onToggleSidebar={toggleSidebar} />
        )}
        <main className={`flex-1 w-full overflow-y-auto ${useAppPadding ? "p-4 lg:p-6" : ""}`}>
          <div className={`${useAppPadding ? "h-full" : ""}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
