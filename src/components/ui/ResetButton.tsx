import { Icon } from "./Icon";

interface IResetButtonProps {
  onReset: () => void;
  className?: string;
}

export const ResetButton = (props: IResetButtonProps) => (
  <button
    className={`cursor-pointer flex items-center h-fit p-2 border-2 rounded-md bg-neutral-700 text-neutral-100 hover:bg-neutral-600 ${props.className}`}
    onClick={props.onReset}
  >
    <Icon name="revert" size={24} />
  </button>
);
