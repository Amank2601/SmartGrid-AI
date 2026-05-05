import Select from "react-select";

function MeterSelect({ meters, onSelect }) {

  const options = meters.map(m => ({
    value: m.meter_id,
    label: `${m.meter_id} (${m.serial_number})`
  }));

  return (
    <Select
      options={options}
      placeholder="Search meter by ID or Serial..."
      onChange={(selected) => onSelect(selected.value)}
    />
  );
}

export default MeterSelect;