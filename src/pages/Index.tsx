
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { mockFaculty, initializeMockTimetables, initializeMessageSystem } from "@/utils/mockData";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Initialize mock data on first load if not already present
    if (!localStorage.getItem("facultyTimetables")) {
      localStorage.setItem("facultyTimetables", JSON.stringify(initializeMockTimetables()));
    }
    
    if (!localStorage.getItem("messageSystem")) {
      localStorage.setItem("messageSystem", JSON.stringify(initializeMessageSystem()));
    }
    
    // Initialize mock faculty data
    if (!localStorage.getItem("registeredUsers")) {
      localStorage.setItem("registeredUsers", JSON.stringify([]));
    }
    
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/faculty/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 py-4">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold">Schedule Sync</h1>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/login")}
                className="bg-blue-800 hover:bg-blue-900 text-white border-blue-600"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate("/signup")}
                className="bg-white hover:bg-gray-100 text-blue-700"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              Faculty Timetable Management System
            </h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto mb-10">
              Streamline your teaching schedule with our advanced timetable management system. 
              Avoid conflicts, balance workload, and focus on what matters most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
              >
                Faculty Login
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/signup")}
                className="border-blue-600 text-blue-700 hover:bg-blue-50 text-lg px-8"
              >
                New Faculty Registration
              </Button>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
              Smart Scheduling Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-3">Smart Timetable Generation</h3>
                <p className="text-blue-700">
                  Automatic class scheduling with intelligent algorithms to avoid conflicts and optimize resource usage.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-3">Faculty Workload Balancing</h3>
                <p className="text-blue-700">
                  Ensure fair distribution of teaching hours and responsibilities across all faculty members.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-3">Classroom Optimization</h3>
                <p className="text-blue-700">
                  Efficiently allocate classrooms based on class size, equipment needs, and faculty preferences.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-3">Conflict Detection & Resolution</h3>
                <p className="text-blue-700">
                  Automatically identify and resolve scheduling conflicts before they impact teaching.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-3">Predictive Scheduling</h3>
                <p className="text-blue-700">
                  Machine learning algorithms that learn from past schedules to optimize future timetables.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-3">Smart Notifications</h3>
                <p className="text-blue-700">
                  Automated alerts for schedule changes, upcoming classes, and administrative updates.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Schedule Sync Faculty Hub</h3>
            <p className="mb-6">A comprehensive solution for academic timetable management</p>
            <p className="text-blue-300 text-sm">
              &copy; {new Date().getFullYear()} Schedule Sync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
