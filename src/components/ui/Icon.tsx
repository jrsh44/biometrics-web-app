export type TIconName = "revert";

interface IIconProps {
  name: TIconName;
  size?: number;
  className?: string;
}

export const Icon = (props: IIconProps) => (
  <div className={`inline-block h-full ${props.className ?? ""}`}>
    <div
      className={` h-full flex items-center text-inherit text-[${props.size ?? 24}px] icon-${props.name}`}
    />
  </div>
);
