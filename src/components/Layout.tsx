
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            {user.role === "admin" ? "Schedule Sync - Admin Hub" : "Faculty Timetable Portal"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                {user.name} 
                {user.role === "faculty" && ` (${user.department})`}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-blue-800 hover:bg-blue-900 text-white border-blue-600"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-100 py-4 text-center text-gray-600 border-t">
        <div className="container mx-auto">
          <p>Schedule Sync Faculty Hub &copy; {new Date().getFullYear()} - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
