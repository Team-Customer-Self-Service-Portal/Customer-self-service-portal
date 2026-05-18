import { Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useCreateCase } from '@/hooks/useCases';
import { CASE_CATEGORIES } from '@/utils/constants';

const CreateCase = (): JSX.Element => {
  const nav = useNavigate();
  const create = useCreateCase();

  return (
    <Card><CardContent>
      <Typography variant="h5" mb={2}>Create Case</Typography>
      <Formik
        initialValues={{ subject: '', description: '', priority: 'Medium', category: 'General' }}
        validationSchema={Yup.object({ subject: Yup.string().required(), description: Yup.string().required(), priority: Yup.string().required(), category: Yup.string().required() })}
        onSubmit={async (values) => {
          const item = await create.mutateAsync(values as { subject: string; description: string; priority: 'Low'|'Medium'|'High'|'Critical'; category: string });
          nav(`/cases/${item._id}`);
        }}
      >
        {({ values, errors, touched, handleChange }) => (
          <Form><Stack spacing={2}>
            <TextField name="subject" label="Subject" value={values.subject} onChange={handleChange} error={!!(touched.subject && errors.subject)} helperText={touched.subject && errors.subject} />
            <TextField name="description" label="Description" multiline minRows={4} value={values.description} onChange={handleChange} error={!!(touched.description && errors.description)} helperText={touched.description && errors.description} />
            <TextField select name="priority" label="Priority" value={values.priority} onChange={handleChange}>{['Low','Medium','High','Critical'].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}</TextField>
            <TextField select name="category" label="Category" value={values.category} onChange={handleChange}>{CASE_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField>
            <Button type="submit" variant="contained" disabled={create.isPending}>Create</Button>
          </Stack></Form>
        )}
      </Formik>
    </CardContent></Card>
  );
};

export default CreateCase;
