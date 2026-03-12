import React from 'react';
import styles from './Slider.module.css';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange }) => {
  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.sliderHeader}>
        <label className={styles.label}>{label}</label>
        <span className={styles.value}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={styles.slider}
      />
      <div className={styles.sliderTicks}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Slider;