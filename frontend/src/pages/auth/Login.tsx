import { Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/utils/validators';

const Login = (): JSX.Element => {
  const { login, isLoading } = useAuth();
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card><CardContent>
        <Typography variant="h5" mb={2}>Login</Typography>
        <Formik initialValues={{ email: '', password: '' }} validationSchema={loginSchema} onSubmit={async (values) => login(values)}>
          {({ values, errors, touched, handleChange }) => (
            <Form>
              <Stack spacing={2}>
                <TextField name="email" label="Email" value={values.email} onChange={handleChange} error={!!(touched.email && errors.email)} helperText={touched.email && errors.email} />
                <TextField name="password" label="Password" type="password" value={values.password} onChange={handleChange} error={!!(touched.password && errors.password)} helperText={touched.password && errors.password} />
                <Button type="submit" variant="contained" disabled={isLoading}>Sign In</Button>
                <Stack direction="row" justifyContent="space-between">
                  <Link to="/register">Create account</Link>
                  <Link to="/forgot-password">Forgot password?</Link>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      </CardContent></Card>
    </Container>
  );
};

export default Login;
