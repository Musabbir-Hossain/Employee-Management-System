import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import EmployeeForm from '../components/EmployeeForm';
import { Alert, Loading, PageHeader } from '../components/ui';
export default function EditEmployee() {
  const { id } = useParams(); const [employee, setEmployee] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const navigate = useNavigate();
  useEffect(() => { api.get(`/employees/${id}`).then(({ data }) => setEmployee(data)).catch((err) => setError(err.response?.data?.message || 'Failed to load employee')).finally(() => setLoading(false)); }, [id]);
  const handleSubmit = async (formData) => { setError(''); try { await api.put(`/employees/${id}`, formData); navigate('/app/employees'); } catch (err) { setError(err.response?.data?.message || 'Failed to update employee'); throw err; } };
  return <div className="space-y-8">
    <PageHeader title={employee ? employee.fullName : 'Edit employee'} subtitle="Keep their details accurate and up to date."><Link to="/app/employees" className="btn btn-soft"><ArrowLeft size={16} />Back to directory</Link></PageHeader>
    <Alert>{error}</Alert>
    {loading ? <Loading>Loading employee…</Loading> : employee && <div className="card p-6 sm:p-8"><EmployeeForm initialData={employee} onSubmit={handleSubmit} onCancel={() => navigate('/app/employees')} submitLabel="Save changes" /></div>}
  </div>;
}
