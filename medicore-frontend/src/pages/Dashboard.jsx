import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, addPatient, deletePatient } from '../api/patients';
import { getInvoices, createInvoice, createPayment, simulateWebhook } from '../api/invoices';
import '../styles/Dashboard.css';

function getInitials(name) {
    if (!name) return '?';
    return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function PaymentModal({ invoice, patient, onClose, onSuccess }) {
    const [stage, setStage] = useState('confirm');
    const [loading, setLoading] = useState(false);

    async function handlePay() {
        setLoading(true);
        const orderResult = await createPayment(invoice.id);
        if (!orderResult.orderId) {
            alert('Failed to create payment order'); setLoading(false); return;
        }
        const webhookResult = await simulateWebhook(orderResult.orderId);
        setLoading(false);
        if (webhookResult.ok) {
            setStage('success');
            setTimeout(() => { onSuccess(); onClose(); }, 2000);
        } else {
            alert('Payment simulation failed');
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                {stage === 'confirm' ? (
                    <>
                        <div className="modal-header">
                            <div className="modal-icon">💳</div>
                            <div className="modal-title">Complete payment</div>
                            <div className="modal-subtitle">Review invoice before paying</div>
                        </div>
                        <div className="modal-details">
                            <div className="modal-detail-row">
                                <span className="modal-detail-label">Patient</span>
                                <span className="modal-detail-value">{patient?.name || 'Unknown'}</span>
                            </div>
                            <div className="modal-detail-row">
                                <span className="modal-detail-label">Invoice #</span>
                                <span className="modal-detail-value">{invoice.id}</span>
                            </div>
                            <div className="modal-detail-row">
                                <span className="modal-detail-label">Description</span>
                                <span className="modal-detail-value">{invoice.description}</span>
                            </div>
                            <div className="modal-detail-row">
                                <span className="modal-detail-label">Status</span>
                                <span className="modal-detail-value" style={{ color: '#d97706' }}>PENDING</span>
                            </div>
                        </div>
                        <div className="modal-amount">
                            <div className="modal-amount-label">Total amount</div>
                            <div className="modal-amount-value">₹{invoice.amount}</div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-pay-cancel" onClick={onClose}>Cancel</button>
                            <button className="btn-pay-success" onClick={handlePay} disabled={loading}>
                                {loading ? 'Processing...' : '✓ Confirm payment'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="modal-success">
                        <div className="modal-success-icon">✅</div>
                        <div className="modal-success-title">Payment successful!</div>
                        <div className="modal-success-sub">Invoice #{invoice.id} has been marked as PAID</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Dashboard() {
    const [tab, setTab] = useState('patients');
    const [patients, setPatients] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [showAddPatient, setShowAddPatient] = useState(false);
    const [showAddInvoice, setShowAddInvoice] = useState(false);
    const [payingInvoice, setPayingInvoice] = useState(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [invoiceFilter, setInvoiceFilter] = useState('ALL');
    const [patientForm, setPatientForm] = useState({ name:'', age:'', gender:'MALE', phone:'', bloodGroup:'', complaint:'' });
    const [invoiceForm, setInvoiceForm] = useState({ patientId:'', description:'', amount:'' });
    const [msg, setMsg] = useState({ text:'', type:'' });
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        loadAll();
    }, []);

    async function loadAll() {
        const [p, inv] = await Promise.all([getPatients(), getInvoices()]);
        if (Array.isArray(p)) setPatients(p);
        if (Array.isArray(inv)) setInvoices(inv);
    }

    function showMsg(text, type = 'success') {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text:'', type:'' }), 3500);
    }

    async function handleAddPatient() {
        if (!patientForm.name || !patientForm.age || !patientForm.phone) {
            showMsg('Name, age and phone are required', 'error'); return;
        }
        const result = await addPatient({ ...patientForm, age: parseInt(patientForm.age) });
        if (result.patientId) {
            showMsg('Patient added successfully');
            setShowAddPatient(false);
            setPatientForm({ name:'', age:'', gender:'MALE', phone:'', bloodGroup:'', complaint:'' });
            loadAll();
        } else {
            showMsg(result.error || 'Failed to add patient', 'error');
        }
    }

    async function handleDeletePatient(id, name) {
        if (!window.confirm(`Delete patient "${name}"? This cannot be undone.`)) return;
        const result = await deletePatient(id);
        if (result.message) {
            showMsg('Patient deleted');
            loadAll();
        } else {
            showMsg(result.error || 'Failed to delete', 'error');
        }
    }

    async function handleAddInvoice() {
        if (!invoiceForm.patientId || !invoiceForm.description || !invoiceForm.amount) {
            showMsg('All fields are required', 'error'); return;
        }
        if (parseFloat(invoiceForm.amount) <= 0) {
            showMsg('Amount must be greater than zero', 'error'); return;
        }
        const result = await createInvoice({
            patientId: parseInt(invoiceForm.patientId),
            description: invoiceForm.description,
            amount: parseFloat(invoiceForm.amount)
        });
        if (result.invoiceId) {
            showMsg('Invoice created successfully');
            setShowAddInvoice(false);
            setInvoiceForm({ patientId:'', description:'', amount:'' });
            loadAll();
        } else {
            showMsg(result.error || 'Failed to create invoice', 'error');
        }
    }

    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone?.includes(patientSearch)
    );

    const filteredInvoices = invoices.filter(inv =>
        invoiceFilter === 'ALL' || inv.status === invoiceFilter
    );

    const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
    const pendingCount = invoices.filter(i => i.status === 'PENDING').length;

    return (
        <div className="dashboard">
            {payingInvoice && (
                <PaymentModal
                    invoice={payingInvoice}
                    patient={patients.find(p => p.id === payingInvoice.patientId)}
                    onClose={() => setPayingInvoice(null)}
                    onSuccess={() => { showMsg('Payment confirmed successfully!'); loadAll(); }}
                />
            )}

            <nav className="dash-nav">
                <div className="dash-logo"><span>M</span> MediCore</div>
                <div className="dash-tabs">
                    <button className={`dash-tab ${tab==='patients'?'active':''}`} onClick={() => setTab('patients')}>
                        👥 Patients <span style={{fontSize:'11px',background:'#e2e8f0',padding:'1px 7px',borderRadius:'20px',marginLeft:'4px'}}>{patients.length}</span>
                    </button>
                    <button className={`dash-tab ${tab==='invoices'?'active':''}`} onClick={() => setTab('invoices')}>
                        🧾 Invoices <span style={{fontSize:'11px',background:'#e2e8f0',padding:'1px 7px',borderRadius:'20px',marginLeft:'4px'}}>{invoices.length}</span>
                    </button>
                </div>
                <div className="dash-user">
                    <button className="btn-logout" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dash-body">
                {msg.text && (
                    <div className={`msg-banner ${msg.type==='error'?'msg-error':'msg-success'}`}>
                        {msg.text}
                        <button className="msg-close" onClick={() => setMsg({text:'',type:''})}>✕</button>
                    </div>
                )}

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{background:'#dbeafe'}}>👥</div>
                        <div className="stat-label">Total patients</div>
                        <div className="stat-value">{patients.length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{background:'#ede9fe'}}>🧾</div>
                        <div className="stat-label">Total invoices</div>
                        <div className="stat-value">{invoices.length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{background:'#dcfce7'}}>💰</div>
                        <div className="stat-label">Total revenue</div>
                        <div className="stat-value" style={{color:'#16a34a'}}>₹{totalRevenue.toFixed(0)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{background:'#fef9c3'}}>⏳</div>
                        <div className="stat-label">Pending invoices</div>
                        <div className="stat-value" style={{color:'#d97706'}}>{pendingCount}</div>
                    </div>
                </div>

                {/* PATIENTS */}
                {tab === 'patients' && (
                    <div>
                        <div className="section-header">
                            <div>
                                <div className="section-title">Patients</div>
                                <div className="section-subtitle">{patients.length} registered patients</div>
                            </div>
                            <button className="btn-add" onClick={() => setShowAddPatient(!showAddPatient)}>
                                + Add patient
                            </button>
                        </div>

                        {showAddPatient && (
                            <div className="form-panel">
                                <h3>Add new patient</h3>
                                <div className="form-row">
                                    <div>
                                        <label className="field-label">Full name *</label>
                                        <input className="field-input" placeholder="Patient full name"
                                               value={patientForm.name} onChange={e => setPatientForm({...patientForm, name:e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="field-label">Age *</label>
                                        <input className="field-input" type="number" placeholder="Age"
                                               value={patientForm.age} onChange={e => setPatientForm({...patientForm, age:e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div>
                                        <label className="field-label">Gender</label>
                                        <select className="field-input" value={patientForm.gender}
                                                onChange={e => setPatientForm({...patientForm, gender:e.target.value})}>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="field-label">Phone *</label>
                                        <input className="field-input" placeholder="9876543210"
                                               value={patientForm.phone} onChange={e => setPatientForm({...patientForm, phone:e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div>
                                        <label className="field-label">Blood group</label>
                                        <input className="field-input" placeholder="e.g. B+"
                                               value={patientForm.bloodGroup} onChange={e => setPatientForm({...patientForm, bloodGroup:e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="field-label">Complaint</label>
                                        <input className="field-input" placeholder="Primary complaint"
                                               value={patientForm.complaint} onChange={e => setPatientForm({...patientForm, complaint:e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button className="btn-save" onClick={handleAddPatient}>Save patient</button>
                                    <button className="btn-cancel" onClick={() => setShowAddPatient(false)}>Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="search-bar">
                            <input className="search-input" placeholder="Search patients by name or phone..."
                                   value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
                        </div>

                        <div className="data-table-wrap">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Patient</th><th>Age</th><th>Gender</th>
                                    <th>Phone</th><th>Blood</th><th>Complaint</th><th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredPatients.length === 0 ? (
                                    <tr><td colSpan="7">
                                        <div className="empty-state">
                                            <h3>{patientSearch ? 'No patients match your search' : 'No patients yet'}</h3>
                                            <p>{patientSearch ? 'Try a different search term' : 'Add your first patient to get started'}</p>
                                        </div>
                                    </td></tr>
                                ) : filteredPatients.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="avatar-cell">
                                                <div className="avatar">{getInitials(p.name)}</div>
                                                <div>
                                                    <div className="avatar-name">{p.name}</div>
                                                    <div className="avatar-sub">ID: {p.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{p.age} yrs</td>
                                        <td>
                        <span className={`badge ${p.gender==='FEMALE'?'badge-female':'badge-male'}`}>
                          {p.gender}
                        </span>
                                        </td>
                                        <td>{p.phone}</td>
                                        <td>{p.bloodGroup || <span style={{color:'#cbd5e1'}}>—</span>}</td>
                                        <td style={{maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                            {p.complaint || <span style={{color:'#cbd5e1'}}>—</span>}
                                        </td>
                                        <td>
                                            <button className="btn-delete" onClick={() => handleDeletePatient(p.id, p.name)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* INVOICES */}
                {tab === 'invoices' && (
                    <div>
                        <div className="section-header">
                            <div>
                                <div className="section-title">Invoices</div>
                                <div className="section-subtitle">{invoices.length} total · {pendingCount} pending</div>
                            </div>
                            <button className="btn-add" onClick={() => setShowAddInvoice(!showAddInvoice)}>
                                + Create invoice
                            </button>
                        </div>

                        {showAddInvoice && (
                            <div className="form-panel">
                                <h3>Create new invoice</h3>
                                <div className="form-row single">
                                    <div>
                                        <label className="field-label">Select patient *</label>
                                        <select className="field-input" value={invoiceForm.patientId}
                                                onChange={e => setInvoiceForm({...invoiceForm, patientId:e.target.value})}>
                                            <option value="">— Choose a patient —</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div>
                                        <label className="field-label">Description *</label>
                                        <input className="field-input" placeholder="e.g. Consultation fee, Lab test"
                                               value={invoiceForm.description} onChange={e => setInvoiceForm({...invoiceForm, description:e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="field-label">Amount (₹) *</label>
                                        <input className="field-input" type="number" placeholder="500"
                                               value={invoiceForm.amount} onChange={e => setInvoiceForm({...invoiceForm, amount:e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button className="btn-save" onClick={handleAddInvoice}>Create invoice</button>
                                    <button className="btn-cancel" onClick={() => setShowAddInvoice(false)}>Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="search-bar">
                            <select className="filter-select" value={invoiceFilter}
                                    onChange={e => setInvoiceFilter(e.target.value)}>
                                <option value="ALL">All invoices</option>
                                <option value="PENDING">Pending only</option>
                                <option value="PAID">Paid only</option>
                            </select>
                        </div>

                        <div className="data-table-wrap">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Invoice</th><th>Patient</th><th>Description</th>
                                    <th>Amount</th><th>Status</th><th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredInvoices.length === 0 ? (
                                    <tr><td colSpan="6">
                                        <div className="empty-state">
                                            <h3>No invoices found</h3>
                                            <p>Create an invoice to get started</p>
                                        </div>
                                    </td></tr>
                                ) : filteredInvoices.map(inv => {
                                    const patient = patients.find(p => p.id === inv.patientId);
                                    return (
                                        <tr key={inv.id}>
                                            <td style={{color:'#94a3b8',fontWeight:'600'}}>#{inv.id}</td>
                                            <td>
                                                <div className="avatar-cell">
                                                    <div className="avatar" style={{width:'28px',height:'28px',fontSize:'10px'}}>
                                                        {getInitials(patient?.name)}
                                                    </div>
                                                    <div className="avatar-name">{patient?.name || `Patient #${inv.patientId}`}</div>
                                                </div>
                                            </td>
                                            <td style={{color:'#64748b'}}>{inv.description}</td>
                                            <td style={{fontWeight:'700',color:'#0f172a'}}>₹{inv.amount}</td>
                                            <td>
                          <span className={`badge ${inv.status==='PAID'?'badge-paid':'badge-pending'}`}>
                            {inv.status==='PAID' ? '✓ Paid' : '⏳ Pending'}
                          </span>
                                            </td>
                                            <td>
                                                {inv.status === 'PENDING' ? (
                                                    <button className="btn-pay" onClick={() => setPayingInvoice(inv)}>
                                                        Pay now
                                                    </button>
                                                ) : (
                                                    <span style={{color:'#16a34a',fontSize:'13px',fontWeight:'600'}}>✓ Done</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;