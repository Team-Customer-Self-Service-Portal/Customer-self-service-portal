import { Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema } from '@/utils/validators';

const Register = (): JSX.Element => {
  const { register, isLoading } = useAuth();
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card><CardContent>
        <Typography variant="h5" mb={2}>Register</Typography>
        <Formik initialValues={{ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }} validationSchema={registerSchema} onSubmit={async (values) => {
          await register({ firstName: values.firstName, lastName: values.lastName, email: values.email, password: values.password });
        }}>
          {({ values, errors, touched, handleChange }) => (
            <Form>
              <Stack spacing={2}>
                <TextField name="firstName" label="First Name" value={values.firstName} onChange={handleChange} error={!!(touched.firstName && errors.firstName)} helperText={touched.firstName && errors.firstName} />
                <TextField name="lastName" label="Last Name" value={values.lastName} onChange={handleChange} error={!!(touched.lastName && errors.lastName)} helperText={touched.lastName && errors.lastName} />
                <TextField name="email" label="Email" value={values.email} onChange={handleChange} error={!!(touched.email && errors.email)} helperText={touched.email && errors.email} />
                <TextField name="password" label="Password" type="password" value={values.password} onChange={handleChange} error={!!(touched.password && errors.password)} helperText={touched.password && errors.password} />
                <TextField name="confirmPassword" label="Confirm Password" type="password" value={values.confirmPassword} onChange={handleChange} error={!!(touched.confirmPassword && errors.confirmPassword)} helperText={touched.confirmPassword && errors.confirmPassword} />
                <Button type="submit" variant="contained" disabled={isLoading}>Create Account</Button>
                <Link to="/login">Back to login</Link>
              </Stack>
            </Form>
          )}
        </Formik>
      </CardContent></Card>
    </Container>
  );
};

export default Register;
