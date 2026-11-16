import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { fetchEmployees, fetchFilterOptions, deleteEmployee, setSearch, setDepartment, setDesignation, setSort, setPage, resetPageToOne, clearFilters } from '../store/slices/employeeSlice';
import { Alert, Avatar, EmptyState, PageHeader, fmtDate } from '../components/ui';

export default function EmployeeList() {
  const dispatch = useDispatch();
  const isAdmin = useSelector((state) => state.auth.user?.role) === 'admin';
  const { employees, filterOptions, search, department, designation, sortBy, order, page, pagination, loading, error, deletingId } = useSelector((state) => state.employees);
  useEffect(() => { dispatch(fetchFilterOptions()); }, [dispatch]);
  useEffect(() => { const timer = setTimeout(() => dispatch(resetPageToOne()), 350); return () => clearTimeout(timer); }, [search, department, designation, dispatch]);
  useEffect(() => { dispatch(fetchEmployees()); }, [search, department, designation, sortBy, order, page, dispatch]);
  const sortIndicator = (field) => sortBy === field ? (order === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : null;
  const remove = (id) => { if (window.confirm('Are you sure you want to remove this employee?')) dispatch(deleteEmployee(id)); };
  const sortable = (field, label) => <th className="th" scope="col" aria-sort={sortBy === field ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}><button className="inline-flex items-center gap-1 font-semibold hover:text-ink" onClick={() => dispatch(setSort(field))}>{label}{sortIndicator(field)}</button></th>;
  const cols = isAdmin ? 6 : 4;
  return <div className="space-y-8">
    <PageHeader title={isAdmin ? 'Employee directory' : 'Team directory'} subtitle={isAdmin ? 'Manage your people, roles and team information.' : 'Find colleagues by name, team or role.'}>
      {isAdmin && <Link to="/app/employees/new" className="btn btn-primary"><Plus size={18} />Add employee</Link>}
    </PageHeader>
    <section className="card overflow-hidden">
      <div className="flex flex-wrap gap-3 border-b border-line p-4">
        <div className="relative min-w-[220px] flex-1"><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input className="field !pl-10" value={search} onChange={(e) => dispatch(setSearch(e.target.value))} placeholder="Search by name" aria-label="Search by name" /></div>
        <select className="field !w-auto" value={department} onChange={(e) => dispatch(setDepartment(e.target.value))} aria-label="Filter by department"><option value="">All departments</option>{filterOptions.departments.map((d) => <option key={d}>{d}</option>)}</select>
        <select className="field !w-auto" value={designation} onChange={(e) => dispatch(setDesignation(e.target.value))} aria-label="Filter by designation"><option value="">All designations</option>{filterOptions.designations.map((d) => <option key={d}>{d}</option>)}</select>
        {(search || department || designation) && <button className="btn btn-ghost" onClick={() => dispatch(clearFilters())}>Clear filters</button>}
      </div>
      {error && <div className="p-4"><Alert>{error}</Alert></div>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-line bg-tint/50"><tr>{sortable('fullName', 'Employee')}{sortable('department', 'Department')}{sortable('designation', 'Position')}{isAdmin && <th className="th" scope="col">Contact</th>}{sortable('joiningDate', 'Joined')}{isAdmin && <th className="th text-right" scope="col">Actions</th>}</tr></thead>
          <tbody className="divide-y divide-line">
            {loading ? <tr><td colSpan={cols} className="px-5 py-12 text-center text-sm text-muted">Loading the directory…</td></tr>
              : employees.length ? employees.map((emp, index) => <tr key={emp._id} className="hover:bg-tint/40">
                <td className="td"><div className="flex items-center gap-3"><Avatar name={emp.fullName} index={index} /><div className="min-w-0"><strong className="block truncate">{emp.fullName}</strong><small className="text-muted">{emp.email}</small></div></div></td>
                <td className="td"><span className="pill">{emp.department}</span></td>
                <td className="td">{emp.designation}</td>
                {isAdmin && <td className="td text-muted">{emp.mobileNumber}</td>}
                <td className="td text-muted">{fmtDate(emp.joiningDate)}</td>
                {isAdmin && <td className="td"><div className="flex justify-end gap-2"><Link to={`/app/employees/${emp._id}/edit`} className="btn btn-soft !px-3 !py-1.5"><Pencil size={14} />Edit</Link><button className="btn btn-danger !px-3 !py-1.5" onClick={() => remove(emp._id)} disabled={deletingId === emp._id}><Trash2 size={14} />{deletingId === emp._id ? 'Deleting…' : 'Delete'}</button></div></td>}
              </tr>)
              : <tr><td colSpan={cols}><EmptyState icon={Users} title="No employees found">Try adjusting your filters{isAdmin ? ' or add a new employee.' : '.'}</EmptyState></td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-sm text-muted">
        <span>Showing {employees.length ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, pagination.totalCount)} of {pagination.totalCount}</span>
        <div className="flex items-center gap-2"><button className="btn btn-soft !px-3 !py-1.5" disabled={!pagination.hasPrevPage} onClick={() => dispatch(setPage(page - 1))}><ChevronLeft size={16} />Previous</button><span>Page {pagination.currentPage} of {pagination.totalPages}</span><button className="btn btn-soft !px-3 !py-1.5" disabled={!pagination.hasNextPage} onClick={() => dispatch(setPage(page + 1))}>Next<ChevronRight size={16} /></button></div>
      </div>
    </section>
  </div>;
}
