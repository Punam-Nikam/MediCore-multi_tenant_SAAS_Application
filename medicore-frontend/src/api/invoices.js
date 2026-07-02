const BASE_URL = "http://localhost:8080";

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
}

export async function getInvoices() {
    const res = await fetch(`${BASE_URL}/api/invoices`, { headers: getHeaders() });
    return res.json();
}

export async function createInvoice(data) {
    const res = await fetch(`${BASE_URL}/api/invoices`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify(data)
    });
    return res.json();
}

export async function createPayment(invoiceId) {
    const res = await fetch(`${BASE_URL}/api/payments`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify({ invoiceId })
    });
    return res.json();
}

export async function simulateWebhook(orderId) {
    try {
        const signRes = await fetch(`${BASE_URL}/api/webhook/sign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId })
        });
        const { signature } = await signRes.json();

        const webhookRes = await fetch(`${BASE_URL}/api/webhook/razorpay`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
                "X-Razorpay-Signature": signature
            },
            body: orderId
        });
        return { ok: webhookRes.ok };
    } catch (e) {
        return { ok: false };
    }
}