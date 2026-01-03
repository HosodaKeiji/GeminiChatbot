import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    const res = await fetch('http://localhost:3000/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      alert('登録失敗');
      return;
    }

    alert('登録成功！ログインしてください');
    navigate('/login');
  };

  return (
    <div>
      <h2>サインアップ</h2>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={submit}>登録</button>

      <p>
        <Link to="/login">ログインに戻る</Link>
      </p>
    </div>
  );
}
