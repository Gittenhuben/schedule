import styles from './SelectInterval.module.css';
import type { ChangeEvent } from 'react';

interface SelectIntervalProps {
  text: string;
  defaultValue: string;
  handleChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectInterval: React.FC<SelectIntervalProps> = ({ text, defaultValue, handleChange }) => {
  return (
    <div className={styles['nav-subcontainer']}>
      <span className={styles['nav-span']}>{text}</span>
      <select
        className={styles['select']}
        defaultValue={defaultValue}
        onChange={handleChange}
      >
        <option value='60'>60 min</option>
        <option value='30'>30 min</option>
        <option value='15'>15 min</option>
        <option value='10'>10 min</option>
        <option value='5'>5 min</option>
      </select>
    </div>  
  );
};
