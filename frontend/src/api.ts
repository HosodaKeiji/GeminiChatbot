const API_BASE = "http://localhost:3000";

export const authFetch = (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");

    return fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
};


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
