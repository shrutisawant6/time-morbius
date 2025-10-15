
import React from "react";
import type { TimeZoneOption } from "../types/types"

interface Props {
  timeZones: TimeZoneOption[];
  selectedTimeZone: TimeZoneOption;
  onChange: (tz: TimeZoneOption) => void;
}

const TimeZoneSelector: React.FC<Props> = ({ timeZones, selectedTimeZone, onChange }) => {
  return (
    <div>
      <label htmlFor="timezone" style={{ fontWeight: "bold" }}>
      </label>
      <select
        id="timezone"
        value={selectedTimeZone.label}
        onChange={(e) =>
          onChange(timeZones.find((tz) => tz.label === e.target.value) || timeZones[0])
        }
      >
        {timeZones.map((tz) => (
          <option key={tz.label} value={tz.label}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeZoneSelector;
