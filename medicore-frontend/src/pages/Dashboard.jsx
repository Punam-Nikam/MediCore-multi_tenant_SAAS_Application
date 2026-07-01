import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, addPatient, deletePatient } from '../api/patients';
import { getInvoices, createInvoice, createPayment } from '../api/invoices';

function getInitials(name) {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?';
}

function Dashboard() {
    const [tab, setTab] = useState("patients");
    const [patients, setPatients] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [showAddPatient, setShowAddPatient] = useState(false);
    const [showAddInvoice, setShowAddInvoice] = useState(false);
    const [patientForm, setPatientForm] = useState({ name:"", age:"", gender:"MALE", phone:"", bloodGroup:"", complaint:"" });
    const [invoiceForm, setInvoiceForm] = useState({ patientId:"", description:"", amount:"" });
    const [message, setMessage] = useState({ text:"", type:"" });
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) { navigate('/login'); return; }
        loadAll();
    }, []);

    async function loadAll() {
        const [p, inv] = await Promise.all([getPatients(), getInvoices()]);
        if (Array.isArray(p)) setPatients(p);
        if (Array.isArray(inv)) setInvoices(inv);
    }

    function showMsg(text, type="success") {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text:"", type:"" }), 3000);
    }

    async function handleAddPatient() {
        if (!patientForm.name || !patientForm.age || !patientForm.phone) {
            showMsg("Name, age and phone are required", "error"); return;
        }
        const result = await addPatient({ ...patientForm, age: parseInt(patientForm.age) });
        if (result.patientId) {
            showMsg("Patient added successfully");
            setShowAddPatient(false);
            setPatientForm({ name:"", age:"", gender:"MALE", phone:"", bloodGroup:"", complaint:"" });
            loadAll();
        } else {
            showMsg(result.error || "Failed to add patient", "error");
        }
    }

    async function handleDeletePatient(id, name) {
        if (!window.confirm(`Delete patient "${name}"?`)) return;
        await deletePatient(id);
        showMsg("Patient deleted");
        loadAll();
    }

    async function handleAddInvoice() {
        if (!invoiceForm.patientId || !invoiceForm.description || !invoiceForm.amount) {
            showMsg("All invoice fields are required", "error"); return;
        }
        const result = await createInvoice({
            patientId: parseInt(invoiceForm.patientId),
            description: invoiceForm.description,
            amount: parseFloat(invoiceForm.amount)
        });
        if (result.invoiceId) {
            showMsg("Invoice created");
            setShowAddInvoice(false);
            setInvoiceForm({ patientId:"", description:"", amount:"" });
            loadAll();
        } else {
            showMsg(result.error || "Failed to create invoice", "error");
        }
    }

    async function handlePay(invoiceId) {
        const result = await createPayment(invoiceId);
        if (result.orderId) {
            showMsg(`Payment order created: ${result.orderId}`);
            loadAll();
        } else {
            showMsg(result.error || "Payment failed", "error");
        }
    }

    const pendingAmount = invoices
        .filter(inv => inv.status === "PENDING")
        .reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div style={{ minHeight:"100vh", background:"#f8fafc" }}>

            {/* Navbar */}
            <nav style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"12px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"18px", fontWeight:"700", color:"#2563eb" }}>MediCore</span>
                <div style={{ display:"flex", gap:"4px" }}>
                    {["patients","invoices"].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                                style={{ padding:"6px 16px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:"500",
                                    background: tab===t ? "#dbeafe" : "transparent",
                                    color: tab===t ? "#2563eb" : "#64748b" }}>
                            {t.charAt(0).toUpperCase()+t.slice(1)}
                        </button>
                    ))}
                </div>
                <button onClick={() => { localStorage.removeItem("token"); navigate('/login'); }}
                        style={{ background:"none", border:"none", color:"#ef4444", fontSize:"13px", cursor:"pointer" }}>
                    Logout
                </button>
            </nav>

            <div style={{ maxWidth:"960px", margin:"0 auto", padding:"24px 16px" }}>

                {/* Message */}
                {message.text && (
                    <div style={{ padding:"10px 16px", borderRadius:"8px", marginBottom:"16px", fontSize:"13px",
                        background: message.type==="error" ? "#fef2f2" : "#f0fdf4",
                        color: message.type==="error" ? "#dc2626" : "#16a34a",
                        border: `1px solid ${message.type==="error" ? "#fecaca" : "#bbf7d0"}` }}>
                        {message.text}
                    </div>
                )}

                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"20px" }}>
                    {[
                        { label:"Total patients", value: patients.length, color:"#2563eb" },
                        { label:"Total invoices", value: invoices.length, color:"#7c3aed" },
                        { label:"Pending amount", value:`₹${pendingAmount.toFixed(2)}`, color:"#d97706" }
                    ].map((s,i) => (
                        <div key={i} style={{ background:"white", borderRadius:"12px", padding:"16px", border:"1px solid #e2e8f0" }}>
                            <div style={{ fontSize:"12px", color:"#94a3b8", marginBottom:"4px" }}>{s.label}</div>
                            <div style={{ fontSize:"22px", fontWeight:"600", color: s.color }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* PATIENTS TAB */}
                {tab === "patients" && (
                    <div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                            <h2 style={{ fontSize:"16px", fontWeight:"600", color:"#1e293b" }}>Patients</h2>
                            <button onClick={() => setShowAddPatient(!showAddPatient)}
                                    style={{ background:"#2563eb", color:"white", border:"none", padding:"8px 16px", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>
                                + Add patient
                            </button>
                        </div>

                        {showAddPatient && (
                            <div style={{ background:"white", borderRadius:"12px", padding:"20px", border:"1px solid #e2e8f0", marginBottom:"16px" }}>
                                <h3 style={{ fontSize:"14px", fontWeight:"600", marginBottom:"12px", color:"#1e293b" }}>New patient</h3>
                                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                                    <input placeholder="Full name *" value={patientForm.name}
                                           onChange={e => setPatientForm({...patientForm, name:e.target.value})}
                                           style={{ padding:"8px 12px", borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"13px", outline:"none" }} />
                                    <input placeholder="Age *" type="number" value={patientForm.age}
                                           onChange={e => setPatientForm({...patientForm, age:e.target.value})}
                                           style={{ padding:"8px 12px", borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"13px", outline:"none" }} />
                                    <select value={patientForm.gender}
                                            onChange={e => setPatientForm({...patientForm, gender:e.target.value})}
                                            style={{ padding:"8px 12px", borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"13px", outline:"none" }}>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    <input placeholder="Phone *" value={patientForm.phone}
                                           onChange={e => setPatientForm({...patientForm, phone:e.target.value})}
                                           style={{ padding:"8px 12px", borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"13px", outline:"none" }} />
                                    <input placeholder="Blood group" value={patientForm.bloodGroup}
                                           onChange={e => setPatientForm({...patientForm, bloodGroup:e.target.value})}
                                           style={{ padding:"8px 12px", borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"13px", outline:"none" }} />
                                    <input placeholder="Complaint" value={patientForm.complaint}
                                           onChange={e => setPatientForm({...patientForm, complaint:e.target.value})}
                                           style={{ padding:"8px 12px", borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"13px", outline:"none" }} />
                                </div>
                                <div style={{ display:"flex", gap:"8px", marginTop:"12px" }}>
                                    <button onClick={handleAddPatient}
                                            style={{ background:"#2563eb", color:"white", border:"none", padding:"8px 20px", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>
                                        Save patient
                                    </button>
                                    <button onClick={() => setShowAddPatient(false)}
                                            style={{ background:"none", border:"1px solid #e2e8f0", padding:"8px 20px", borderRadius:"8px", fontSize:"13px", cursor:"pointer", color:"#64748b" }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ background:"white", borderRadius:"12px", border:"1px solid #e2e8f0", overflow:"hidden" }}>
                            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
                                <thead>
                                <tr style={{ background:"#f8fafc" }}>
                                    {["Name","Age","Gender","Phone","Blood","Complaint","Actions"].map(h => (
                                        <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:"#94a3b8", fontWeight:"500", fontSize:"11px", borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {patients.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding:"32px", textAlign:"center", color:"#94a3b8" }}>No patients yet. Add your first patient.</td></tr>
                                ) : patients.map(p => (
                                    <tr key={p.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                                        <td style={{ padding:"10px 14px" }}>
                                            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                                                <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"#dbeafe", color:"#2563eb", fontSize:"10px", fontWeight:"600", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                                    {getInitials(p.name)}
                                                </div>
                                                <span style={{ fontWeight:"500", color:"#1e293b" }}>{p.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding:"10px 14px", color:"#64748b" }}>{p.age}</td>
                                        <td style={{ padding:"10px 14px", color:"#64748b" }}>{p.gender}</td>
                                        <td style={{ padding:"10px 14px", color:"#64748b" }}>{p.phone}</td>
                                        <td style={{ padding:"10px 14px" }}>
                                            <span style={{ background:"#f1f5f9", color:"#64748b", padding:"2px 8px", borderRadius:"20px", fontSize:"11px" }}>{p.bloodGroup || "—"}</span>
                                        </td>
                                        <td style={{ padding:"10px 14px", color:"#64748b" }}>{p.complaint || "—"}</td>
                                        <td style={{ padding:"10px 14px" }}>
                                            <button onClick={() => handleDeletePatient(p.id, p.name)}
                                                    style={{ color:"#ef4444", background:"none", border:"none", fontSize:"12px", cursor:"pointer" }}>
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

                {/* INVOICES TAB */}
                {tab === "invoices" && (
                    <div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                            <h2 style={{ fontSize:"16px", fontWeight:"600", color:"#1e293b" }}>Invoices</h2>
                            <button onClick={() => setShowAddInvoice(!showAddInvoice)}
                                    style={{ background:"#2563eb", color:"white", border:"none", padding:"8px 16px", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>
                                + Create invoice
                            </button>
                        </div>

                        {showAddInvoice && (
                            <div style={{ background:"white", borderRadius:"12px", padding:"20px", border:"1px solid #e2e8f0", marginBottom:"16px" }}>
                                <h3 style={{ fontSize:"14px", fontWeight:"600", marginBottom:"12px", color:"#1e293b" }}>New invoice</h3>
                                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>

                                    {/* PATIENT DROPDOWN — no more manual ID! */}
                                    <div>
                                        <label style={{ fontSize:"12px", color:"#64748b", marginBottom:"4px", display:"block" }}>Select patient *</label>
                                        <select value={invoiceForm.patientId}
                                                onChange={e => setInvoiceForm({...invoiceForm, patientId:e.target.value})}
                                                style={{ width:"100%", padding:"8px 12px", borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"13px", outline:"none" }}>
                                            <option value="">— Choose a patient —</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <input placeholder="Description *" value={invoiceForm.description}
                                           onChange={e => setInvoiceForm({...invoiceForm, description:e.target.value})}
                                           style={{ padding:"8px 12px", borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"13px", outline:"none" }} />
                                    <input placeholder="Amount (₹) *" type="number" value={invoiceForm.amount}
                                           onChange={e => setInvoiceForm({...invoiceForm, amount:e.target.value})}
                                           style={{ padding:"8px 12px", borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"13px", outline:"none" }} />
                                </div>
                                <div style={{ display:"flex", gap:"8px", marginTop:"12px" }}>
                                    <button onClick={handleAddInvoice}
                                            style={{ background:"#2563eb", color:"white", border:"none", padding:"8px 20px", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>
                                        Create invoice
                                    </button>
                                    <button onClick={() => setShowAddInvoice(false)}
                                            style={{ background:"none", border:"1px solid #e2e8f0", padding:"8px 20px", borderRadius:"8px", fontSize:"13px", cursor:"pointer", color:"#64748b" }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ background:"white", borderRadius:"12px", border:"1px solid #e2e8f0", overflow:"hidden" }}>
                            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
                                <thead>
                                <tr style={{ background:"#f8fafc" }}>
                                    {["ID","Patient","Description","Amount","Status","Action"].map(h => (
                                        <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:"#94a3b8", fontWeight:"500", fontSize:"11px", borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {invoices.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding:"32px", textAlign:"center", color:"#94a3b8" }}>No invoices yet. Create your first invoice.</td></tr>
                                ) : invoices.map(inv => {
                                    const patient = patients.find(p => p.id === inv.patientId);
                                    return (
                                        <tr key={inv.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                                            <td style={{ padding:"10px 14px", color:"#94a3b8", fontSize:"12px" }}>#{inv.id}</td>
                                            <td style={{ padding:"10px 14px" }}>
                                                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                                                    <div style={{ width:"24px", height:"24px", borderRadius:"50%", background:"#dbeafe", color:"#2563eb", fontSize:"9px", fontWeight:"600", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                        {getInitials(patient?.name || "?")}
                                                    </div>
                                                    <span style={{ color:"#1e293b" }}>{patient?.name || `Patient #${inv.patientId}`}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding:"10px 14px", color:"#64748b" }}>{inv.description}</td>
                                            <td style={{ padding:"10px 14px", fontWeight:"500", color:"#1e293b" }}>₹{inv.amount}</td>
                                            <td style={{ padding:"10px 14px" }}>
                          <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"500",
                              background: inv.status==="PAID" ? "#f0fdf4" : "#fffbeb",
                              color: inv.status==="PAID" ? "#16a34a" : "#d97706" }}>
                            {inv.status}
                          </span>
                                            </td>
                                            <td style={{ padding:"10px 14px" }}>
                                                {inv.status === "PENDING" && (
                                                    <button onClick={() => handlePay(inv.id)}
                                                            style={{ color:"#2563eb", background:"none", border:"1px solid #bfdbfe", padding:"4px 12px", borderRadius:"6px", fontSize:"12px", cursor:"pointer" }}>
                                                        Pay now
                                                    </button>
                                                )}
                                                {inv.status === "PAID" && (
                                                    <span style={{ color:"#16a34a", fontSize:"12px" }}>✓ Paid</span>
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