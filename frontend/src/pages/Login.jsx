import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../store/slices/authSlice';
import AuthLayout from '../components/AuthLayout';
import { Alert } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);
  useEffect(() => { if (user) navigate('/app'); }, [user, navigate]);

  const submit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!email.trim() || !password.trim()) {
      return setFormError('Enter your email and password to continue.');
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your workspace."
      footer={<>New here? <Link to="/register" className="font-semibold text-brand underline-offset-4 hover:underline">Create an account</Link></>}
    >
      <Alert>{formError || error}</Alert>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            className="field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            className="field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            required
          />
        </div>
        <button className="btn btn-primary w-full !py-3" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
