import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">View your business activities and schedule</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-foreground">
              {formatMonthYear(currentDate)}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div key={day} className="bg-muted p-3 text-center">
              <span className="text-sm font-medium text-muted-foreground">{day}</span>
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-2 bg-background hover:bg-accent/50 transition-colors cursor-pointer ${
                day && isToday(day) ? 'ring-2 ring-primary' : ''
              } ${day && isSelected(day) ? 'bg-primary/10' : ''}`}
              onClick={() => day && setSelectedDate(day)}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {/* Sample events - in a real app, these would come from your data */}
                    {day.getDate() === 15 && (
                      <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                        Sales Meeting
                      </div>
                    )}
                    {day.getDate() === 20 && (
                      <div className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                        Invoice Due
                      </div>
                    )}
                    {day.getDate() === 25 && (
                      <div className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                        Expense Report
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Sales Meeting</p>
                <p className="text-sm text-muted-foreground">10:00 AM - 11:00 AM</p>
              </div>
              <button className="text-primary hover:text-primary/80 transition-colors">
                Edit
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Invoice Due</p>
                <p className="text-sm text-muted-foreground">Client: ABC Corp</p>
              </div>
              <button className="text-primary hover:text-primary/80 transition-colors">
                View
              </button>
            </div>
          </div>
          
          <button className="w-full mt-4 px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors">
            Add Event
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border text-center">
          <h4 className="font-medium text-foreground mb-2">Upcoming Events</h4>
          <p className="text-2xl font-bold text-primary">5</p>
          <p className="text-sm text-muted-foreground">This week</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border text-center">
          <h4 className="font-medium text-foreground mb-2">Overdue Tasks</h4>
          <p className="text-2xl font-bold text-destructive">2</p>
          <p className="text-sm text-muted-foreground">Need attention</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border text-center">
          <h4 className="font-medium text-foreground mb-2">Today's Schedule</h4>
          <p className="text-2xl font-bold text-foreground">3</p>
          <p className="text-sm text-muted-foreground">Meetings & tasks</p>
        </div>
      </div>
    </div>
  )
}