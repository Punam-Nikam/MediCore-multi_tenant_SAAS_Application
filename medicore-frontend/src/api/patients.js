const BASE_URL = "http://localhost:8080";

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
}

export async function getPatients() {
    const res = await fetch(`${BASE_URL}/api/patients`, {
        headers: getHeaders()
    });
    return res.json();
}

export async function addPatient(data) {
    const res = await fetch(`${BASE_URL}/api/patients`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function deletePatient(id) {
    const res = await fetch(`${BASE_URL}/api/patients/${id}`, {
        method: "DELETE",
        headers: getHeaders()
    });
    return res.json();
}