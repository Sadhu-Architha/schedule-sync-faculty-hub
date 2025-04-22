import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare } from "lucide-react";
import { mockFaculty, initializeMockTimetables, initializeMessageSystem } from "@/utils/mockData";
import AddFacultyDialog from "@/components/admin/AddFacultyDialog";
import { HolidayDialog } from "@/components/admin/HolidayDialog";

const User = ({ className }: { className?: string }): JSX.Element => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};

interface Faculty {
  id: string;
  name: string;
  department: string;
  specialization: string;
  role: string;
  email: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("faculty");
  const [registeredFaculty, setRegisteredFaculty] = useState<Faculty[]>([]);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("facultyTimetables")) {
      localStorage.setItem("facultyTimetables", JSON.stringify(initializeMockTimetables()));
    }
    
    if (!localStorage.getItem("messageSystem")) {
      localStorage.setItem("messageSystem", JSON.stringify(initializeMessageSystem()));
    }
    
    const storedUsers = localStorage.getItem("registeredUsers");
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    setRegisteredFaculty(users);
    
    const messageSystem = JSON.parse(localStorage.getItem("messageSystem") || "{}");
    const unreadCount = (messageSystem.messages || []).filter((msg: any) => !msg.read).length;
    setMessageCount(unreadCount);
  }, []);

  const handleViewTimetables = () => {
    navigate("/admin/timetables");
  };

  const handleViewMessages = () => {
    navigate("/admin/messages");
  };

  const refreshFacultyList = () => {
    const storedUsers = localStorage.getItem("registeredUsers");
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    setRegisteredFaculty(users);
  };

  const allFaculty = [...mockFaculty, ...registeredFaculty];
  
  const totalClasses = 9 * allFaculty.length;
  const deptStats = allFaculty.reduce((acc: Record<string, number>, faculty) => {
    acc[faculty.department] = (acc[faculty.department] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-md">
            <CardHeader className="bg-blue-50 pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Total Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-blue-600">{totalClasses}</p>
              <p className="text-sm text-gray-500 mt-1">Scheduled this week</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="bg-blue-50 pb-2">
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5 text-green-600" />
                Faculty Members
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-green-600">{allFaculty.length}</p>
              <p className="text-sm text-gray-500 mt-1">{registeredFaculty.length} newly registered</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="bg-blue-50 pb-2">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-amber-600" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-amber-600">{messageCount}</p>
                <Badge variant="outline" className="ml-2 bg-amber-50">Unread</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Requiring attention</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle>Smart Timetable Management</CardTitle>
            <CardDescription className="text-blue-100">
              Handle faculty schedules and optimize resource allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Button 
                onClick={handleViewTimetables}
                className="h-auto py-6 px-4 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
              >
                <Calendar className="h-8 w-8 mb-3" />
                <div className="text-center">
                  <h3 className="font-semibold mb-1">View Timetables</h3>
                  <p className="text-xs text-blue-600 font-normal">
                    Manage faculty schedules
                  </p>
                </div>
              </Button>
              
              <Button 
                onClick={handleViewMessages}
                className="h-auto py-6 px-4 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
              >
                <MessageSquare className="h-8 w-8 mb-3" />
                <div className="text-center">
                  <h3 className="font-semibold mb-1">Messages</h3>
                  <p className="text-xs text-blue-600 font-normal">
                    {messageCount} requests pending
                  </p>
                </div>
              </Button>
              
              <HolidayDialog />
              
              <Button 
                className="h-auto py-6 px-4 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
                onClick={() => navigate("/admin/conflicts")}
              >
                <User className="h-8 w-8 mb-3" />
                <div className="text-center">
                  <h3 className="font-semibold mb-1">Faculty Workload</h3>
                  <p className="text-xs text-blue-600 font-normal">
                    Balance teaching load
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="faculty">Faculty Directory</TabsTrigger>
                <TabsTrigger value="departments">Department Stats</TabsTrigger>
              </TabsList>
            </Tabs>
            <AddFacultyDialog onFacultyAdded={refreshFacultyList} />
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="faculty" className="mt-0">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-blue-100 text-blue-900">
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Department</th>
                        <th className="px-4 py-3 text-left">Specialization</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allFaculty.map((faculty, index) => (
                        <tr 
                          key={faculty.id}
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-4 py-3 border-t">{faculty.name}</td>
                          <td className="px-4 py-3 border-t">{faculty.department}</td>
                          <td className="px-4 py-3 border-t">{faculty.specialization}</td>
                          <td className="px-4 py-3 border-t">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              Registered
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="departments" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(deptStats).map(([dept, count]) => (
                    <Card key={dept} className="bg-gray-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-600">{dept}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-blue-700">{count}</p>
                        <p className="text-xs text-gray-500">Faculty members</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
