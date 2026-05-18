import { Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { usersApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';

const Profile = (): JSX.Element => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const updateProfile = useMutation({ mutationFn: usersApi.updateProfile, onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profile updated'); } });
  const changePassword = useMutation({ mutationFn: usersApi.changePassword, onSuccess: () => toast.success('Password updated') });

  if (!user) return <Typography>User unavailable</Typography>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card><CardContent>
          <Typography variant="h6" mb={2}>Edit Profile</Typography>
          <Formik initialValues={{ firstName: user.firstName, lastName: user.lastName }} validationSchema={Yup.object({ firstName: Yup.string().required(), lastName: Yup.string().required() })} onSubmit={async (values) => updateProfile.mutateAsync(values)}>
            {({ values, handleChange }) => <Form><Stack spacing={2}><TextField name="firstName" value={values.firstName} onChange={handleChange} /><TextField name="lastName" value={values.lastName} onChange={handleChange} /><Button type="submit" variant="contained">Save</Button></Stack></Form>}
          </Formik>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card><CardContent>
          <Typography variant="h6" mb={2}>Change Password</Typography>
          <Formik initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }} validationSchema={Yup.object({ currentPassword: Yup.string().required(), newPassword: Yup.string().min(8).required(), confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')]).required() })} onSubmit={async (v) => changePassword.mutateAsync({ currentPassword: v.currentPassword, newPassword: v.newPassword })}>
            {({ values, handleChange }) => <Form><Stack spacing={2}><TextField name="currentPassword" type="password" value={values.currentPassword} onChange={handleChange} /><TextField name="newPassword" type="password" value={values.newPassword} onChange={handleChange} /><TextField name="confirmPassword" type="password" value={values.confirmPassword} onChange={handleChange} /><Button type="submit" variant="contained">Update</Button></Stack></Form>}
          </Formik>
        </CardContent></Card>
      </Grid>
    </Grid>
  );
};

export default Profile;
