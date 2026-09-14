import { useState } from "react";
import type { ChangeEvent } from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className = "",
  id,
  "aria-label": ariaLabel = "Quantidade",
}: QuantitySelectorProps) {
  const [localValue, setLocalValue] = useState(value);

  const increment = () => {
    if (localValue < max) {
      const newValue = localValue + 1;
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  const decrement = () => {
    if (localValue > min) {
      const newValue = localValue - 1;
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10) || min;
    const clampedValue = Math.min(Math.max(newValue, min), max);
    setLocalValue(clampedValue);
    onChange(clampedValue);
  };

  const handleBlur = () => {
    setLocalValue(Math.min(Math.max(localValue, min), max));
  };

  return (
    <div
      className={`inline-flex items-center gap-1 shrink-0 ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-9 h-10 flex items-center justify-center rounded-lg border border-cinza-quente text-grafite-arroxeado hover:bg-cinza-quente/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Diminuir quantidade"
      >
        <Minus className="w-4 h-4" aria-hidden="true" />
      </button>
      <input
        type="text"
        id={id}
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="w-12 h-10 text-center border border-cinza-quente rounded-lg bg-branco focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent text-grafite-arroxeado"
        aria-label={ariaLabel}
        inputMode="numeric"
      />
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="w-9 h-10 flex items-center justify-center rounded-lg border border-cinza-quente text-grafite-arroxeado hover:bg-cinza-quente/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Aumentar quantidade"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
