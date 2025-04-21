
import { generateFacultySchedule } from "./timetableGenerator";

// Subject data by department
export const subjectsByDepartment = {
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

// Mock faculty data
export const mockFaculty = [
  {
    id: "faculty-1",
    name: "Dr. John Smith",
    email: "john.smith@university.edu",
    role: "faculty",
    department: "Computer Science",
    specialization: "Artificial Intelligence"
  },
  {
    id: "faculty-2",
    name: "Dr. Emily Johnson",
    email: "emily.johnson@university.edu",
    role: "faculty",
    department: "Electrical Engineering",
    specialization: "Power Systems"
  },
  {
    id: "faculty-3",
    name: "Dr. Michael Chen",
    email: "michael.chen@university.edu",
    role: "faculty",
    department: "Electronics",
    specialization: "VLSI Design"
  },
  {
    id: "faculty-4",
    name: "Dr. Sarah Williams",
    email: "sarah.williams@university.edu",
    role: "faculty",
    department: "Civil Engineering",
    specialization: "Structural Engineering"
  },
  {
    id: "faculty-5",
    name: "Dr. James Wilson",
    email: "james.wilson@university.edu",
    role: "faculty",
    department: "Mechanical Engineering",
    specialization: "Thermodynamics"
  },
  {
    id: "faculty-6",
    name: "Dr. Lisa Kumar",
    email: "lisa.kumar@university.edu",
    role: "faculty",
    department: "Information Technology",
    specialization: "Cybersecurity"
  }
];

// Initialize default timetables for mock faculty
export const initializeMockTimetables = () => {
  const timetables = {};
  
  mockFaculty.forEach(faculty => {
    timetables[faculty.id] = generateFacultySchedule(faculty);
  });
  
  return timetables;
};

// Initialize message system
export const initializeMessageSystem = () => {
  return {
    messages: [
      {
        id: "msg-1",
        from: "faculty-2",
        fromName: "Dr. Emily Johnson",
        subject: "Schedule Conflict on Thursday",
        message: "I have a research meeting during my Thursday 2:00 PM class. Can we reschedule?",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: false
      },
      {
        id: "msg-2",
        from: "faculty-4", 
        fromName: "Dr. Sarah Williams",
        subject: "Request for Lab Session",
        message: "I need a lab for my Surveying class on Mondays. Is there availability?",
        timestamp: new Date(Date.now() - 186400000).toISOString(),
        read: true
      }
    ]
  };
};
