import { ChevronDown } from "lucide-react";

const SortControl = ({ sortBy, onChange }) => {
  return (
    <label className="sort-control">
      Sort
      <span className="sort-select-wrap">
        <select value={sortBy} onChange={(event) => onChange(event.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">A–Z</option>
        </select>
        <ChevronDown size={16} className="sort-icon" aria-hidden="true" />
      </span>
    </label>
  );
};

export default SortControl;
