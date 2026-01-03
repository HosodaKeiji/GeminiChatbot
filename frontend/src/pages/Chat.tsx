import { useEffect, useRef, useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const accessToken = localStorage.getItem('token');

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    const res = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: data.reply },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    // ★ 画面全体の中央寄せ用ラッパー
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>Gemini Chat</header>

        <div style={styles.chatArea}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.bubble,
                ...(msg.role === 'user'
                  ? styles.userBubble
                  : styles.aiBubble),
              }}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.bubble, ...styles.aiBubble }}>
              Typing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <footer style={styles.footer}>
          <input
            style={styles.input}
            value={input}
            placeholder="メッセージを入力..."
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
  // ★ これが無いと中央に来ない
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },

  // ★ 中央寄せの本体
  container: {
    maxWidth: 900,
    width: '100%',
    height: '100vh',
    margin: '0 auto', // ← これが決定打
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
  },

  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
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
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ccc',
  },
  button: {
    padding: '0 16px',
    borderRadius: 8,
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
  },
};
