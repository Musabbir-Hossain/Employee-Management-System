import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AppShell from './layout/AppShell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Reports from './pages/Reports';
import Users from './pages/Users';

function Workspace() {
  return <ProtectedRoute><AppShell /></ProtectedRoute>;
}
const adminOnly = (el) => <RoleRoute role="admin">{el}</RoleRoute>;

export default function App() {
  return <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/app" element={<Workspace />}>
      <Route index element={<Dashboard />} />
      <Route path="employees" element={<EmployeeList />} />
      <Route path="employees/new" element={adminOnly(<AddEmployee />)} />
      <Route path="employees/:id/edit" element={adminOnly(<EditEmployee />)} />
      <Route path="departments" element={<Departments />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="leaves" element={<Leaves />} />
      <Route path="reports" element={adminOnly(<Reports />)} />
      <Route path="users" element={adminOnly(<Users />)} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
