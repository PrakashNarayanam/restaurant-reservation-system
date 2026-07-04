import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Users, Clock, PlusCircle, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const CustomerDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('12:00-14:00');
  const [guests, setGuests] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  // Set min date to today
  const todayStr = new Date().toISOString().split('T')[0];

  const fetchReservations = async () => {
    try {
      setFetchLoading(true);
      const res = await api.get('/reservations');
      if (res.data.success) {
        setReservations(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load reservations.');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!date) {
      setError('Please select a date.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/reservations', {
        date,
        timeSlot,
        guests: parseInt(guests),
      });

      if (res.data.success) {
        setSuccess(`Success! Table ${res.data.data.table.tableNumber} (Capacity: ${res.data.data.table.capacity}) has been reserved for you.`);
        setDate('');
        setGuests(1);
        setTimeSlot('12:00-14:00');
        fetchReservations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to make reservation. No tables might be available.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setError('');
    setSuccess('');
    setCancellingId(null);
    try {
      const res = await api.patch(`/reservations/${id}`, { status: 'cancelled' });
      if (res.data.success) {
        setSuccess('Reservation cancelled successfully.');
        fetchReservations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel reservation.');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1>Customer Dashboard</h1>
          <p>Book a new table or view your active reservations</p>
        </div>
        <button onClick={fetchReservations} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          <RefreshCw style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} />
          Reload
        </button>
      </div>

      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          color: 'var(--success)',
          marginBottom: '2rem',
        }}>
          <CheckCircle2 style={{ flexShrink: 0, width: '20px', height: '20px' }} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          color: 'var(--danger)',
          marginBottom: '2rem',
        }}>
          <AlertCircle style={{ flexShrink: 0, width: '20px', height: '20px' }} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Reservation Form */}
        <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>
            <PlusCircle style={{ color: 'var(--primary)' }} />
            Book a Table
          </h3>

          <form onSubmit={handleBook} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar style={{ width: '14px', height: '14px' }} />
                Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock style={{ width: '14px', height: '14px' }} />
                Time Slot
              </label>
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option value="12:00-14:00">12:00 PM - 2:00 PM</option>
                <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                <option value="18:00-20:00">6:00 PM - 8:00 PM</option>
                <option value="20:00-22:00">8:00 PM - 10:00 PM</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Users style={{ width: '14px', height: '14px' }} />
                Guests
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '45px' }} disabled={loading}>
              {loading ? 'Booking...' : 'Reserve Table'}
            </button>
          </form>
        </section>

        {/* Reservations List */}
        <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>My Reservations</h3>

          {fetchLoading ? (
            <p style={{ textAlign: 'center', padding: '2rem 0' }}>Loading your reservations...</p>
          ) : reservations.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>You don't have any reservations yet.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Guests</th>
                    <th>Table Reserved</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => (
                    <tr key={res._id}>
                      <td style={{ fontWeight: 600 }}>{res.date}</td>
                      <td>{res.timeSlot}</td>
                      <td>{res.guests} {res.guests === 1 ? 'guest' : 'guests'}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          Table {res.table?.tableNumber || 'N/A'}
                        </span>{' '}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          (Capacity: {res.table?.capacity || 'N/A'})
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${res.status}`}>
                          {res.status}
                        </span>
                      </td>
                      <td>
                        {res.status === 'confirmed' ? (
                          cancellingId === res._id ? (
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>Cancel?</span>
                              <button
                                onClick={() => handleCancel(res._id)}
                                className="btn btn-danger"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setCancellingId(null)}
                                className="btn btn-secondary"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setCancellingId(res._id)}
                              className="btn btn-danger"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            >
                              Cancel
                            </button>
                          )
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;
