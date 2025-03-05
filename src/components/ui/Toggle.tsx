interface IToggleProps {
  label: string;
  isChecked: boolean;
  onChange: (value: boolean) => void;
}

export const Toggle = (props: IToggleProps) => (
  <label className="inline-flex items-center cursor-pointer gap-4 select-none w-fit">
    <input
      id={props.label}
      type="checkbox"
      checked={props.isChecked}
      className="sr-only peer"
      onChange={() => props.onChange(!props.isChecked)}
    />
    <div className="relative w-11 h-6 peer-focus:outline-none rounded-full peer bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-cyan-700" />
    <span className="text-gray-900 dark:text-gray-300">{props.label}</span>
  </label>
);
