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

interface Conflict {
  type: 'room';
  detail: string;
  facultyIds: string[];
  day: string;
  timeSlot: string;
  room: string;
}

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

// Generate faculty schedule - 9 classes per week with better distribution
export const generateFacultySchedule = (faculty) => {
  const schedule = [];
  const usedSlots = {};
  const classesPerDay = {};
  
  // Initialize classes per day counter
  daysOfWeek.forEach(day => {
    classesPerDay[day] = 0;
  });

  // First, sort all possible day-time combinations
  const allPossibleSlots = [];
  daysOfWeek.forEach(day => {
    timeSlots.forEach(timeSlot => {
      allPossibleSlots.push({ day, timeSlot });
    });
  });

  // Distribute 9 classes across the week
  let classCount = 0;
  while (classCount < 9) {
    // Find days with fewer than 2 classes
    const availableDays = daysOfWeek.filter(day => classesPerDay[day] < 2);
    
    if (availableDays.length === 0) {
      // Reset if we can't distribute evenly
      daysOfWeek.forEach(day => {
        classesPerDay[day] = 0;
      });
      continue;
    }
    
    const day = availableDays[0]; // Take first available day for sequential filling
    const availableTimeSlots = timeSlots.filter(timeSlot => !usedSlots[`${day}-${timeSlot}`]);
    
    if (availableTimeSlots.length === 0) continue;
    
    const timeSlot = availableTimeSlots[0]; // Take first available time slot
    const subjects = getSubjectsForDepartment(faculty.department);
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    usedSlots[`${day}-${timeSlot}`] = true;
    classesPerDay[day]++;
    classCount++;
    
    schedule.push({
      day,
      timeSlot,
      subject,
      room: generateRoom(),
      class: `${faculty.department.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 4) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`
    });
  }
  
  // Sort schedule properly by day order and time
  return schedule.sort((a, b) => {
    const dayDiff = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return timeSlots.indexOf(a.timeSlot) - timeSlots.indexOf(b.timeSlot);
  });
};

// Auto-resolve conflicts by reassigning time slots and rooms
export const autoResolveConflicts = (allTimetables: Record<string, any[]>) => {
  const conflicts = checkScheduleConflicts(allTimetables);
  if (conflicts.length === 0) return allTimetables;

  const resolvedTimetables = { ...allTimetables };

  conflicts.forEach(conflict => {
    const [facultyId1, facultyId2] = conflict.facultyIds;
    const faculty1Schedule = resolvedTimetables[facultyId1];
    const faculty2Schedule = resolvedTimetables[facultyId2];

    // Find the conflicting entries
    const entry1Index = faculty1Schedule.findIndex(
      entry => entry.day === conflict.day && entry.timeSlot === conflict.timeSlot
    );
    
    // Try to find a new time slot for the second faculty
    const usedSlots = new Set();
    faculty2Schedule.forEach(entry => usedSlots.add(`${entry.day}-${entry.timeSlot}`));
    
    // Find available slot
    let newSlot = null;
    for (const day of daysOfWeek) {
      for (const time of timeSlots) {
        const slotKey = `${day}-${time}`;
        if (!usedSlots.has(slotKey)) {
          newSlot = { day, timeSlot: time };
          break;
        }
      }
      if (newSlot) break;
    }

    if (newSlot) {
      // Update the conflicting entry with new time slot
      faculty2Schedule[entry1Index] = {
        ...faculty2Schedule[entry1Index],
        day: newSlot.day,
        timeSlot: newSlot.timeSlot,
        room: generateRoom() // Generate a new room to avoid potential room conflicts
      };
    }
  });

  return resolvedTimetables;
};

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

// Sort time slots in chronological order
const sortTimeSlots = (slots: string[]) => {
  return slots.sort((a, b) => {
    const timeA = new Date(`2000/01/01 ${a.split(' - ')[0]}`);
    const timeB = new Date(`2000/01/01 ${b.split(' - ')[0]}`);
    return timeA.getTime() - timeB.getTime();
  });
};

// Regenerate a single faculty's timetable
export const regenerateFacultyTimetable = (faculty) => {
  return generateFacultySchedule(faculty);
};
