const API_BASE = "http://localhost:3000";

export async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    return response;
}

export const createSession = async (title: string) => {
    const res = await authFetch("/chat/new-session", {
        method: "POST",
        body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error("Failed to create session");
    return res.json();
};

export const renameSession = async (sessionId: string, title: string) => {
    const res = await authFetch(`/chat/session/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error("Failed to rename session");
    return res.json();
};

export const deleteSession = async (sessionId: string) => {
    const res = await authFetch(`/chat/session/${sessionId}`, {
        method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete session");
};
