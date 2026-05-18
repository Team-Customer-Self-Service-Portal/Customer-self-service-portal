import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Button } from '@mui/material';

interface Props { onVote: () => void; loading: boolean }

const HelpfulVote = ({ onVote, loading }: Props): JSX.Element => (
  <Button startIcon={<ThumbUpIcon />} onClick={onVote} disabled={loading} variant="outlined">Helpful</Button>
);

export default HelpfulVote;
