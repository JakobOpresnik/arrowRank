import type { InputProps } from '@mui/joy';
import { Input } from '@mui/joy';
import { TARGET_TOTAL_SCORE } from '../constants';

const INPUT_WIDTH = 150;

interface ScoreInputProps extends InputProps {
  scoreKey?: string;
  min?: number;
  max?: number;
}

const ScoreInput = (props: ScoreInputProps) => (
  <Input
    {...props}
    sx={{ width: INPUT_WIDTH }}
    slotProps={{
      input: {
        min: props.min ?? 0, // cannot be negative
        max: props.max ?? TARGET_TOTAL_SCORE, // maximum score per round
        ...props.slotProps?.input, // allow overriding
      },
    }}
  />
);

export default ScoreInput;
