import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export const Profile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const addContact = async () => {
        if (!newContact.name || !newContact.phone) return;
        setLoading(true);
        const updatedContacts = [...user.emergencyContacts, { ...newContact }];
        await updateProfile({ emergencyContacts: updatedContacts });
        setNewContact({ name: '', phone: '', email: '' });
        setLoading(false);
    };

    const removeContact = async (index: number) => {
        const updated = user.emergencyContacts.filter((_, i) => i !== index);
        await updateProfile({ emergencyContacts: updated });
    };

    return (
        <div className="app-container">
            <header>
                <h1>👤 PROFILE</h1>
                <button onClick={() => navigate('/dashboard')} className="small-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                    GO TO DASHBOARD ➜
                </button>
            </header>

            <main>
                <div className="dashboard-grid">
                    {/* Personal Details */}
                    <div className="card">
                        <h2>My Details</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    value={user.name}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email (Login ID)</label>
                                <input
                                    value={user.email}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Age</label>
                                <input
                                    type="number"
                                    value={user.age || ''}
                                    placeholder="Enter Age"
                                    onChange={e => updateProfile({ age: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '10px', background: '#334155', border: 'none', color: 'white', borderRadius: '4px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="card">
                        <h2>Emergency Contacts</h2>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '10px' }}>
                            Alerts will be sent to these emails!
                        </p>
                        <div className="add-contact-form" style={{ marginTop: '20px', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input
                                    placeholder="Contact Name"
                                    value={newContact.name}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                />
                                <input
                                    placeholder="Phone"
                                    value={newContact.phone}
                                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input
                                    placeholder="Email Address (For Alerts)"
                                    value={newContact.email}
                                    onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                                    style={{ flex: 1 }}
                                />
                                <button onClick={addContact} className="small-btn" disabled={loading} style={{ width: '60px' }}>
                                    {loading ? '...' : 'ADD'}
                                </button>
                            </div>
                        </div>

                        <ul className="contacts-list">
                            {user.emergencyContacts.map((c, i) => (
                                <li key={i} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <span style={{ fontWeight: 'bold' }}>{c.name}</span>
                                        <button onClick={() => removeContact(i)}>×</button>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                                        📞 {c.phone} | ✉️ {c.email || 'No Email'}
                                    </div>
                                </li>
                            ))}
                            {user.emergencyContacts.length === 0 && <p style={{ color: '#64748b' }}>No contacts added yet.</p>}
                        </ul>
                    </div>
                </div>

                <style>{`
            .readonly-input {
                width: 100%;
                padding: 10px;
                background: #0f172a;
                border: 1px solid #334155;
                color: #94a3b8;
                border-radius: 4px;
            }
        `}</style>
            </main>
        </div>
    );
};
