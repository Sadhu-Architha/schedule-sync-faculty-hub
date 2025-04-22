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
    name: "Dr. Shilpa",
    email: "shilpa@university.edu",
    role: "faculty",
    department: "Computer Science",
    specialization: "Artificial Intelligence"
  },
  {
    id: "faculty-2",
    name: "Dr. Ravali",
    email: "ravali@university.edu",
    role: "faculty",
    department: "Electrical Engineering",
    specialization: "Power Systems"
  },
  {
    id: "faculty-3",
    name: "Dr. Vanshika",
    email: "vanshika@university.edu",
    role: "faculty",
    department: "Electronics",
    specialization: "VLSI Design"
  },
  {
    id: "faculty-4",
    name: "Dr. Mounika",
    email: "mounika@university.edu",
    role: "faculty",
    department: "Civil Engineering",
    specialization: "Structural Engineering"
  },
  {
    id: "faculty-5",
    name: "Dr. Shiva Sri",
    email: "shivasri@university.edu",
    role: "faculty",
    department: "Mechanical Engineering",
    specialization: "Thermodynamics"
  },
  {
    id: "faculty-6",
    name: "Dr. Vigna",
    email: "vigna@university.edu",
    role: "faculty",
    department: "Information Technology",
    specialization: "Cybersecurity"
  },
  {
    id: "faculty-7",
    name: "Dr. Divya",
    email: "divya@university.edu",
    role: "faculty",
    department: "Computer Science",
    specialization: "Database Systems"
  },
  {
    id: "faculty-8",
    name: "Dr. Hima Varsha",
    email: "himavarsha@university.edu",
    role: "faculty",
    department: "Information Technology",
    specialization: "Cloud Computing"
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
        fromName: "Dr. Ravali",
        subject: "Schedule Conflict on Thursday",
        message: "I have a research meeting during my Thursday 2:00 PM class. Can we reschedule?",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: false
      },
      {
        id: "msg-2",
        from: "faculty-4", 
        fromName: "Dr. Mounika",
        subject: "Request for Lab Session",
        message: "I need a lab for my Surveying class on Mondays. Is there availability?",
        timestamp: new Date(Date.now() - 186400000).toISOString(),
        read: true
      }
    ]
  };
};
