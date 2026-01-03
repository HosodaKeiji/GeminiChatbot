import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    const res = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      alert('ログイン失敗');
      return;
    }

    const data = await res.json();
    localStorage.setItem('token', data.accessToken);
    navigate('/chat');
  };

  return (
    <div>
      <h2>ログイン</h2>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={submit}>ログイン</button>

      <p>
        <Link to="/signup">新規登録はこちら</Link>
      </p>
    </div>
  );
}
