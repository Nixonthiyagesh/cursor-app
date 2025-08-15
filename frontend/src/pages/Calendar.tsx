import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Edit, Trash2, Clock, MapPin, Users } from 'lucide-react'
import { api } from '../lib/api'
import { formatDate, formatTime } from '../lib/utils'
import toast from 'react-hot-toast'

interface CalendarEvent {
  _id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  type: 'meeting' | 'task' | 'reminder' | 'other'
  priority: 'low' | 'medium' | 'high'
  isAllDay: boolean
  location?: string
  attendees?: string[]
  notes?: string
}

interface CreateEventData {
  title: string
  description: string
  startDate: string
  endDate: string
  type: 'meeting' | 'task' | 'reminder' | 'other'
  priority: 'low' | 'medium' | 'high'
  isAllDay: boolean
  location: string
  attendees: string
  notes: string
}

const defaultEvent: CreateEventData = {
  title: '',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  type: 'meeting',
  priority: 'medium',
  isAllDay: false,
  location: '',
  attendees: '',
  notes: ''
}

const eventTypes = [
  { value: 'meeting', label: 'Meeting', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'task', label: 'Task', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'reminder', label: 'Reminder', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
]

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
]

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [formData, setFormData] = useState<CreateEventData>(defaultEvent)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const response = await api.get(`/calendar/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      setEvents(response.data.data.events)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

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

  const getEventsForDate = (date: Date) => {
    if (!date) return []
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required'
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.endDate = 'End date must be after start date'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      
      const eventData = {
        ...formData,
        attendees: formData.attendees ? formData.attendees.split(',').map(a => a.trim()).filter(a => a) : []
      }
      
      if (editingEvent) {
        // Update existing event
        const response = await api.put(`/calendar/events/${editingEvent._id}`, eventData)
        setEvents(prev => prev.map(evt => 
          evt._id === editingEvent._id ? response.data.data.event : evt
        ))
        toast.success('Event updated successfully')
      } else {
        // Create new event
        const response = await api.post('/calendar/events', eventData)
        setEvents(prev => [response.data.data.event, ...prev])
        toast.success('Event created successfully')
      }
      
      handleCloseForm()
      fetchEvents() // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      type: event.type,
      priority: event.priority,
      isAllDay: event.isAllDay,
      location: event.location || '',
      attendees: event.attendees?.join(', ') || '',
      notes: event.notes || ''
    })
    setShowEventForm(true)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      await api.delete(`/calendar/events/${eventId}`)
      setEvents(prev => prev.filter(evt => evt._id !== eventId))
      toast.success('Event deleted successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete event')
    }
  }

  const handleCloseForm = () => {
    setShowEventForm(false)
    setEditingEvent(null)
    setFormData(defaultEvent)
    setFormErrors({})
  }

  const getEventTypeColor = (type: string) => {
    return eventTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800'
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">View your business activities and schedule</p>
        </div>
        <button 
          onClick={() => setShowEventForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
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
              className={`min-h-[120px] p-2 bg-background hover:bg-accent/50 transition-colors cursor-pointer ${
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
                    {getEventsForDate(day).map((event) => (
                      <div
                        key={event._id}
                        className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getEventTypeColor(event.type)}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(event)
                        }}
                        title={`${event.title} - ${event.type} (${event.priority} priority)`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        {!event.isAllDay && (
                          <div className="text-xs opacity-75">
                            {formatTime(event.startDate)} - {formatTime(event.endDate)}
                          </div>
                        )}
                      </div>
                    ))}
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
            {getEventsForDate(selectedDate).map((event) => (
              <div key={event._id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-foreground">{event.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(event.priority)}`}>
                      {event.priority}
                    </span>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {!event.isAllDay && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.startDate)} - {formatTime(event.endDate)}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(event)}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(event._id)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-muted-foreground text-center py-4">No events scheduled for this date</p>
            )}
          </div>
          
          <button 
            onClick={() => setShowEventForm(true)}
            className="w-full mt-4 px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors"
          >
            Add Event
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border text-center">
          <h4 className="font-medium text-foreground mb-2">Upcoming Events</h4>
          <p className="text-2xl font-bold text-primary">
            {events.filter(e => new Date(e.startDate) > new Date()).length}
          </p>
          <p className="text-sm text-muted-foreground">This month</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border text-center">
          <h4 className="font-medium text-foreground mb-2">Today's Events</h4>
          <p className="text-2xl font-bold text-foreground">
            {getEventsForDate(new Date()).length}
          </p>
          <p className="text-sm text-muted-foreground">Meetings & tasks</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border text-center">
          <h4 className="font-medium text-foreground mb-2">High Priority</h4>
          <p className="text-2xl font-bold text-red-600">
            {events.filter(e => e.priority === 'high').length}
          </p>
          <p className="text-sm text-muted-foreground">Need attention</p>
        </div>
      </div>

      {/* Add/Edit Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.title ? 'border-destructive' : 'border-input'
                  } bg-background text-foreground`}
                  placeholder="Enter event title"
                />
                {formErrors.title && (
                  <p className="text-sm text-destructive mt-1">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="Enter event description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.startDate ? 'border-destructive' : 'border-input'
                    } bg-background text-foreground`}
                  />
                  {formErrors.startDate && (
                    <p className="text-sm text-destructive mt-1">{formErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.endDate ? 'border-destructive' : 'border-input'
                    } bg-background text-foreground`}
                  />
                  {formErrors.endDate && (
                    <p className="text-sm text-destructive mt-1">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Attendees
                </label>
                <input
                  type="text"
                  value={formData.attendees}
                  onChange={(e) => handleInputChange('attendees', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="Enter attendees (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="Enter additional notes"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAllDay"
                  checked={formData.isAllDay}
                  onChange={(e) => handleInputChange('isAllDay', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isAllDay" className="ml-2 block text-sm text-foreground">
                  All-day event
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Add Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}