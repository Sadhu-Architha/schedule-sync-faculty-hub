
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

export function HolidayDialog() {
  const [date, setDate] = useState<Date | undefined>();
  const [occasion, setOccasion] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (!date || !occasion.trim()) {
      toast.error("Please select a date and enter an occasion name");
      return;
    }

    // Get existing holidays
    const existingHolidays = JSON.parse(localStorage.getItem("holidays") || "[]");
    
    // Add new holiday
    const newHoliday = {
      date: date.toISOString(),
      occasion: occasion.trim()
    };
    
    localStorage.setItem("holidays", JSON.stringify([...existingHolidays, newHoliday]));
    
    // Clear form and close dialog
    setDate(undefined);
    setOccasion("");
    setIsOpen(false);
    
    toast.success(`Holiday declared for ${date.toLocaleDateString()}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Declare Holiday
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Declare Holiday</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Select Date</label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Occasion</label>
            <Input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Enter holiday occasion"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full">
            Declare Holiday
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
