import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../api';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

type Session = {
  id: string;
  title: string;
};

type User = {
  id: string;
  email: string;
};

export default function Chat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const loadUser = async () => {
    const res = await authFetch('/users/me');
    const data = await res.json();
    setUser(data);
  };

  useEffect(() => {
    loadUser();
  }, []);  

  /* ===== セッション一覧取得 ===== */
  const loadSessions = async () => {
    const res = await authFetch('/chat/sessions');
    const data: Session[] = await res.json();

    setSessions(data);
    
    if (!currentSessionId && data.length > 0) {
      setCurrentSessionId(data[0].id);
    }
  };

  /* ===== メッセージ取得 ===== */
  const loadMessages = async (sessionId: string) => {
    const res = await authFetch(`/chat/messages?sessionId=${sessionId}`);
    const data: Message[] = await res.json();
    setMessages(data);
  };

  /* ===== 新規セッション作成 ===== */
  const createSession = async () => {
    const title = prompt('チャット名を入力してください');
    if (!title) return;

    const res = await authFetch('/chat/new-session', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    const session: Session = await res.json();

    setSessions((prev) => [session, ...prev]);
    setCurrentSessionId(session.id);
    setMessages([]);
  };

  /* ===== メッセージ送信 ===== */
  const sendMessage = async () => {
    if (!input.trim() || !currentSessionId) return;

    await authFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: input,
        sessionId: currentSessionId,
      }),
    });

    setInput('');
    await loadMessages(currentSessionId);
  };

  const renameSession = async (sessionId: string) => {
    const title = prompt('新しいチャット名を入力してください');
    if (!title) return;

    await authFetch(`/chat/session/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });

    // UI 即時反映
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, title } : s,
      ),
    );
  };

  const deleteSession = async (sessionId: string) => {
    const ok = confirm('このチャットを削除しますか？');
    if (!ok) return;

    await authFetch(`/chat/session/${sessionId}`, {
      method: 'DELETE',
    });

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };  

  /* ===== 初期ロード（API呼ぶだけ） ===== */
  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== セッション切替時 ===== */
  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId);
    }
  }, [currentSessionId]);

  /* ===== 自動スクロール ===== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <button style={styles.newChatButton} onClick={createSession}>
          ＋ 新しいチャット
        </button>

        <div style={styles.sessionList}>
          {sessions.map((s) => (
            <div
              key={s.id}
              style={{
                ...styles.sessionItem,
                ...(s.id === currentSessionId
                  ? styles.sessionItemActive
                  : {}),
              }}
            >
              <span
                onClick={() => setCurrentSessionId(s.id)}
                style={{ flex: 1, cursor: 'pointer' }}
              >
                {s.title}
              </span>

              <button
                style={styles.sessionAction}
                onClick={() => renameSession(s.id)}
              >
                ✏️
              </button>

              <button
                style={styles.sessionAction}
                onClick={() => deleteSession(s.id)}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
        <div style={styles.userBox}>
          <div style={styles.userEmail}>
            {user?.email}
          </div>

          <button
            style={styles.logoutButton}
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
          >
            ログアウト
          </button>
        </div>
      </aside>

      <div style={styles.container}>
        <header style={styles.header}>Gemini Chat</header>

        <div style={styles.chatArea}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                ...styles.bubble,
                ...(m.role === 'user'
                  ? styles.userBubble
                  : styles.aiBubble),
              }}
            >
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <footer style={styles.footer}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button style={styles.button} onClick={sendMessage}>
            送信
          </button>
        </footer>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  /* ===== 画面全体 ===== */
  page: {
    display: 'flex',
    height: '100vh',
    background: '#f5f5f5',
  },

  /* ===== サイドバー ===== */
  sidebar: {
    width: 260,
    background: '#1f2937',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },

  newChatButton: {
    margin: 12,
    padding: '10px 12px',
    borderRadius: 8,
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  sessionList: {
    flex: 1,
    overflowY: 'auto',
  },

  sessionItem: {
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },

  sessionAction: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },  

  sessionItemActive: {
    background: '#374151',
  },

  userBox: {
    padding: 12,
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },

  userEmail: {
    fontSize: 13,
    marginBottom: 8,
    opacity: 0.8,
  },

  logoutButton: {
    width: '100%',
    padding: '6px 0',
    background: '#ef4444',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  },  

  /* ===== チャット本体 ===== */
  container: {
    flex: 1,
    maxWidth: 900,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
  },

  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
    background: '#fafafa',
  },

  chatArea: {
    flex: 1,
    padding: 16,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    background: '#fafafa',
  },

  bubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },

  userBubble: {
    alignSelf: 'flex-end',
    background: '#DCF8C6',
  },

  aiBubble: {
    alignSelf: 'flex-start',
    background: '#fff',
  },

  footer: {
    display: 'flex',
    gap: 8,
    padding: 12,
    borderTop: '1px solid #ddd',
    background: '#fff',
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ccc',
    outline: 'none',
  },

  button: {
    padding: '0 16px',
    borderRadius: 8,
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
