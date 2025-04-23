type RadioOption = {
  value: string;
  label: string;
};

interface IRadioProps {
  value?: string;
  options: RadioOption[];
  onChange: (val: string) => void;
  label?: string;
}

export const Radio = (props: IRadioProps) => {
  return (
    <div className="flex gap-4 items-center">
      {props.label && <span className={"text-lg text-blue-50"}>{props.label}</span>}
      <div className="flex flex-col items-start">
        {props.options.map((option) => (
          <div
            className="flex gap-2 items-center cursor-pointer hover:underline"
            key={`radio-${option.value}`}
            onClick={() => props.onChange(option.value)}
          >
            <input
              className="px-3 py-2 rounded bg-gray-700 border border-gray-500 text-white cursor-pointer"
              type="radio"
              checked={option.value === props.value}
            />
            <span className={"text-md text-blue-50"}>{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
