import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useCreatePost } from '@/hooks/useCommunity';

const CreatePost = (): JSX.Element => {
  const nav = useNavigate();
  const create = useCreatePost();

  return (
    <Card><CardContent>
      <Typography variant="h5" mb={2}>Ask a Question</Typography>
      <Formik initialValues={{ title: '', body: '', category: 'General', tags: '' }} validationSchema={Yup.object({ title: Yup.string().required(), body: Yup.string().required(), category: Yup.string().required() })} onSubmit={async (values) => {
        const post = await create.mutateAsync({ title: values.title, body: values.body, category: values.category, tags: values.tags.split(',').map((x) => x.trim()).filter(Boolean) });
        nav(`/community/${post._id}`);
      }}>
        {({ values, handleChange }) => <Form><Stack spacing={2}><TextField name="title" label="Title" value={values.title} onChange={handleChange} /><TextField name="body" label="Body" multiline minRows={4} value={values.body} onChange={handleChange} /><TextField name="category" label="Category" value={values.category} onChange={handleChange} /><TextField name="tags" label="Tags (comma separated)" value={values.tags} onChange={handleChange} /><Button type="submit" variant="contained">Create</Button></Stack></Form>}
      </Formik>
    </CardContent></Card>
  );
};

export default CreatePost;
