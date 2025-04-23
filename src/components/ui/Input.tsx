import { useEffect, useState } from "react";

interface IInputProps {
  value?: string;
  onChange: (val: string) => void;
  type: "text" | "number";
  placeholder?: string;
  label?: string;
  minValue?: number;
  maxValue?: number;
}

export const Input = (props: IInputProps) => {
  const [visibleValue, setVisibleValue] = useState<string>(props.value ?? "");

  const validateChange = () => {
    switch (props.type) {
      case "text": {
        props.onChange(visibleValue);
        break;
      }
      case "number": {
        let numberValue = Number(visibleValue);
        if (props.minValue) numberValue = Math.max(props.minValue, numberValue);
        if (props.maxValue) numberValue = Math.min(props.maxValue, numberValue);
        setVisibleValue(numberValue.toString());
        props.onChange(numberValue.toString());
        break;
      }
    }
  };

  useEffect(() => {
    setVisibleValue(props.value ?? "");
  }, [props.value]);

  return (
    <div className="flex gap-2 items-center">
      {props.label && <span className={"text-lg text-blue-50"}>{props.label}</span>}
      <input
        className="flex-grow px-3 py-2 rounded bg-gray-700 border border-gray-500 text-white h-11"
        type={props.type}
        placeholder={props.placeholder}
        value={visibleValue}
        onChange={(e) => setVisibleValue(e.target.value)}
        onBlur={validateChange}
        min={props.minValue}
        max={props.maxValue}
      />
    </div>
  );
};
