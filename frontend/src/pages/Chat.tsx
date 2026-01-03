import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('ログインしてください');
      return;
    }

    // 先に自分の発言を表示
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');

    const res = await fetch('http://localhost:3000/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: data.reply },
    ]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat</h2>

      <div style={{ border: '1px solid #ccc', padding: 10, height: 300, overflowY: 'auto' }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.role}:</b> {m.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="メッセージを入力"
      />
      <button onClick={sendMessage}>送信</button>
    </div>
  );
}
