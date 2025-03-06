import { Icon, TIconName } from "./Icon";

interface IButtonProps {
  label: string;
  onClick: () => void;
}

export const Button = (props: IButtonProps) => (
  <button
    className="flex w-full justify-center border-2 p-4 text-slate-200 border-gray-600 hover:border-slate-200 transition-all cursor-pointer"
    onClick={props.onClick}
  >
    {props.label}
  </button>
);

interface IButtonIconProps {
  onClick: () => void;
  icon: TIconName;
  className?: string;
  title?: string;
}

export const ButtonIcon = (props: IButtonIconProps) => (
  <button
    className={`cursor-pointer flex items-center h-fit p-2 border-2 rounded-md bg-neutral-700  hover:bg-neutral-600 ${props.className}`}
    onClick={props.onClick}
    title={props.title}
  >
    <Icon name={props.icon} size={24} />
  </button>
);

interface IButtonDeleteProps {
  onDelete: () => void;
  className?: string;
}

export const ButtonDelete = (props: IButtonDeleteProps) => (
  <ButtonIcon
    onClick={props.onDelete}
    icon="cross"
    className={`text-rose-500 ${props.className}`}
    title="Usuń"
  />
);

interface IButtonResetProps {
  onReset: () => void;
  className?: string;
}

export const ButtonReset = (props: IButtonResetProps) => (
  <ButtonIcon
    onClick={props.onReset}
    icon="revert"
    title="Resetuj"
    className={`text-neutral-100 ${props.className}`}
  />
);

interface IButtonDownloadProps {
  onDownload: () => void;
  className?: string;
}

export const ButtonDownload = (props: IButtonDownloadProps) => (
  <ButtonIcon
    onClick={props.onDownload}
    icon="download"
    title="Pobierz"
    className={`text-emerald-600 ${props.className}`}
  />
);
