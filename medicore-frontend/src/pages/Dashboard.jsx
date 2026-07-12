import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, addPatient, deletePatient } from '../api/patients';
import { getInvoices, createInvoice, createPayment, simulateWebhook } from '../api/invoices';
import '../styles/Dashboard.css';

const BASE = 'http://localhost:8080';
const gh = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const ini = n => n ? n.trim().split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : '?';
const cols = ['#3b82f6', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2', '#be185d'];
const ac = id => cols[id % cols.length];

//  Payment Modal
function PayModal({ inv, pat, onClose, onDone }) {
    const [stage, setStage] = useState('confirm');
    const [loading, setLoading] = useState(false);

    function PayModal({ inv, pat, onClose, onDone }) {
        const [stage, setStage] = useState('confirm');
        const [loading, setLoading] = useState(false);

        async function payOnline() {
            setLoading(true);
            try {
                const r = await createPayment(inv.id);
                if (!r.orderId) { alert('Could not create payment order — check backend console'); setLoading(false); return; }
                const w = await simulateWebhook(r.orderId);
                if (w.ok) { setStage('done'); setTimeout(() => { onDone('online'); onClose(); }, 1800); }
                else alert('Payment simulation failed — check if /api/webhook/sign is registered in Main.java');
            } catch (e) {
                alert('Network error: ' + e.message);
            }
            setLoading(false);
        }

        async function payCash() {
            setLoading(true);
            try {
                const res = await fetch(`${BASE}/api/invoices/${inv.id}/cash-paid`, {
                    method: 'POST', headers: gh()
                });
                const data = await res.json();
                if (data.message) { setStage('done'); setTimeout(() => { onDone('cash'); onClose(); }, 1800); }
                else alert(data.error || 'Failed to mark as cash paid');
            } catch (e) {
                alert('Network error: ' + e.message);
            }
            setLoading(false);
        }

        return (
            <div className="ov" onClick={onClose}>
                <div className="mod" onClick={e => e.stopPropagation()}>
                    {stage === 'confirm' ? (
                        <>
                            <div className="mod-t">Complete payment</div>
                            <div className="mod-s">Choose payment method for this invoice</div>
                            <div className="mod-rows">
                                <div className="mod-row"><span className="mod-rl">Patient</span><span className="mod-rv">{pat?.name || '—'}</span></div>
                                <div className="mod-row"><span className="mod-rl">Invoice #</span><span className="mod-rv">{inv.id}</span></div>
                                <div className="mod-row"><span className="mod-rl">Description</span><span className="mod-rv">{inv.description}</span></div>
                            </div>
                            <div className="mod-amt">
                                <div className="mod-amt-l">Total amount</div>
                                <div className="mod-amt-v">₹{inv.amount}</div>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <button className="mod-ok" onClick={payOnline} disabled={loading}
                                        style={{ width: '100%', marginBottom: '8px', background: '#3b82f6' }}>
                                    {loading ? 'Processing...' : ' Pay online (simulated)'}
                                </button>
                                <button className="mod-ok" onClick={payCash} disabled={loading}
                                        style={{ width: '100%', background: '#16a34a' }}>
                                    {loading ? 'Processing...' : ' Mark as cash paid'}
                                </button>
                            </div>
                            <button className="mod-cx" onClick={onClose} style={{ width: '100%' }}>Cancel</button>
                        </>
                    ) : (
                        <div className="suc">
                            <div className="suc-t">Payment confirmed!</div>
                            <div className="suc-s">Invoice #{inv.id} is now marked as PAID</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }


// Edit Modal
function EditModal({ pat, onClose, onDone }) {
    const [f, setF] = useState({ ...pat });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = k => e => setF({ ...f, [k]: e.target.value });

    async function save() {
        if (!f.name || !f.phone) { setError('Name and phone are required'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch(`${BASE}/api/patients/${pat.id}`, {
                method: 'PUT',
                headers: gh(),
                body: JSON.stringify({ ...f, age: parseInt(f.age) || 0 })
            });

            if (!res.ok) {
                const text = await res.text();
                setError('Server error: ' + text);
                setLoading(false); return;
            }

            const data = await res.json();
            if (data.message) { onDone(); onClose(); }
            else { setError(data.error || 'Update failed'); }
        } catch (e) {
            setError('Network error — is backend running? ' + e.message);
        }
        setLoading(false);
    }

    return (
        <div className="ov" onClick={onClose}>
            <div className="mod mod-wide" onClick={e => e.stopPropagation()}>
                <div className="mod-t" style={{ textAlign: 'left', marginBottom: '4px' }}>Edit patient</div>
                <div className="mod-s" style={{ textAlign: 'left', marginBottom: '16px' }}>Update patient information</div>

                {error && (
                    <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '14px' }}>
                        {error}
                    </div>
                )}

                <div className="fg">
                    <div><label className="fl">Full name *</label><input className="fi" value={f.name || ''} onChange={set('name')} /></div>
                    <div><label className="fl">Age *</label><input className="fi" type="number" value={f.age || ''} onChange={set('age')} /></div>
                    <div><label className="fl">Phone *</label><input className="fi" value={f.phone || ''} onChange={set('phone')} /></div>
                    <div>
                        <label className="fl">Gender</label>
                        <select className="fi" value={f.gender || 'MALE'} onChange={set('gender')}>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div><label className="fl">Blood group</label><input className="fi" value={f.bloodGroup || ''} onChange={set('bloodGroup')} /></div>
                    <div><label className="fl">Complaint</label><input className="fi" value={f.complaint || ''} onChange={set('complaint')} /></div>
                </div>

                <div className="mod-btns" style={{ marginTop: '16px' }}>
                    <button className="mod-cx" onClick={onClose}>Cancel</button>
                    <button className="mod-ok" onClick={save} disabled={loading}>
                        {loading ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

//  Main Dashboard
export default function Dashboard() {
    const [tab, setTab] = useState('patients');
    const [patients, setPatients] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [payInv, setPayInv] = useState(null);
    const [editPat, setEditPat] = useState(null);
    const [pSearch, setPSearch] = useState('');
    const [iSearch, setISearch] = useState('');
    const [iFilter, setIFilter] = useState('ALL');
    const [pf, setPf] = useState({ name: '', age: '', gender: 'MALE', phone: '', bloodGroup: '', complaint: '' });
    const [invf, setInvf] = useState({ patientId: '', description: '', amount: '' });
    const [msg, setMsg] = useState({ t: '', ok: true });
    const nav = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { nav('/login'); return; }
        load();
    }, []);

    async function load() {
        try {
            const [p, i] = await Promise.all([getPatients(), getInvoices()]);
            if (Array.isArray(p)) setPatients(p);
            if (Array.isArray(i)) setInvoices(i);
        } catch (e) {
            flash('Failed to load data', false);
        }
    }

    function flash(t, ok = true) {
        setMsg({ t, ok });
        setTimeout(() => setMsg({ t: '', ok: true }), 3500);
    }

    async function doAddPat() {
        if (!pf.name || !pf.age || !pf.phone) { flash('Name, age and phone required', false); return; }
        try {
            const r = await addPatient({ ...pf, age: parseInt(pf.age) });
            if (r.patientId) {
                flash('Patient added successfully');
                setShowAdd(false);
                setPf({ name: '', age: '', gender: 'MALE', phone: '', bloodGroup: '', complaint: '' });
                load();
            } else { flash(r.error || 'Failed to add patient', false); }
        } catch (e) { flash('Network error', false); }
    }

    async function doDelPat(id, name) {
        const patientInvoices = invoices.filter(inv => inv.patientId === id);

        if (patientInvoices.length > 0) {
            alert(`Cannot delete "${name}" — this patient has ${patientInvoices.length} invoice(s) on record. Please delete their invoices first.`, false);
            return;
        }

        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

        try {
            const res = await fetch(`${BASE}/api/patients/${id}`, {
                method: 'DELETE', headers: gh()
            });
            const data = await res.json();
            if (data.message) { flash(`"${name}" deleted successfully`); load(); }
            else flash(data.error || 'Failed to delete', false);
        } catch (e) { flash('Network error', false); }
    }

    async function doAddInv() {
        if (!invf.patientId || !invf.description || !invf.amount) { flash('All fields required', false); return; }
        if (parseFloat(invf.amount) <= 0) { flash('Amount must be greater than 0', false); return; }
        try {
            const r = await createInvoice({
                patientId: parseInt(invf.patientId),
                description: invf.description,
                amount: parseFloat(invf.amount)
            });
            if (r.invoiceId) {
                flash('Invoice created');
                setShowAdd(false);
                setInvf({ patientId: '', description: '', amount: '' });
                load();
            } else { flash(r.error || 'Failed to create invoice', false); }
        } catch (e) { flash('Network error', false); }
    }

    function printInvoice(inv) {
        const pat = patients.find(p => p.id === inv.patientId);
        localStorage.setItem('print_invoice', JSON.stringify(inv));
        localStorage.setItem('print_patient', JSON.stringify(pat));
        window.open('/print-invoice', '_blank');
    }

    const revenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
    const pending = invoices.filter(i => i.status === 'PENDING').length;

    const fp = patients.filter(p =>
        (p.name?.toLowerCase().includes(pSearch.toLowerCase())) ||
        (p.phone?.includes(pSearch))
    );

    const fi = invoices
        .filter(i => iFilter === 'ALL' || i.status === iFilter)
        .filter(i => {
            if (!iSearch) return true;
            const p = patients.find(x => x.id === i.patientId);
            return p?.name?.toLowerCase().includes(iSearch.toLowerCase());
        })
        .sort((a, b) => {
            const pa = patients.find(p => p.id === a.patientId)?.name || '';
            const pb = patients.find(p => p.id === b.patientId)?.name || '';
            return pa.localeCompare(pb);
        });

    return (
        <div className="app">
            {payInv && (
                <PayModal
                    inv={payInv}
                    pat={patients.find(p => p.id === payInv.patientId)}
                    onClose={() => setPayInv(null)}
                    onDone={(method) => { flash(`Payment confirmed (${method})`); load(); }}
                />
            )}
            {editPat && (
                <EditModal
                    pat={editPat}
                    onClose={() => setEditPat(null)}
                    onDone={() => { flash('Patient updated successfully'); load(); }}
                />
            )}

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="s-logo">Medi<span>Core</span></div>
                {[
                    { id: 'patients', label: 'Patients', count: patients.length },
                    { id: 'invoices', label: 'Invoices', count: invoices.length },
                ].map(s => (
                    <button key={s.id} className={`s-btn ${tab === s.id ? 'on' : ''}`}
                            onClick={() => { setTab(s.id); setShowAdd(false); }}>
                        <span>{s.ico}</span> {s.label}
                        <span className="s-count">{s.count}</span>
                    </button>
                ))}
                <div className="s-bottom">
                    <button className="s-logout" onClick={() => { localStorage.removeItem('token'); nav('/login'); }}>
                        ↩ Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="main-content">

                {/* Message banner */}
                {msg.t && (
                    <div className={`msg-bar ${msg.ok ? 'msg-ok' : 'msg-err'}`}>
                        {msg.t}
                        <button className="msg-x" onClick={() => setMsg({ t: '', ok: true })}>✕</button>
                    </div>
                )}

                {/* Stats */}
                <div className="stats">
                    {[
                        { l: 'Patients', v: patients.length },
                        { l: 'Invoices', v: invoices.length},
                        { l: 'Revenue', v: `₹${revenue.toFixed(0)}`},
                        { l: 'Pending', v: pending },
                    ].map((s, i) => (
                        <div className="stat-box" key={i}>
                            <div className="stat-top">
                                <div className="stat-lbl">{s.l}</div>
                                <div className="stat-ico">{s.ico}</div>
                            </div>
                            <div className="stat-num">{s.v}</div>
                        </div>
                    ))}
                </div>

                {/* PATIENTS TAB  */}
                {tab === 'patients' && (
                    <div className="card">
                        {/* Banner */}
                        <div className="page-banner">
                            <img
                                src="https://tse1.mm.bing.net/th/id/OIP.PYm99fUZWeQc4HzoK1iSLgHaDp?r=0&w=1280&h=630&rs=1&pid=ImgDetMain&o=7&rm=3"
                                alt="Patient registration"
                            />
                            <div className="page-banner-overlay">
                                <div className="page-banner-title">Patient Management</div>
                                <div className="page-banner-sub">{patients.length} registered · Search, add, edit or delete</div>
                            </div>
                        </div>

                        <div className="card-top">
                            <div>
                                <div className="card-title">All patients</div>
                                <div className="card-sub">{patients.length} registered</div>
                            </div>
                            <button className="btn-add" onClick={() => setShowAdd(!showAdd)}>
                                {showAdd ? '✕ Cancel' : '+ Add patient'}
                            </button>
                        </div>

                        {showAdd && (
                            <div className="add-form">
                                <h3>New patient</h3>
                                <div className="fg">
                                    <div><label className="fl">Full name *</label><input className="fi" placeholder="Patient full name" value={pf.name} onChange={e => setPf({ ...pf, name: e.target.value })} /></div>
                                    <div><label className="fl">Age *</label><input className="fi" type="number" placeholder="Age" value={pf.age} onChange={e => setPf({ ...pf, age: e.target.value })} /></div>
                                    <div>
                                        <label className="fl">Gender</label>
                                        <select className="fi" value={pf.gender} onChange={e => setPf({ ...pf, gender: e.target.value })}>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div><label className="fl">Phone *</label><input className="fi" placeholder="9876543210" value={pf.phone} onChange={e => setPf({ ...pf, phone: e.target.value })} /></div>
                                    <div><label className="fl">Blood group</label><input className="fi" placeholder="B+" value={pf.bloodGroup} onChange={e => setPf({ ...pf, bloodGroup: e.target.value })} /></div>
                                    <div><label className="fl">Complaint</label><input className="fi" placeholder="Primary complaint" value={pf.complaint} onChange={e => setPf({ ...pf, complaint: e.target.value })} /></div>
                                </div>
                                <div className="fa">
                                    <button className="btn-sv" onClick={doAddPat}>Save patient</button>
                                    <button className="btn-cx" onClick={() => setShowAdd(false)}>Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="sbar">
                            <input className="sinput" placeholder="Search by name or phone..." value={pSearch} onChange={e => setPSearch(e.target.value)} />
                        </div>

                        <table>
                            <thead>
                            <tr>
                                <th>Patient</th><th>Age</th><th>Gender</th>
                                <th>Phone</th><th>Blood</th><th>Complaint</th><th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {fp.length === 0 ? (
                                <tr><td colSpan="7">
                                    <div className="empty">
                                        <h3>{pSearch ? 'No results found' : 'No patients yet'}</h3>
                                        <p>{pSearch ? 'Try a different search' : 'Add your first patient above'}</p>
                                    </div>
                                </td></tr>
                            ) : fp.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="nc">
                                            <div className="av" style={{ background: ac(p.id) }}>{ini(p.name)}</div>
                                            <div>
                                                <div className="nm">{p.name}</div>
                                                <div className="ns">ID #{p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{p.age} yrs</td>
                                    <td><span className={`bm ${p.gender === 'FEMALE' ? 'bm-f' : 'bm-m'}`}>{p.gender}</span></td>
                                    <td>{p.phone}</td>
                                    <td>{p.bloodGroup || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                                    <td style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {p.complaint || <span style={{ color: '#cbd5e1' }}>—</span>}
                                    </td>
                                    <td>
                                        <button className="btn-e" onClick={() => setEditPat(p)}>Edit</button>
                                        <button className="btn-d" onClick={() => doDelPat(p.id, p.name)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* INVOICES TAB */}
                {tab === 'invoices' && (
                    <div className="card">
                        {/* Banner */}
                        <div className="page-banner">
                            <img
                                src="https://cdn.manomano.com/images/images_products/4388915/P/94984241_3.jpg"
                                alt="Medical billing"
                            />
                            <div className="page-banner-overlay">
                                <div className="page-banner-title">Invoices & Billing</div>
                                <div className="page-banner-sub">{invoices.length} total · {pending} pending · ₹{revenue.toFixed(0)} collected</div>
                            </div>
                        </div>

                        <div className="card-top">
                            <div>
                                <div className="card-title">All invoices</div>
                                <div className="card-sub">{invoices.length} total · {pending} pending</div>
                            </div>
                            <button className="btn-add" onClick={() => setShowAdd(!showAdd)}>
                                {showAdd ? '✕ Cancel' : '+ Create invoice'}
                            </button>
                        </div>

                        {showAdd && (
                            <div className="add-form">
                                <h3>New invoice</h3>
                                <div className="fg" style={{ gridTemplateColumns: '1fr' }}>
                                    <div>
                                        <label className="fl">Select patient *</label>
                                        <select className="fi" value={invf.patientId} onChange={e => setInvf({ ...invf, patientId: e.target.value })}>
                                            <option value="">— Choose patient —</option>
                                            {patients.map(p => <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="fg">
                                    <div><label className="fl">Description *</label><input className="fi" placeholder="e.g. Consultation fee" value={invf.description} onChange={e => setInvf({ ...invf, description: e.target.value })} /></div>
                                    <div><label className="fl">Amount (₹) *</label><input className="fi" type="number" placeholder="500" value={invf.amount} onChange={e => setInvf({ ...invf, amount: e.target.value })} /></div>
                                </div>
                                <div className="fa">
                                    <button className="btn-sv" onClick={doAddInv}>Create invoice</button>
                                    <button className="btn-cx" onClick={() => setShowAdd(false)}>Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="sbar">
                            <input className="sinput" placeholder="Search by patient name..." value={iSearch} onChange={e => setISearch(e.target.value)} />
                            <select className="sselect" value={iFilter} onChange={e => setIFilter(e.target.value)}>
                                <option value="ALL">All status</option>
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                            </select>
                        </div>

                        <table>
                            <thead>
                            <tr><th>#</th><th>Patient</th><th>Description</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                            {fi.length === 0 ? (
                                <tr><td colSpan="6">
                                    <div className="empty">
                                        <h3>No invoices found</h3>
                                        <p>Create an invoice above</p>
                                    </div>
                                </td></tr>
                            ) : fi.map(inv => {
                                const p = patients.find(x => x.id === inv.patientId);
                                return (
                                    <tr key={inv.id}>
                                        <td style={{ color: '#94a3b8', fontWeight: '700' }}>#{inv.id}</td>
                                        <td>
                                            <div className="nc">
                                                <div className="av" style={{ background: ac(inv.patientId), width: '28px', height: '28px', fontSize: '10px' }}>
                                                    {ini(p?.name)}
                                                </div>
                                                <div className="nm">{p?.name || `Patient #${inv.patientId}`}</div>
                                            </div>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{inv.description}</td>
                                        <td style={{ fontWeight: '800' }}>₹{inv.amount}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className={`bm ${inv.status === 'PAID' ? 'bm-paid' : 'bm-pend'}`}>
                            {inv.status === 'PAID' ? '✓ Paid' : '⏳ Pending'}
                          </span>
                                                {inv.paymentMethod && (
                                                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                              {inv.paymentMethod === 'CASH' ? ' Cash' : ' Online'}
                            </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                {inv.status === 'PENDING' && (
                                                    <button className="btn-p" onClick={() => setPayInv(inv)}>
                                                        Pay now
                                                    </button>
                                                )}
                                                {inv.status === 'PAID' && (
                                                    <>
                                                        <span style={{ color: '#15803d', fontSize: '12px', fontWeight: '700' }}>✓ Done</span>
                                                        <button
                                                            onClick={() => printInvoice(inv)}
                                                            style={{ padding: '5px 10px', background: 'none', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                                                            Print
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}