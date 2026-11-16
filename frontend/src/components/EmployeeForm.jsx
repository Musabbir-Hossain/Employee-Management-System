import React, { useState, useEffect } from 'react';

const emptyForm = {
  fullName: '',
  email: '',
  mobileNumber: '',
  department: '',
  designation: '',
  joiningDate: '',
};

const EmployeeForm = ({ initialData, onSubmit, onCancel, submitLabel = 'Save' }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        mobileNumber: initialData.mobileNumber || '',
        department: initialData.department || '',
        designation: initialData.designation || '',
        joiningDate: initialData.joiningDate ? initialData.joiningDate.slice(0, 10) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!/^[0-9]{10,15}$/.test(form.mobileNumber)) {
      newErrors.mobileNumber = 'Enter 10 to 15 digits, including country code if needed';
    }
    if (!form.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (!form.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }
    if (!form.joiningDate) {
      newErrors.joiningDate = 'Joining date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (error) {
      // The page displays the API error; keep the form available for correction.
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    ['fullName', 'Full name', 'text', 'e.g. Mira Ahmed'],
    ['email', 'Email', 'email', 'name@company.com'],
    ['mobileNumber', 'Mobile number', 'text', 'Digits only, 10 to 15'],
    ['department', 'Department', 'text', 'e.g. Engineering'],
    ['designation', 'Designation', 'text', 'e.g. Product Designer'],
    ['joiningDate', 'Joining date', 'date', ''],
  ];

  return (
    <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
      {fields.map(([name, label, type, placeholder]) => (
        <div key={name}>
          <label className="label" htmlFor={name}>{label}</label>
          <input id={name} name={name} type={type} className={`field ${errors[name] ? '!border-danger' : ''}`} value={form[name]} onChange={handleChange} placeholder={placeholder} maxLength={name === 'mobileNumber' ? 15 : undefined} aria-invalid={!!errors[name]} />
          {errors[name] && <span className="mt-1.5 block text-sm font-medium text-danger">{errors[name]}</span>}
        </div>
      ))}
      <div className="flex flex-wrap gap-3 pt-2 sm:col-span-2">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-soft" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default EmployeeForm;
