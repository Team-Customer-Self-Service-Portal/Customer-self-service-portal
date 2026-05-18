import { MenuItem, Pagination, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { usersApi } from '@/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/formatters';

const UserManagement = (): JSX.Element => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['users', page], queryFn: () => usersApi.getUsers({ page, limit: 10 }) });
  const roleMutation = useMutation({ mutationFn: ({ id, role }: { id: string; role: string }) => usersApi.updateUserRole(id, role), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });

  const filtered = useMemo(() => (q.data?.data || []).filter((u) => u.email.toLowerCase().includes(search.toLowerCase())), [q.data?.data, search]);

  if (q.isLoading) return <LoadingSpinner />;

  return (
    <Stack spacing={2}>
      <Typography variant="h5">User Management</Typography>
      <TextField label="Search by email" value={search} onChange={(e) => setSearch(e.target.value)} />
      <Table>
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell></TableRow></TableHead>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u._id}>
              <TableCell>{u.firstName} {u.lastName}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell><TextField select value={u.role} onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })}>{['customer','agent','admin'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}</TextField></TableCell>
              <TableCell>{u.isActive ? 'Active' : 'Inactive'}</TableCell>
              <TableCell>{formatDate(u.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination page={page} count={q.data?.pagination.pages || 1} onChange={(_, p) => setPage(p)} />
    </Stack>
  );
};

export default UserManagement;
