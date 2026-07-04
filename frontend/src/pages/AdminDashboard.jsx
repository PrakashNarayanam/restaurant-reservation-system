import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, PlusCircle, Trash2, Calendar, AlertCircle, CheckCircle2, RefreshCw, Edit } from 'lucide-react';

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  
  // Date filter for reservations
  const [filterDate, setFilterDate] = useState('');

  // Table creation state
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('');

  // Reservation editor state (modal/inline form)
  const [editingRes, setEditingRes] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTimeSlot, setEditTimeSlot] = useState('');
  const [editGuests, setEditGuests] = useState(1);
  const [editStatus, setEditStatus] = useState('confirmed');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancellingResId, setCancellingResId] = useState(null);
  const [deletingTableId, setDeletingTableId] = useState(null);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      if (res.data.success) {
        setTables(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch tables.');
    }
  };

  const fetchReservations = async () => {
    try {
      let url = '/reservations';
      if (filterDate) {
        url += `?date=${filterDate}`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setReservations(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch reservations.');
    }
  };

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, [filterDate]);

  const handleAddTable = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newTableNumber || !newTableCapacity) {
      setError('Please fill in both table number and capacity.');
      return;
    }

    try {
      const res = await api.post('/tables', {
        tableNumber: parseInt(newTableNumber),
        capacity: parseInt(newTableCapacity),
      });

      if (res.data.success) {
        setSuccess(`Table ${res.data.data.tableNumber} added successfully.`);
        setNewTableNumber('');
        setNewTableCapacity('');
        fetchTables();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add table.');
    }
  };

  const handleDeleteTable = async (id) => {
    setError('');
    setSuccess('');
    setDeletingTableId(null);

    try {
      const res = await api.delete(`/tables/${id}`);
      if (res.data.success) {
        setSuccess('Table deleted successfully.');
        fetchTables();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete table.');
    }
  };

  const startEdit = (res) => {
    setEditingRes(res);
    setEditDate(res.date);
    setEditTimeSlot(res.timeSlot);
    setEditGuests(res.guests);
    setEditStatus(res.status);
    setError('');
    setSuccess('');
  };

  const handleUpdateReservation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.patch(`/reservations/${editingRes._id}`, {
        date: editDate,
        timeSlot: editTimeSlot,
        guests: parseInt(editGuests),
        status: editStatus,
      });

      if (res.data.success) {
        setSuccess('Reservation updated successfully.');
        setEditingRes(null);
        fetchReservations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update reservation.');
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id) => {
    setError('');
    setSuccess('');
    setCancellingResId(null);

    try {
      const res = await api.patch(`/reservations/${id}`, { status: 'cancelled' });
      if (res.data.success) {
        setSuccess('Reservation cancelled successfully.');
        fetchReservations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield style={{ color: 'var(--accent)' }} />
            Administrator Control Center
          </h1>
          <p>Manage all reservations, filter by date, and configure dining tables</p>
        </div>
        <button onClick={() => { fetchTables(); fetchReservations(); }} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          <RefreshCw style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} />
          Refresh Data
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

      {/* Editing Panel (displays overlay/form if editing) */}
      {editingRes && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '2px solid var(--accent)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.1)',
        }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>
            Edit Booking for user: {editingRes.user?.username}
          </h3>
          <form onSubmit={handleUpdateReservation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Date</label>
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Time Slot</label>
              <select value={editTimeSlot} onChange={(e) => setEditTimeSlot(e.target.value)}>
                <option value="12:00-14:00">12:00 PM - 2:00 PM</option>
                <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                <option value="18:00-20:00">6:00 PM - 8:00 PM</option>
                <option value="20:00-22:00">8:00 PM - 10:00 PM</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Guests</label>
              <input type="number" min="1" max="20" value={editGuests} onChange={(e) => setEditGuests(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '45px' }} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditingRes(null)} className="btn btn-secondary" style={{ flex: 1, height: '45px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Reservations Admin view */}
        <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '1rem' }}>
            <h3>Customer Reservations</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
              <label style={{ marginRight: '0.5rem' }}>Filter by Date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
              />
              {filterDate && (
                <button onClick={() => setFilterDate('')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {reservations.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              No reservations found {filterDate ? `for ${filterDate}` : 'yet'}.
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Guests</th>
                    <th>Assigned Table</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => (
                    <tr key={res._id}>
                      <td style={{ fontWeight: 600 }}>{res.user?.username || 'Unknown'}</td>
                      <td>{res.date}</td>
                      <td>{res.timeSlot}</td>
                      <td>{res.guests}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          Table {res.table?.tableNumber || 'N/A'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                          (Capacity: {res.table?.capacity || 'N/A'})
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${res.status}`}>
                          {res.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => startEdit(res)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                            title="Edit Reservation"
                          >
                            <Edit style={{ width: '14px', height: '14px' }} />
                          </button>
                          {res.status === 'confirmed' && (
                            cancellingResId === res._id ? (
                              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>Cancel?</span>
                                <button
                                  onClick={() => cancelReservation(res._id)}
                                  className="btn btn-danger"
                                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setCancellingResId(null)}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCancellingResId(res._id)}
                                className="btn btn-danger"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                                title="Cancel Reservation"
                              >
                                Cancel
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Table Configurator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>
              <PlusCircle style={{ color: 'var(--accent)', width: '20px', height: '20px' }} />
              Add Table
            </h3>

            <form onSubmit={handleAddTable} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Table Number</label>
                <input
                  type="number"
                  placeholder="e.g. 7"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Seating Capacity</label>
                <input
                  type="number"
                  placeholder="e.g. 4"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent)', color: 'white' }}>
                Add Table
              </button>
            </form>
          </section>

          <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>Tables Setup</h3>

            {tables.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No tables seeded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {tables.map((t) => (
                  <div key={t._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 1rem',
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Table {t.tableNumber}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Capacity: {t.capacity} guests</span>
                    </div>
                    {deletingTableId === t._id ? (
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}>Delete Table?</span>
                        <button
                          onClick={() => handleDeleteTable(t._id)}
                          className="btn btn-danger"
                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeletingTableId(null)}
                          className="btn btn-secondary"
                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingTableId(t._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                        title="Delete Table"
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
