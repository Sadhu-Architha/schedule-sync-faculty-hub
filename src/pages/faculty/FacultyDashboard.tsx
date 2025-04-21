
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Calendar, MessageSquare, Printer } from "lucide-react";

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (user) {
      const facultyTimetables = JSON.parse(localStorage.getItem("facultyTimetables") || "{}");
      setTimetable(facultyTimetables[user.id] || []);
      setIsLoading(false);
    }
  }, [user]);

  const handlePrintTimetable = () => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast({
        title: "Print Error",
        description: "Unable to open print window. Please check your popup settings.",
        variant: "destructive",
      });
      return;
    }
    
    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Faculty Timetable - ${user?.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #1e40af; color: white; padding: 10px; text-align: left; }
          td { border: 1px solid #ddd; padding: 10px; }
          .faculty-info { margin-bottom: 20px; }
          .faculty-info p { margin: 5px 0; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="padding: 10px 15px; background: #1e40af; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px;">Print Timetable</button>
        <h1>Faculty Timetable</h1>
        <div class="faculty-info">
          <p><strong>Name:</strong> ${user?.name}</p>
          <p><strong>Department:</strong> ${user?.department}</p>
          <p><strong>Specialization:</strong> ${user?.specialization}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            ${timetable.map(entry => `
              <tr>
                <td>${entry.day}</td>
                <td>${entry.timeSlot}</td>
                <td>${entry.subject}</td>
                <td>${entry.class}</td>
                <td>${entry.room}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: "Message Error",
        description: "Please enter a message before sending",
        variant: "destructive",
      });
      return;
    }

    // Get existing messages from localStorage
    const messageSystem = JSON.parse(localStorage.getItem("messageSystem") || "{}");
    const messages = messageSystem.messages || [];
    
    // Add new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      from: user?.id,
      fromName: user?.name,
      subject: "Timetable Concern",
      message: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Save updated messages to localStorage
    localStorage.setItem("messageSystem", JSON.stringify({
      ...messageSystem,
      messages: [...messages, newMessage]
    }));
    
    // Clear message text and show success toast
    setMessageText("");
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the administrator",
    });
  };

  // Group timetable entries by day
  const timetableByDay = timetable.reduce((acc, entry) => {
    if (!acc[entry.day]) {
      acc[entry.day] = [];
    }
    acc[entry.day].push(entry);
    return acc;
  }, {});

  // Sort days in correct order
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const sortedDays = Object.keys(timetableByDay).sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center min-h-[60vh]">
            <p className="text-gray-500">Loading timetable...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-800">
            <Calendar className="inline-block mr-2 h-6 w-6" />
            My Timetable
          </h2>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Contact Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Message to Administrator</DialogTitle>
                  <DialogDescription>
                    Send a message to the administrator about your timetable concerns or requests.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    className="min-h-[120px]"
                    placeholder="Describe your concern or request..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSendMessage}>
                    Send Message
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={handlePrintTimetable}
              className="bg-blue-700 hover:bg-blue-800"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Timetable
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="bg-blue-50">
            <CardTitle>Faculty Information</CardTitle>
            <CardDescription>
              Your teaching profile and specialization
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <p className="text-lg font-medium">{user?.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Department</h4>
                <p className="text-lg font-medium">{user?.department}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Specialization</h4>
                <p className="text-lg font-medium">{user?.specialization}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
              {timetable.length} classes scheduled this week
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue={sortedDays[0] || "Monday"}>
              <TabsList className="mb-6 flex flex-wrap">
                {sortedDays.map((day) => (
                  <TabsTrigger key={day} value={day}>
                    {day}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {sortedDays.map((day) => (
                <TabsContent key={day} value={day}>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-blue-100 text-blue-900">
                        <tr>
                          <th className="px-4 py-3 text-left">Time</th>
                          <th className="px-4 py-3 text-left">Subject</th>
                          <th className="px-4 py-3 text-left">Class</th>
                          <th className="px-4 py-3 text-left">Room</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timetableByDay[day]
                          .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                          .map((entry, index) => (
                            <tr 
                              key={`${day}-${index}`}
                              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            >
                              <td className="px-4 py-3 border-t">{entry.timeSlot}</td>
                              <td className="px-4 py-3 border-t font-medium">{entry.subject}</td>
                              <td className="px-4 py-3 border-t">{entry.class}</td>
                              <td className="px-4 py-3 border-t">{entry.room}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FacultyDashboard;
