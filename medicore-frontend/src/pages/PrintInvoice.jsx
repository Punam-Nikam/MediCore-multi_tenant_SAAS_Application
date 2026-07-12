import { useEffect, useState } from 'react';

export default function PrintInvoice() {
    const [inv, setInv] = useState(null);
    const [pat, setPat] = useState(null);

    useEffect(() => {
        const invoice = JSON.parse(localStorage.getItem('print_invoice') || 'null');
        const patient = JSON.parse(localStorage.getItem('print_patient') || 'null');
        setInv(invoice);
        setPat(patient);

        // auto open print dialog after 500ms
        if (invoice) {
            setTimeout(() => window.print(), 500);
        }
    }, []);

    if (!inv) return <div style={{padding:'40px',textAlign:'center',color:'#94a3b8'}}>No invoice data found.</div>;

    const payMethod = inv.paymentMethod === 'CASH' ? ' Cash payment'
        : inv.paymentMethod === 'ONLINE' ? ' Online payment' : '—';

    return (
        <div style={{fontFamily:'Segoe UI, sans-serif', padding:'40px', color:'#1a1a2e', maxWidth:'800px', margin:'0 auto'}}>

            <style>{`
        @media print { .no-print { display: none !important; } body { padding: 0; } }
        * { box-sizing: border-box; }
      `}</style>

            {/* Print button — hidden when printing */}
            <div className="no-print" style={{textAlign:'right', marginBottom:'20px'}}>
                <button
                    onClick={() => window.print()}
                    style={{padding:'10px 24px', background:'#3b82f6', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'700', cursor:'pointer', marginRight:'8px'}}>
                     Print / Save PDF
                </button>
                <button
                    onClick={() => window.close()}
                    style={{padding:'10px 20px', background:'none', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', cursor:'pointer', color:'#64748b'}}>
                    Close
                </button>
            </div>

            {/* Invoice Header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', paddingBottom:'20px', marginBottom:'24px', borderBottom:'3px solid #3b82f6'}}>
                <div>
                    <div style={{fontSize:'28px', fontWeight:'900'}}>
                        <span style={{color:'#3b82f6'}}>Medi</span>Core
                    </div>
                    <div style={{fontSize:'12px', color:'#94a3b8', marginTop:'2px'}}>Healthcare Management Platform</div>

                </div>
                <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'18px', fontWeight:'800'}}>Invoice #{inv.id}</div>
                    <div style={{fontSize:'12px', color:'#64748b', marginTop:'4px'}}>
                        {new Date().toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'})}
                    </div>
                    <div style={{
                        display:'inline-block', marginTop:'6px',
                        padding:'4px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'700',
                        background: inv.status==='PAID' ? '#f0fdf4' : '#fff7ed',
                        color: inv.status==='PAID' ? '#15803d' : '#c2410c',
                        border: `1px solid ${inv.status==='PAID' ? '#86efac' : '#fed7aa'}`
                    }}>
                        {inv.status}
                    </div>
                </div>
            </div>

            {/* Patient + Clinic Info */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'24px'}}>
                <div style={{background:'#f8fafc', borderRadius:'10px', padding:'16px'}}>
                    <div style={{fontSize:'10px', textTransform:'uppercase', letterSpacing:'1.5px', color:'#94a3b8', fontWeight:'700', marginBottom:'10px'}}>
                        Patient Details
                    </div>
                    <div style={{fontWeight:'700', fontSize:'15px', marginBottom:'4px'}}>{pat?.name || 'Unknown'}</div>
                    <div style={{fontSize:'13px', color:'#64748b', marginBottom:'3px'}}> {pat?.phone || '—'}</div>
                    <div style={{fontSize:'13px', color:'#64748b', marginBottom:'3px'}}> Blood Group: {pat?.bloodGroup || '—'}</div>
                    <div style={{fontSize:'13px', color:'#64748b'}}> Complaint: {pat?.complaint || '—'}</div>
                </div>

                <div style={{background:'#f8fafc', borderRadius:'10px', padding:'16px'}}>
                    <div style={{fontSize:'10px', textTransform:'uppercase', letterSpacing:'1.5px', color:'#94a3b8', fontWeight:'700', marginBottom:'10px'}}>
                        Clinic Details
                    </div>
                    <div style={{fontWeight:'700', fontSize:'15px', marginBottom:'4px'}}>MediCore Clinic</div>
                    <div style={{fontSize:'13px', color:'#64748b', marginBottom:'3px'}}>Healthcare Management Platform</div>
                    <div style={{fontSize:'13px', color:'#64748b', marginBottom:'3px'}}>Patient ID: #{pat?.id || inv.patientId}</div>
                    <div style={{fontSize:'13px', color:'#64748b'}}>Invoice Date: {new Date().toLocaleDateString('en-IN')}</div>
                </div>
            </div>

            {/* Invoice Table */}
            <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'20px'}}>
                <thead>
                <tr style={{background:'#1e3a8a'}}>
                    <th style={{padding:'10px 14px', textAlign:'left', color:'white', fontSize:'12px'}}>#</th>
                    <th style={{padding:'10px 14px', textAlign:'left', color:'white', fontSize:'12px'}}>Description</th>
                    <th style={{padding:'10px 14px', textAlign:'left', color:'white', fontSize:'12px'}}>Type</th>
                    <th style={{padding:'10px 14px', textAlign:'right', color:'white', fontSize:'12px'}}>Amount</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td style={{padding:'12px 14px', borderBottom:'1px solid #e2e8f0', fontSize:'13px'}}>1</td>
                    <td style={{padding:'12px 14px', borderBottom:'1px solid #e2e8f0', fontSize:'13px'}}>{inv.description}</td>
                    <td style={{padding:'12px 14px', borderBottom:'1px solid #e2e8f0', fontSize:'13px'}}>Medical Service</td>
                    <td style={{padding:'12px 14px', borderBottom:'1px solid #e2e8f0', fontSize:'13px', textAlign:'right'}}>₹{inv.amount}</td>
                </tr>
                </tbody>
            </table>

            {/* Total */}
            <div style={{background:'#eff6ff', borderRadius:'10px', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div style={{fontSize:'14px', color:'#1e3a8a', fontWeight:'600'}}>Total Amount</div>
                <div style={{fontSize:'28px', fontWeight:'900', color:'#2563eb'}}>₹{inv.amount}</div>
            </div>

            {/* Payment Status */}
            {inv.status === 'PAID' ? (
                <div style={{background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'8px', padding:'12px 16px', marginBottom:'20px', fontSize:'13px', color:'#15803d', fontWeight:'600'}}>
                     Payment received via {payMethod}
                </div>
            ) : (
                <div style={{background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:'8px', padding:'12px 16px', marginBottom:'20px', fontSize:'13px', color:'#c2410c', fontWeight:'600'}}>
                     Payment pending
                </div>
            )}

            {/* Clinical Notes */}
            <div style={{background:'#f8fafc', borderRadius:'10px', padding:'16px', marginBottom:'24px'}}>
                <div style={{fontSize:'10px', textTransform:'uppercase', letterSpacing:'1.5px', color:'#94a3b8', fontWeight:'700', marginBottom:'12px'}}>
                    Clinical Notes
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
                    {[
                        {label:'Consulting Doctor', value:'—'},
                        {label:'Medicines Prescribed', value:'—'},
                        {label:'Lab Tests', value:'—'},
                    ].map((n,i) => (
                        <div key={i} style={{background:'white', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'10px'}}>
                            <div style={{fontSize:'10px', color:'#94a3b8', fontWeight:'700', textTransform:'uppercase', marginBottom:'4px'}}>{n.label}</div>
                            <div style={{fontSize:'13px', color:'#1a1a2e'}}>{n.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div style={{borderTop:'1px solid #e2e8f0', paddingTop:'14px', fontSize:'11px', color:'#94a3b8', textAlign:'center', lineHeight:'1.7'}}>
                This is a computer-generated invoice from MediCore Healthcare Platform.<br />
                Generated on {new Date().toLocaleString('en-IN')} · Invoice #{inv.id} · Patient: {pat?.name || '—'}<br />
                For queries, contact your clinic directly.
            </div>
        </div>
    );
}