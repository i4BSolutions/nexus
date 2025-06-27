import { Typography, Input, Row, Col, Select, Space } from "antd";

type FilterOption = {
  key: string;
  label?: string;
  placeholder?: string;
  value?: string | undefined;
  options: { label: string; value: string }[];
};

type Props = {
  searchPlaceholder?: string;
  showSearch?: boolean;
  onSearch?: (text: string) => void;
  filters: FilterOption[];
  onFilterChange: (key: string, value?: string) => void;
  onClearFilters: () => void;
};

const SearchAndFilters = ({
  searchPlaceholder = "Search...",
  showSearch = true,
  onSearch,
  filters,
  onFilterChange,
  onClearFilters,
}: Props) => (
  <Row gutter={16} className="mb-4" align="middle" justify="space-between">
    <Col span={12}>
      {showSearch && onSearch && (
        <Input.Search
          placeholder={searchPlaceholder}
          allowClear
          onSearch={onSearch}
        />
      )}
    </Col>
    <Col span={12} style={{ textAlign: "right" }}>
      <Space>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Filter(s):
        </Typography.Text>

        {filters.map(({ key, label, placeholder, value, options }) => (
          <Select
            key={key}
            allowClear
            placeholder={placeholder || `Select ${label || key}`}
            value={value}
            style={{ width: 140, textAlign: "left" }}
            onChange={(val) => onFilterChange(key, val)}
          >
            {options.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        ))}

        <Typography.Text
          onClick={onClearFilters}
          style={{ fontSize: 12, color: "#1890FF", cursor: "pointer" }}
        >
          Clear Filter(s)
        </Typography.Text>
      </Space>
    </Col>
  </Row>
);

export default SearchAndFilters;
