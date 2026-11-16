import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../store/slices/authSlice';
import AuthLayout from '../components/AuthLayout';
import { Alert } from '../components/ui';

export default function Register() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [formError, setFormError] = useState('');
  const dispatch = useDispatch(); const navigate = useNavigate(); const { loading, error, user } = useSelector((state) => state.auth);
  useEffect(() => () => dispatch(clearAuthError()), [dispatch]); useEffect(() => { if (user) navigate('/app'); }, [user, navigate]);
  const submit = (e) => { e.preventDefault(); setFormError(''); if (!name.trim() || !email.trim() || !password) return setFormError('Please complete every field.'); if (password.length < 6) return setFormError('Use at least 6 characters for your password.'); if (password !== confirmPassword) return setFormError('Your passwords do not match.'); dispatch(registerUser({ name, email, password })); };
  return (
    <AuthLayout title="Create your account" subtitle="New accounts join as members. An admin can change your role later." footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand underline-offset-4 hover:underline">Sign in</Link></>}>
      <Alert>{formError || error}</Alert>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><label className="label" htmlFor="name">Full name</label><input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" required /></div>
        <div><label className="label" htmlFor="email">Work email</label><input id="email" className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="email" required /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="password">Password</label><input id="password" className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6+ characters" autoComplete="new-password" required /></div>
          <div><label className="label" htmlFor="confirm">Confirm</label><input id="confirm" className="field" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat it" autoComplete="new-password" required /></div>
        </div>
        <button className="btn btn-primary w-full !py-3" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthLayout>
  );
}
