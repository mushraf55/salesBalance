import React, { useState } from "react";

const parseRange = (rangeStr) => {
  const [min, max] = rangeStr.split("-").map((val) => parseFloat(val.trim()));
  return { min, max };
};

const calculateResult = (raw, treated, range) => {
  const r = parseFloat(raw);
  const t = parseFloat(treated);
  if (isNaN(r) || isNaN(t) || !range) return "";

  const { min, max } = parseRange(range);
  if (isNaN(min) || isNaN(max)) return "Fail";

  if (t < min) return "Low";
  if (t > max) return "High";
  return "Pass";
};

const WaterAnalysisForm = ({ onDataChange }) => {
  const [rows, setRows] = useState([
    { parameter: "TDS", rawWater: "", treatedWater: "", range: "50-150", result: "" },
    { parameter: "pH", rawWater: "", treatedWater: "", range: "6.5-8.5", result: "" },
    { parameter: "Total Hardness", rawWater: "", treatedWater: "", range: "60-120", result: "" },
    { parameter: "Chlorine", rawWater: "", treatedWater: "", range: "0.2-0.5", result: "" },
  ]);

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (["rawWater", "treatedWater", "range"].includes(field)) {
      updatedRows[index].result = calculateResult(
        updatedRows[index].rawWater,
        updatedRows[index].treatedWater,
        updatedRows[index].range
      );
    }

    setRows(updatedRows);
    onDataChange(updatedRows); 
  };

  return (
    <div className="mb-4">
      <h4 className="text-primary">Water Analysis Report (ppm)</h4>
      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>Parameter</th>
            <th>Raw Water</th>
            <th>Treated Water</th>
            <th>Range</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.parameter}</td>
              <td>
                <input
                  className="form-control"
                  type="number"
                  value={row.rawWater}
                  onChange={(e) => handleInputChange(index, "rawWater", e.target.value)}
                />
              </td>
              <td>
                <input
                  className="form-control"
                  type="number"
                  value={row.treatedWater}
                  onChange={(e) => handleInputChange(index, "treatedWater", e.target.value)}
                />
              </td>
              <td>
                <input
                  className="form-control"
                  type="text"
                  value={row.range}
                  onChange={(e) => handleInputChange(index, "range", e.target.value)}
                />
              </td>
              <td>
                <input
                  className="form-control"
                  type="text"
                  value={row.result}
                  disabled
                  style={{ backgroundColor: "#e9ecef" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WaterAnalysisForm;
