import { type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  wrapperClassName?: string;
}

export function Slider({
  label,
  showValue = true,
  valueFormatter,
  min = 0,
  max = 100,
  value,
  defaultValue,
  className,
  wrapperClassName,
  id,
  ...props
}: SliderProps) {
  const sliderId =
    id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const displayValue = value ?? defaultValue ?? min;
  const formatted = valueFormatter
    ? valueFormatter(Number(displayValue))
    : String(displayValue);

  return (
    <div className={cn('flex flex-col gap-2', wrapperClassName)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={sliderId}
              className="text-sm font-medium text-gray-700 select-none"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-500 tabular-nums">
              {formatted}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        id={sliderId}
        min={min}
        max={max}
        value={value}
        defaultValue={defaultValue}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer',
          'bg-gray-200 accent-blue-600',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          className
        )}
        {...props}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{String(min)}</span>
        <span className="text-xs text-gray-500">{String(max)}</span>
      </div>
    </div>
  );
}
