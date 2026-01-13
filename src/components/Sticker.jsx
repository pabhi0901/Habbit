import React from 'react';
import './Sticker.css';

const LABEL_MAP = {
  target: '',
  sun: 'SUN',
  week: 'WEEK',
  month: 'MONTH',
  clock: 'TIME',
  rewind: 'TODAY',
  inbox: 'EMPTY',
  lotus: 'LOTUS',
  analytics: 'DATA',
  streak: 'FIRE',
  energy: 'ZEN',
  delete: 'DEL',
  blessing: 'श्री',
  check: 'DONE',
  miss: 'MISS'
};

const Sticker = ({ variant = 'target', label, size = 'md', className = '' }) => {
  const text = label || LABEL_MAP[variant] || 'STK';
  return (
    <span className={`sticker sticker-${variant} sticker-${size} ${className}`.trim()}>
      {text}
    </span>
  );
};

export default Sticker;
