
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { generateFacultySchedule } from "@/utils/timetableGenerator";

type UserRole = "admin" | "faculty";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  specialization?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: {
    name: string;
    email: string;
    password: string;
    department: string;
    specialization: string;
  }) => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Admin user that is always available
const adminUser: User = {
  id: "admin-1",
  name: "Administrator",
  email: "admin@university.edu",
  role: "admin",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  // Load user data from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Load registered users from localStorage
  const getRegisteredUsers = (): User[] => {
    const users = localStorage.getItem("registeredUsers");
    return users ? JSON.parse(users) : [];
  };

  // Save user to registered users
  const saveRegisteredUser = (newUser: User) => {
    const users = getRegisteredUsers();
    localStorage.setItem("registeredUsers", JSON.stringify([...users, newUser]));
  };

  // Login function to authenticate users
  const login = async (email: string, password: string) => {
    // Check if it's the admin
    if (email === adminUser.email) {
      setUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(adminUser));
      navigate("/admin/dashboard");
      return;
    }

    // Check registered users
    const registeredUsers = getRegisteredUsers();
    const foundUser = registeredUsers.find(user => user.email === email);

    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      
      // Check if faculty has a timetable, if not generate one
      const timetables = JSON.parse(localStorage.getItem("facultyTimetables") || "{}");
      if (!timetables[foundUser.id]) {
        const newSchedule = generateFacultySchedule(foundUser);
        timetables[foundUser.id] = newSchedule;
        localStorage.setItem("facultyTimetables", JSON.stringify(timetables));
      }
      
      navigate("/faculty/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  // Register new faculty
  const register = async (data: {
    name: string;
    email: string;
    password: string;
    department: string;
    specialization: string;
  }) => {
    const newUser: User = {
      id: `faculty-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: "faculty",
      department: data.department,
      specialization: data.specialization,
    };

    // Save to localStorage
    saveRegisteredUser(newUser);
    
    // Generate timetable for the new faculty
    const timetables = JSON.parse(localStorage.getItem("facultyTimetables") || "{}");
    timetables[newUser.id] = generateFacultySchedule(newUser);
    localStorage.setItem("facultyTimetables", JSON.stringify(timetables));

    toast({
      title: "Registration Successful",
      description: "You can now login with your credentials",
    });
    
    navigate("/login");
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
