export type FilterOption = {
  id: string;
  label: string;
  count?: number;
};

export type FilterGroup = {
  key: string;   // unique key, ví dụ "gender", "type"
  label: string; // nhãn hiển thị
  options: FilterOption[];
};
