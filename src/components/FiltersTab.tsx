import { Filter } from "./ui/Filter";

export type TFilter = {
  label: string;
  defaultKernel: number[][];
  onFilterApply: (kernel: number[][]) => void;
};

interface IFiltersTabProps {
  filters: TFilter[];
}

export const FiltersTab = (props: IFiltersTabProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 pt-4">
      {props.filters.map((filter) => (
        <Filter
          key={filter.label}
          defaultKernel={filter.defaultKernel}
          label={filter.label}
          onFilterApply={filter.onFilterApply}
        />
      ))}
    </div>
  );
};
