import { Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { authApi } from '@/api';

const ForgotPassword = (): JSX.Element => {
  const [search] = useSearchParams();
  const token = search.get('token');

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card><CardContent>
        <Typography variant="h5" mb={2}>{token ? 'Reset Password' : 'Forgot Password'}</Typography>
        {!token ? (
          <Formik initialValues={{ email: '' }} validationSchema={Yup.object({ email: Yup.string().email().required() })} onSubmit={async ({ email }) => {
            await authApi.forgotPassword(email);
            toast.success('If account exists, email sent');
          }}>
            {({ values, errors, touched, handleChange }) => <Form><Stack spacing={2}><TextField name="email" label="Email" value={values.email} onChange={handleChange} error={!!(touched.email && errors.email)} helperText={touched.email && errors.email} /><Button type="submit" variant="contained">Send</Button></Stack></Form>}
          </Formik>
        ) : (
          <Formik initialValues={{ password: '' }} validationSchema={Yup.object({ password: Yup.string().min(8).required() })} onSubmit={async ({ password }) => {
            await authApi.resetPassword(token, password);
            toast.success('Password reset successful');
          }}>
            {({ values, errors, touched, handleChange }) => <Form><Stack spacing={2}><TextField name="password" label="New Password" type="password" value={values.password} onChange={handleChange} error={!!(touched.password && errors.password)} helperText={touched.password && errors.password} /><Button type="submit" variant="contained">Reset</Button></Stack></Form>}
          </Formik>
        )}
      </CardContent></Card>
    </Container>
  );
};

export default ForgotPassword;
