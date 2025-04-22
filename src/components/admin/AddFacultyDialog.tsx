
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { generateFacultySchedule } from "@/utils/timetableGenerator";

interface AddFacultyDialogProps {
  onFacultyAdded: () => void;
}

const AddFacultyDialog: React.FC<AddFacultyDialogProps> = ({ onFacultyAdded }) => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [specialization, setSpecialization] = React.useState("");
  const { toast } = useToast();

  const departments = [
    "Computer Science",
    "Electrical Engineering",
    "Electronics",
    "Civil Engineering",
    "Mechanical Engineering",
    "Information Technology"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFaculty = {
      id: `faculty-${Date.now()}`,
      name,
      email,
      role: "faculty",
      department,
      specialization
    };

    // Save to registered users
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    localStorage.setItem("registeredUsers", JSON.stringify([...registeredUsers, newFaculty]));

    // Generate and save timetable
    const timetables = JSON.parse(localStorage.getItem("facultyTimetables") || "{}");
    timetables[newFaculty.id] = generateFacultySchedule(newFaculty);
    localStorage.setItem("facultyTimetables", JSON.stringify(timetables));

    toast({
      title: "Faculty Added",
      description: "New faculty member has been added successfully",
    });

    // Reset form
    setName("");
    setEmail("");
    setDepartment("");
    setSpecialization("");
    onFacultyAdded();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mb-6">Add New Faculty</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Faculty Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Rajesh Kumar"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@university.edu"
              required
            />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g., Machine Learning"
              required
            />
          </div>
          <Button type="submit" className="w-full">Add Faculty</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFacultyDialog;
