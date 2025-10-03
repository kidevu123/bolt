import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, Heart } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  notes: string;
  created_by: string;
}

export default function AppointmentBooking({ user }: { user: any }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'shave',
    notes: '',
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('appointments')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert([{
            ...formData,
            created_by: user.id,
          }]);
        
        if (error) throw error;
      }

      setFormData({ title: '', date: '', time: '', type: 'shave', notes: '' });
      setShowForm(false);
      setEditingId(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      notes: appointment.notes,
    });
    setEditingId(appointment.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const appointmentTypes = [
    { value: 'shave', label: 'Personal Care', icon: '✨' },
    { value: 'massage', label: 'Massage', icon: '💆' },
    { value: 'intimate', label: 'Intimate Time', icon: '💕' },
    { value: 'talk', label: 'Deep Conversation', icon: '💬' },
    { value: 'surprise', label: 'Surprise', icon: '🎁' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Appointments</h1>
          <p className="text-gray-600">Schedule special moments together</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ title: '', date: '', time: '', type: 'shave', notes: '' });
          }}
          className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>New Appointment</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-200 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
                  placeholder="Special time together"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
                placeholder="Any special preparations or notes..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200"
              >
                {editingId ? 'Update' : 'Create'} Appointment
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appointment) => {
          const type = appointmentTypes.find(t => t.value === appointment.type);
          return (
            <div
              key={appointment.id}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{type?.icon || '📅'}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{appointment.title}</h3>
                    <p className="text-sm text-gray-600">{type?.label}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(appointment)}
                    className="p-1 text-gray-500 hover:text-rose-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(appointment.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(appointment.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString([], { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                {appointment.notes && (
                  <p className="text-sm text-gray-600 mt-3 p-3 bg-rose-50 rounded-lg">
                    {appointment.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-rose-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No appointments yet</h3>
          <p className="text-gray-500">Create your first appointment to start scheduling special moments together</p>
        </div>
      )}
    </div>
  );
}