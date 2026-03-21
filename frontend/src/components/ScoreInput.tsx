import { NumberInput, type NumberInputProps } from '@mantine/core';
import { TARGET_TOTAL_SCORE } from '../constants';

const INPUT_WIDTH = 115;

interface ScoreInputProps extends NumberInputProps {
  scoreKey?: string;
}

const ScoreInput = ({ scoreKey: _scoreKey, ...props }: ScoreInputProps) => (
  <NumberInput
    {...props}
    w={INPUT_WIDTH}
    min={props.min ?? 0}
    max={props.max ?? TARGET_TOTAL_SCORE}
    clampBehavior='strict'
    allowDecimal={false}
  />
);

export default ScoreInput;
