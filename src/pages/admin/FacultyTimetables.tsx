
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { mockFaculty } from "@/utils/mockData";
import { regenerateFacultyTimetable } from "@/utils/timetableGenerator";
import { ArrowLeft, Edit, Printer } from "lucide-react";

const FacultyTimetables = () => {
  const navigate = useNavigate();
  const [allFaculty, setAllFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [facultyTimetables, setFacultyTimetables] = useState({});
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load registered faculty from localStorage
    const storedUsers = localStorage.getItem("registeredUsers");
    const registeredFaculty = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Combine with mock faculty
    setAllFaculty([...mockFaculty, ...registeredFaculty]);
    
    // Load timetables
    const timetables = JSON.parse(localStorage.getItem("facultyTimetables") || "{}");
    setFacultyTimetables(timetables);
  }, []);

  const handleFacultySelect = (facultyId) => {
    const faculty = allFaculty.find(f => f.id === facultyId);
    setSelectedFaculty(faculty);
    
    if (faculty && facultyTimetables[faculty.id]) {
      setTimetable(facultyTimetables[faculty.id]);
    } else {
      setTimetable([]);
    }
  };

  const handleBack = () => {
    navigate("/admin/dashboard");
  };

  const handleRegenerateTimetable = () => {
    if (!selectedFaculty) return;
    
    // Generate new timetable
    const newTimetable = regenerateFacultyTimetable(selectedFaculty);
    
    // Update state and localStorage
    const updatedTimetables = { ...facultyTimetables, [selectedFaculty.id]: newTimetable };
    setTimetable(newTimetable);
    setFacultyTimetables(updatedTimetables);
    localStorage.setItem("facultyTimetables", JSON.stringify(updatedTimetables));
    
    toast({
      title: "Timetable Regenerated",
      description: `New schedule created for ${selectedFaculty.name}`,
    });
  };

  const handleEditEntry = (entry) => {
    setEditingEntry({
      ...entry,
      originalDay: entry.day,
      originalTimeSlot: entry.timeSlot
    });
  };

  const handleUpdateEntry = () => {
    if (!editingEntry || !selectedFaculty) return;
    
    // Create updated timetable
    const updatedTimetable = timetable.map(entry => {
      if (
        entry.day === editingEntry.originalDay && 
        entry.timeSlot === editingEntry.originalTimeSlot
      ) {
        return {
          day: editingEntry.day,
          timeSlot: editingEntry.timeSlot,
          subject: editingEntry.subject,
          class: editingEntry.class,
          room: editingEntry.room
        };
      }
      return entry;
    });
    
    // Update state and localStorage
    setTimetable(updatedTimetable);
    const updatedTimetables = { 
      ...facultyTimetables, 
      [selectedFaculty.id]: updatedTimetable 
    };
    setFacultyTimetables(updatedTimetables);
    localStorage.setItem("facultyTimetables", JSON.stringify(updatedTimetables));
    
    // Clear editing state
    setEditingEntry(null);
    
    toast({
      title: "Timetable Updated",
      description: "Class schedule has been modified",
    });
  };

  const handlePrintTimetable = () => {
    if (!selectedFaculty) return;
    
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
        <title>Faculty Timetable - ${selectedFaculty.name}</title>
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
        <h1>Faculty Timetable - Admin View</h1>
        <div class="faculty-info">
          <p><strong>Name:</strong> ${selectedFaculty.name}</p>
          <p><strong>Department:</strong> ${selectedFaculty.department}</p>
          <p><strong>Specialization:</strong> ${selectedFaculty.specialization}</p>
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

  // Filter faculty based on search query
  const filteredFaculty = allFaculty.filter(faculty => 
    faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faculty.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faculty.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Day options for edit dialog
  const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Time slot options for edit dialog
  const timeSlotOptions = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM"
  ];

  // Get subject options based on selected faculty's department
  const getSubjectOptions = () => {
    if (!selectedFaculty) return [];
    
    const departmentSubjects = {
      "Computer Science": [
        "Data Structures and Algorithms",
        "Operating Systems",
        "Computer Networks",
        "Database Management Systems",
        "Object-Oriented Programming",
        "Machine Learning / AI",
        "Web Technologies",
        "Software Engineering",
        "Compiler Design"
      ],
      "Electrical Engineering": [
        "Electrical Circuits",
        "Control Systems",
        "Power Systems",
        "Electrical Machines",
        "Analog & Digital Electronics",
        "Power Electronics",
        "Signals and Systems",
        "Microprocessors and Microcontrollers"
      ],
      "Electronics": [
        "Analog & Digital Communication",
        "Signal Processing",
        "VLSI Design",
        "Embedded Systems",
        "Electromagnetic Theory",
        "Antennas and Wave Propagation",
        "Microcontrollers",
        "Network Theory"
      ],
      "Civil Engineering": [
        "Structural Analysis",
        "Construction Materials",
        "Concrete Technology",
        "Geotechnical Engineering",
        "Surveying",
        "Transportation Engineering",
        "Hydraulics & Water Resources",
        "Environmental Engineering"
      ],
      "Mechanical Engineering": [
        "Thermodynamics",
        "Fluid Mechanics",
        "Strength of Materials",
        "Theory of Machines",
        "Manufacturing Processes",
        "Heat Transfer",
        "Machine Design",
        "Dynamics of Machinery"
      ],
      "Information Technology": [
        "Computer Programming",
        "Data Mining",
        "Cloud Computing",
        "Cyber Security",
        "Natural Language Processing",
        "Deep Learning",
        "Big Data Analytics",
        "Blockchain Technology"
      ]
    };
    
    return departmentSubjects[selectedFaculty.department] || [];
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-blue-800">Faculty Timetables</h2>
          </div>
          
          {selectedFaculty && (
            <div className="flex gap-3">
              <Button 
                onClick={handleRegenerateTimetable}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!selectedFaculty}
              >
                Regenerate Timetable
              </Button>
              
              <Button 
                onClick={handlePrintTimetable}
                variant="outline"
                disabled={!selectedFaculty}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg">Faculty Directory</CardTitle>
              <CardDescription>
                Select a faculty member to view timetable
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Input
                placeholder="Search faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              
              <div className="overflow-auto max-h-[600px] pr-2">
                <div className="space-y-2">
                  {filteredFaculty.map((faculty) => (
                    <div
                      key={faculty.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedFaculty?.id === faculty.id
                          ? "bg-blue-100 border-blue-300 border"
                          : "bg-gray-50 hover:bg-blue-50 border border-transparent"
                      }`}
                      onClick={() => handleFacultySelect(faculty.id)}
                    >
                      <div className="font-medium">{faculty.name}</div>
                      <div className="text-sm text-gray-500">{faculty.department}</div>
                      <div className="text-xs text-gray-400 mt-1">{faculty.specialization}</div>
                    </div>
                  ))}
                  
                  {filteredFaculty.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      No faculty members found
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg">
                {selectedFaculty ? `${selectedFaculty.name}'s Timetable` : "Select a Faculty Member"}
              </CardTitle>
              <CardDescription>
                {selectedFaculty 
                  ? `${selectedFaculty.department} - ${selectedFaculty.specialization}` 
                  : "View and manage class schedules"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedFaculty ? (
                timetable.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-blue-100 text-blue-900">
                        <tr>
                          <th className="px-4 py-3 text-left">Day</th>
                          <th className="px-4 py-3 text-left">Time</th>
                          <th className="px-4 py-3 text-left">Subject</th>
                          <th className="px-4 py-3 text-left">Class</th>
                          <th className="px-4 py-3 text-left">Room</th>
                          <th className="px-4 py-3 text-left w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timetable.map((entry, index) => (
                          <tr 
                            key={index}
                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            <td className="px-4 py-3 border-t">{entry.day}</td>
                            <td className="px-4 py-3 border-t">{entry.timeSlot}</td>
                            <td className="px-4 py-3 border-t font-medium">{entry.subject}</td>
                            <td className="px-4 py-3 border-t">{entry.class}</td>
                            <td className="px-4 py-3 border-t">{entry.room}</td>
                            <td className="px-4 py-3 border-t">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleEditEntry(entry)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Class Schedule</DialogTitle>
                                    <DialogDescription>
                                      Modify details for this class session.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {editingEntry && (
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Day</Label>
                                        <div className="col-span-3">
                                          <Select
                                            value={editingEntry.day}
                                            onValueChange={(value) => 
                                              setEditingEntry({...editingEntry, day: value})
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select day" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {dayOptions.map(day => (
                                                <SelectItem key={day} value={day}>
                                                  {day}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Time</Label>
                                        <div className="col-span-3">
                                          <Select
                                            value={editingEntry.timeSlot}
                                            onValueChange={(value) => 
                                              setEditingEntry({...editingEntry, timeSlot: value})
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {timeSlotOptions.map(time => (
                                                <SelectItem key={time} value={time}>
                                                  {time}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Subject</Label>
                                        <div className="col-span-3">
                                          <Select
                                            value={editingEntry.subject}
                                            onValueChange={(value) => 
                                              setEditingEntry({...editingEntry, subject: value})
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {getSubjectOptions().map(subject => (
                                                <SelectItem key={subject} value={subject}>
                                                  {subject}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Room</Label>
                                        <Input
                                          className="col-span-3"
                                          value={editingEntry.room}
                                          onChange={(e) => 
                                            setEditingEntry({
                                              ...editingEntry, 
                                              room: e.target.value
                                            })
                                          }
                                        />
                                      </div>
                                      
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Class</Label>
                                        <Input
                                          className="col-span-3"
                                          value={editingEntry.class}
                                          onChange={(e) => 
                                            setEditingEntry({
                                              ...editingEntry, 
                                              class: e.target.value
                                            })
                                          }
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  <DialogFooter>
                                    <Button onClick={handleUpdateEntry}>
                                      Update Class
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No timetable available. Generate one now.</p>
                    <Button onClick={handleRegenerateTimetable} className="mt-4">
                      Generate Timetable
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Select a faculty member from the list to view or edit their timetable.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

// Label component for this file only
const Label = ({ className, children, ...props }) => {
  return (
    <label className={`text-sm font-medium leading-none ${className || ""}`} {...props}>
      {children}
    </label>
  );
};

export default FacultyTimetables;
