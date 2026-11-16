import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import EmployeeForm from '../components/EmployeeForm';
import { Alert, PageHeader } from '../components/ui';
export default function AddEmployee() {
  const [error, setError] = useState(''); const navigate = useNavigate();
  const handleSubmit = async (formData) => { setError(''); try { await api.post('/employees', formData); navigate('/app/employees'); } catch (err) { setError(err.response?.data?.message || 'Failed to create employee'); throw err; } };
  return <div className="space-y-8">
    <PageHeader title="Add an employee" subtitle="Create a profile. If they already have an account with the same email, it links automatically."><Link to="/app/employees" className="btn btn-soft"><ArrowLeft size={16} />Back to directory</Link></PageHeader>
    <Alert>{error}</Alert>
    <div className="card p-6 sm:p-8"><EmployeeForm onSubmit={handleSubmit} onCancel={() => navigate('/app/employees')} submitLabel="Create employee" /></div>
  </div>;
}
