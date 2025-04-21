import { subjectsByDepartment } from "./mockData";

// Time slots for scheduling classes
const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM"
];

// Days of the week including Saturday
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Room types
const roomTypes = ["Lecture Hall", "Lab", "Classroom", "Seminar Room"];
const buildings = ["A", "B", "C", "D"];
const floors = [1, 2, 3];

// Generate a random room
const generateRoom = () => {
  const building = buildings[Math.floor(Math.random() * buildings.length)];
  const floor = floors[Math.floor(Math.random() * floors.length)];
  const roomNumber = Math.floor(Math.random() * 10) + 1;
  const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
  
  return `${building}-${floor}${roomNumber < 10 ? '0' + roomNumber : roomNumber} (${roomType})`;
};

// Get random subjects based on department
const getSubjectsForDepartment = (department) => {
  // Default to Computer Science if department not found
  const subjects = subjectsByDepartment[department] || subjectsByDepartment["Computer Science"];
  return subjects;
};

// Generate a schedule entry
const generateScheduleEntry = (faculty, usedSlots) => {
  let day, timeSlot;
  
  // Keep trying until we find an unused day/time combination
  do {
    day = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];
    timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
  } while (usedSlots[`${day}-${timeSlot}`]);
  
  // Mark this slot as used
  usedSlots[`${day}-${timeSlot}`] = true;
  
  const subjects = getSubjectsForDepartment(faculty.department);
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  
  return {
    day,
    timeSlot,
    subject,
    room: generateRoom(),
    class: `${faculty.department.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 4) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`
  };
};

// Generate faculty schedule - 9 classes per week
export const generateFacultySchedule = (faculty) => {
  const schedule = [];
  const usedSlots = {};
  
  // Generate 9 unique schedule entries
  for (let i = 0; i < 9; i++) {
    const entry = generateScheduleEntry(faculty, usedSlots);
    schedule.push(entry);
  }
  
  return schedule;
};

// Regenerate a single faculty's timetable
export const regenerateFacultyTimetable = (faculty) => {
  return generateFacultySchedule(faculty);
};

interface Conflict {
  type: string;
  detail: string;
  facultyIds: string[];
  day: string;
  timeSlot: string;
  room: string;
}

// Check for schedule conflicts in faculty timetables
export const checkScheduleConflicts = (allTimetables: Record<string, any[]>) => {
  const conflicts: Conflict[] = [];
  const slotUsage: Record<string, {facultyId: string, subject: string}> = {};
  
  // Check for room conflicts
  Object.entries(allTimetables).forEach(([facultyId, schedule]) => {
    if (Array.isArray(schedule)) {
      schedule.forEach((entry) => {
        const slotKey = `${entry.day}-${entry.timeSlot}-${entry.room}`;
        
        if (slotUsage[slotKey]) {
          conflicts.push({
            type: 'room',
            detail: `Room ${entry.room} double-booked on ${entry.day} at ${entry.timeSlot}`,
            facultyIds: [facultyId, slotUsage[slotKey].facultyId],
            day: entry.day,
            timeSlot: entry.timeSlot,
            room: entry.room
          });
        } else {
          slotUsage[slotKey] = { facultyId, subject: entry.subject };
        }
      });
    }
  });
  
  return conflicts;
};
