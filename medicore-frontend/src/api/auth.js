const BASE_URL = "http://localhost:8080";

export async function login(email, password) {
    const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    return res.json();
}

export async function register(data) {
    const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.json();
}