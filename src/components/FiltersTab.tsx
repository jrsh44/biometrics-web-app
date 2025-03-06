import { Filter, IFilterProps } from "./ui/Filter";

interface IFiltersTabProps {
  filters: IFilterProps[];
}

export const FiltersTab = (props: IFiltersTabProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 pt-4">
      {props.filters.map((filter) => (
        <Filter
          key={filter.label}
          label={filter.label}
          defaultKernels={filter.defaultKernels}
          onFilterApply={filter.onFilterApply}
          kernelsDescription={filter.kernelsDescription}
        />
      ))}
    </div>
  );
};
