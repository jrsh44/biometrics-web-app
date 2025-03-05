import { useState, useEffect } from "react";
import { Toggle } from "./Toggle";
import { ButtonReset } from "./Buttons";

interface ISliderProps {
  label: string;
  value: number | null;
  minValue: number;
  maxValue: number;
  onChange: (value: number) => void;
  defaultValue?: number;
  isToggle?: boolean;
  isToggleActive?: boolean;
  onReset?: () => void;
  onToggle?: (isToggle: boolean) => void;
}

export const Slider = (props: ISliderProps) => {
  const [isToggle, setIsToggle] = useState<boolean>(props.isToggleActive ?? false);
  const [debouncedValue, setDebouncedValue] = useState<number | null>(props.value);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedValue !== null) {
        props.onChange(debouncedValue);
      }
    }, 100);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedValue]);

  useEffect(() => {
    setDebouncedValue(props.value);
  }, [props.value]);

  return (
    <div className="flex w-full gap-4 items-center">
      <div className="flex items-center justify-between text-slate-200 w-full">
        {props.isToggle ? (
          <Toggle
            label={props.label}
            isChecked={isToggle}
            onChange={() => {
              setIsToggle(!isToggle);
              props.onToggle?.(!isToggle);
            }}
          />
        ) : (
          <>{props.label}</>
        )}

        <input
          type="range"
          min={props.minValue}
          max={props.maxValue}
          value={debouncedValue ?? props.defaultValue}
          onChange={(e) => setDebouncedValue(Number(e.target.value))}
          className={`w-3/5 appearance-none bg-gray-700 h-2 rounded-full ${props.isToggle && !isToggle ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          disabled={props.isToggle && !isToggle}
        />
      </div>
      {props.onReset && (
        <ButtonReset
          onReset={() => {
            props.onReset?.();
            setIsToggle(false);
          }}
        />
      )}
    </div>
  );
};
