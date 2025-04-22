
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { checkScheduleConflicts, autoResolveConflicts } from "@/utils/timetableGenerator";
import { mockFaculty } from "@/utils/mockData";
import { ArrowLeft } from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  department: string;
  specialization: string;
  role: string;
  email: string;
}

interface TimeTableEntry {
  day: string;
  timeSlot: string;
  subject: string;
  room: string;
  class: string;
}

interface FacultyStats {
  name: string;
  department: string;
  totalClasses: number;
  workloadPercentage: number;
  dayDistribution: Record<string, number>;
  maxClassesPerDay: number;
  balanceScore: number;
}

interface Conflict {
  type: string;
  detail: string;
  facultyIds: string[];
  day: string;
  timeSlot: string;
  room: string;
}

const ConflictsPage = () => {
  const navigate = useNavigate();
  const [allFaculty, setAllFaculty] = useState<FacultyMember[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [workloadStats, setWorkloadStats] = useState<Record<string, FacultyStats>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsers = localStorage.getItem("registeredUsers");
    const registeredFaculty = storedUsers ? JSON.parse(storedUsers) : [];
    
    const faculty = [...mockFaculty, ...registeredFaculty];
    setAllFaculty(faculty);
    
    const facultyTimetables = JSON.parse(localStorage.getItem("facultyTimetables") || "{}");
    
    const detectedConflicts = checkScheduleConflicts(facultyTimetables);
    setConflicts(detectedConflicts);
    
    const stats = calculateWorkloadStats(faculty, facultyTimetables);
    setWorkloadStats(stats);
    
    setIsLoading(false);
  }, []);

  const calculateWorkloadStats = (faculty: FacultyMember[], timetables: Record<string, TimeTableEntry[]>) => {
    const stats: Record<string, FacultyStats> = {};
    const totalFaculty = faculty.length;
    
    const classesPerDay = {};
    
    faculty.forEach(f => {
      const facultyTimetable = timetables[f.id] || [];
      
      stats[f.id] = {
        name: f.name,
        department: f.department,
        totalClasses: facultyTimetable.length,
        workloadPercentage: (facultyTimetable.length / 9) * 100,
        dayDistribution: {},
        maxClassesPerDay: 0,
        balanceScore: 0
      };
      
      const daysCounts = facultyTimetable.reduce<Record<string, number>>((acc, entry) => {
        if (!acc[entry.day]) {
          acc[entry.day] = 0;
        }
        acc[entry.day]++;
        return acc;
      }, {});
      
      stats[f.id].dayDistribution = daysCounts;
      
      const maxClassesInADay = Object.values(daysCounts).reduce<number>(
        (max, count) => Math.max(max, count), 0
      );
      
      stats[f.id].maxClassesPerDay = maxClassesInADay;
      stats[f.id].balanceScore = calculateBalanceScore(daysCounts);
    });
    
    return stats;
  };

  const calculateBalanceScore = (dayDistribution: Record<string, number>): number => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const counts = days.map(day => dayDistribution[day] || 0);
    
    if (counts.every(count => count === 0)) return 0;
    
    const total = counts.reduce((sum, count) => sum + count, 0);
    const ideal = total / days.length;
    
    const variance = counts.reduce(
      (sum, count) => sum + Math.pow(count - ideal, 2), 0
    ) / days.length;
    
    const maxVariance = Math.pow(total - ideal, 2) / days.length;
    
    const score = 100 * (1 - (variance / maxVariance));
    
    return Math.round(score);
  };

  const handleBack = () => {
    navigate("/admin/dashboard");
  };

  const handleAutoResolveConflicts = () => {
    const facultyTimetables = JSON.parse(localStorage.getItem("facultyTimetables") || "{}");
    const resolvedTimetables = autoResolveConflicts(facultyTimetables);
    
    localStorage.setItem("facultyTimetables", JSON.stringify(resolvedTimetables));
    
    const remainingConflicts = checkScheduleConflicts(resolvedTimetables);
    setConflicts(remainingConflicts);
    
    const stats = calculateWorkloadStats(allFaculty, resolvedTimetables);
    setWorkloadStats(stats);
    
    toast({
      title: remainingConflicts.length === 0 ? "All conflicts resolved!" : "Some conflicts remain",
      description: remainingConflicts.length === 0 
        ? "The timetable has been updated successfully."
        : "Manual intervention may be needed for remaining conflicts.",
      variant: remainingConflicts.length === 0 ? "default" : "destructive",
    });
  };

  const handleFixConflicts = () => {
    toast({
      title: "Conflicts Resolution",
      description: "Automatic conflict resolution is coming soon",
    });
  };

  const getWorkloadRating = (percentage: number): string => {
    if (percentage < 70) return "Under-allocated";
    if (percentage > 110) return "Overloaded";
    return "Balanced";
  };

  const getWorkloadColor = (percentage: number): string => {
    if (percentage < 70) return "text-amber-500";
    if (percentage > 110) return "text-red-500";
    return "text-green-600";
  };

  const getBalanceRatingColor = (score: number): string => {
    if (score < 60) return "text-red-500";
    if (score < 80) return "text-amber-500";
    return "text-green-600";
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
            <h2 className="text-2xl font-bold text-blue-800">Faculty Workload & Conflicts</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="shadow-md">
            <CardHeader className="bg-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Schedule Conflicts</CardTitle>
                  <CardDescription>
                    Detected issues in faculty timetables
                  </CardDescription>
                </div>
                {conflicts.length > 0 && (
                  <Button 
                    onClick={handleAutoResolveConflicts}
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Auto-resolve Conflicts
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading conflicts...</p>
                </div>
              ) : conflicts.length > 0 ? (
                <div className="space-y-4">
                  {conflicts.map((conflict, index) => (
                    <div 
                      key={index} 
                      className="bg-red-50 border border-red-200 rounded-md p-4"
                    >
                      <div className="flex items-start">
                        <div className="mr-4">
                          <Badge className="bg-red-500">Conflict</Badge>
                        </div>
                        <div>
                          <h4 className="font-medium">{conflict.detail}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <div>Affected faculty: {
                              conflict.facultyIds.map(id => {
                                const faculty = allFaculty.find(f => f.id === id);
                                return faculty ? faculty.name : id;
                              }).join(", ")
                            }</div>
                            <div className="mt-1">
                              <span className="font-medium">Day:</span> {conflict.day}, 
                              <span className="font-medium ml-2">Time:</span> {conflict.timeSlot}, 
                              <span className="font-medium ml-2">Room:</span> {conflict.room}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 text-right">
                    <Button onClick={handleFixConflicts}>
                      Auto-resolve Conflicts
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
                  <Badge className="bg-green-500 mr-4">All Clear</Badge>
                  <p className="text-green-700">No scheduling conflicts detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg">Faculty Workload Analysis</CardTitle>
            <CardDescription>
              Class distribution and scheduling balance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="text-center py-8 col-span-2">
                  <p className="text-gray-500">Loading workload analysis...</p>
                </div>
              ) : (
                Object.entries(workloadStats).map(([facultyId, stats]) => (
                  <Card key={facultyId} className="shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{stats.name}</CardTitle>
                          <CardDescription>{stats.department}</CardDescription>
                        </div>
                        <Badge 
                          className={`${
                            getWorkloadRating(stats.workloadPercentage) === "Balanced" 
                              ? "bg-green-100 text-green-800" 
                              : getWorkloadRating(stats.workloadPercentage) === "Under-allocated"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getWorkloadRating(stats.workloadPercentage)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-500">Classes assigned</span>
                          <span className="text-sm font-medium">
                            {stats.totalClasses} 
                            <span className="text-gray-500">/9</span>
                          </span>
                        </div>
                        <Progress value={stats.workloadPercentage} className="h-2" />
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-500">Distribution Balance</span>
                          <span className={`text-sm font-medium ${getBalanceRatingColor(stats.balanceScore)}`}>
                            {stats.balanceScore}/100
                          </span>
                        </div>
                        <Progress value={stats.balanceScore} className="h-2" />
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-sm text-gray-500 mb-2">Classes per day</div>
                        <div className="grid grid-cols-6 gap-1">
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                            <div 
                              key={day}
                              className="border rounded text-center py-1 text-xs"
                              title={day}
                            >
                              <div className="truncate px-1">{day.substring(0, 3)}</div>
                              <div className="font-semibold mt-1">
                                {stats.dayDistribution?.[day] || 0}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="w-full flex justify-between text-xs text-gray-500">
                        <span>Max classes per day: {stats.maxClassesPerDay}</span>
                        <span>
                          Target: {Math.round(stats.totalClasses / 6)} classes/day
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ConflictsPage;
