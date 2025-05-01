import React, { useState, useRef, useEffect } from "react";
import ServiceReportPreview from "./serviceReport";
import WaterAnalysisForm from "./signatureCanvas"; // Adjust path as needed
import axios from "axios";

const ServiceReportInput = () => {
  const [formData, setFormData] = useState({
    reportNo: "",
    requisition: "",
    customerName: "",
    address: "",
    location: "",
    faultReportedBy: "",
    date: "",
    equipmentType: "",
    itemModel: "",
    manufacturer: "",
    serialNo: "",
    workDetails: "",
    detailsOfParts: "",
    notes: "",
    arrivalTime: "",
    hoursSpent: "",
    timeCompleted: "",
    technician: "",
    itemsUsed: [],
    itemsNeeded: [],
    signature: null,
    otherifany:"",
    images: [],
    types: {
      workshop: false,
      warranty: false,
      amc: false,
      inspection: false,
      repair: false,
    },
  });

  const [showPreview, setShowPreview] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const canvasRef = useRef(null); // Reference for the canvas element
  const ctxRef = useRef(null); // Reference for the canvas context
  const [waterAnalysisData, setWaterAnalysisData] = useState([]);

   //api call for report number
   useEffect(() => {
    const fetchReportNo = async () => {
      try {
        const res = await axios.get("http://localhost:7500/api/reportNumber/generate-report-no");
        setFormData((prev) => ({
          ...prev,
          reportNo: res.data.reportNo,
        }));
      } catch (error) {
        console.error("Error fetching report number", error);
      }
    };

    fetchReportNo();
  }, []);
  //api call code ends

  // Initialize canvas context when the component is mounted
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctxRef.current = ctx;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "black";
    }
  }, []);

  // Handle mouse/touch start to begin drawing
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top
      );
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
    }
  };

  // Handle mouse/touch move to draw
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.lineTo(
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top
      );
      ctx.stroke();
    }
  };

  // Handle mouse/touch end to stop drawing
  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(
        e.touches[0].clientX - canvas.getBoundingClientRect().left,
        e.touches[0].clientY - canvas.getBoundingClientRect().top
      );
      canvas.addEventListener("touchmove", handleTouchMove);
      canvas.addEventListener("touchend", handleTouchEnd);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.lineTo(
        e.touches[0].clientX - canvas.getBoundingClientRect().left,
        e.touches[0].clientY - canvas.getBoundingClientRect().top
      );
      ctx.stroke();
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureDataUrl(null);
      setFormData((prev) => ({ ...prev, signature: null }));
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      setSignatureDataUrl(dataUrl);
      setFormData((prev) => ({ ...prev, signature: dataUrl }));
    }
  };

  const calculateHoursSpent = (arrival, completed) => {
    if (arrival && completed) {
      const [aH, aM] = arrival.split(":").map(Number);
      const [cH, cM] = completed.split(":").map(Number);
      const arrivalDate = new Date(0, 0, 0, aH, aM);
      const completedDate = new Date(0, 0, 0, cH, cM);
      let diff = (completedDate - arrivalDate) / (1000 * 60 * 60);
      if (diff < 0) diff += 24;
      return diff.toFixed(2);
    }
    return "";
  };
  const handlePreview = () => {
    saveSignature(); // Save the signature to the state

    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        waterAnalysis: waterAnalysisData, // Merge water analysis data here
      }));
      setShowPreview(true);
    }, 100); // Delay to ensure signature updates first
  };



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (
      ["workshop", "warranty", "amc", "inspection", "repair"].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        types: { ...prev.types, [name]: checked },
      }));
    } else {
      const updatedData = { ...formData, [name]: value };

      if (name === "arrivalTime" || name === "timeCompleted") {
        updatedData.hoursSpent = calculateHoursSpent(
          name === "arrivalTime" ? value : formData.arrivalTime,
          name === "timeCompleted" ? value : formData.timeCompleted
        );
      }

      setFormData(updatedData);
    }
    const fullData = {
      ...formData,
      waterAnalysis: waterAnalysisData,
    };

    console.log("Final Data", fullData);
  };

  if (showPreview) {
    return <ServiceReportPreview data={formData} />;
  }

 
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 text-primary">ALL ZONES Service Report</h2>
      <p className="text-center mb-4 text-primary">
        Fill Up the form to generate the service report
      </p>

      <div className="row g-3">
      <div className="col-md-4">
  <label className="form-label">Report No.</label>
  <input
    className="form-control"
    name="reportNo"
    value={formData.reportNo}
    readOnly
  />
</div>
        <div className="col-md-4">
          <label className="form-label">Requisition / Call</label>
          <input
            className="form-control"
            placeholder="Enter Requisition / Call"
            name="requisition"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Customer Name</label>
          <input
            className="form-control"
            placeholder="Enter Customer Name"
            name="customerName"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Address</label>
          <input
            className="form-control"
            placeholder="Enter Address"
            name="address"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Location</label>
          <input
            className="form-control"
            placeholder="Enter Location"
            name="location"
            onChange={handleChange}
          />
        </div>

        

        <div className="col-md-4">
          <label className="form-label">Fault Reported By</label>
          <input
            className="form-control"
            name="faultReportedBy"
            placeholder="Fault Reported By"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Other If Any</label>
          <input
            className="form-control"
            name="otherifany"
            placeholder="Other If Any"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Date</label>
          <input
            className="form-control"
            type="date"
            name="date"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Equipment Type</label>
          <input
            className="form-control"
            placeholder="Enter Equipment Type"
            name="equipmentType"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Item and Model No</label>
          <input
            className="form-control"
            placeholder="Enter Item and Model No."
            name="itemModel"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Manufacturer</label>
          <input
            className="form-control"
            name="manufacturer"
            placeholder="Enter Manufacture Name"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Serial No</label>
          <input
            className="form-control"
            name="serialNo"
            placeholder="Enter Serial No."
            onChange={handleChange}
          />
        </div>

        <div className="col-md-12">
          <label className="form-label">Details of Work Carried Out</label>
          <textarea
            className="form-control"
            placeholder="Enter Details of Work Carried Out"
            rows={3}
            name="workDetails"
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="col-md-6">
          <label className="form-label text-primary">
            Details of Items Used
          </label>

          <details
  style={{
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
  }}
>
  <summary className="text-secondary mb-2">
    Select Items Used (Click to expand)
  </summary>

  <div
    style={{
      maxHeight: "300px", // adjust height as needed
      overflowY: "auto",
      borderTop: "1px solid #ddd",
      paddingTop: "10px",
    }}
  >
    {[
     "EW evolution Refiner Power",
                "EW evolution Refiner Boost",
                "EW evolution 200 Compact",
                "EW SMART DIRECT REVERSE OSMOSIS eDRO+",
                "EU Pallas Enjoy Smart",
                "EU Robin Premium AE Maxi Softener",
                "EU Pallas Enjoy Slim 300GPD Direct Flow",
                "EU Pallas Enjoy Cool SO",
                "EU Robin Premium AE Mini Softener",
                "EU Pallas Enjoy Slim Digital 400 GPD DF",
                "EU VISION WATER REVERSE OSMOSIS 100",
                "FT Compact RO HORECA",
                "FT Commercial RO",
                "FT FC130 Carbon Filter",
                "FT RO Membrane-330",
                "PW KWE-4HC-H KWH3200S",
                "PW KWE-5MKDF",
                "PW KWE-5M-KDF-P",
                "PW KWE-ELF-DK7",
                "PW KWS-10 Scale Stick",
                "PW KWE - I2000-4000",
                "PW KWE-MC2",
                "HP Fountain & Combination Large",
                "HP Fountain & Combination Small",
                "HP COFFEE Large",
                "HP COFFEE Small",
                "HP DISHWASHING Large",
                "HP DISHWASHING Small",
                "HP ICE Large",
                "HP ICE Small",
                "HP OVEN Large",
                "HP OVEN Small",
                "HP Single Head",
                "HP Twin Head",
                "HP Triple Head",
                "HP Quad Head",
                "AZ Pre-20 Slim",
                "AZ Pre-20 Jumbo",
                "AZ Pre-10 Slim",
                "AZ Pre-10 Hot",
                "AZ Pre-10 Clear",
                "AZ Pre20 - Sediment Slim",
                "AZ Pre20 - Sediment Big blue",
                "AZ Pre10 - Sediment Slim",
                "AZ Self-Clean",
                "AZ Auto-Clean",
                "AZ Salt 25",
                "EM-MAINT-DXB-7",
                "EM-MAINT-SHJ-7.1",
                "EM-MAINT-AJM-7.2",
                "EM-MAINT-UAQ-7.3",
                "EM-MAINT-RAK-7.4",
                "EM-MAINT-FUJ/KORF-7.5",
                "EM-MAINT-AUH-7.6",
                "EM-MAINT-ALN-7.7",
                "EM-Hydra Self-cleaning Filter-1",
                "EM-Filter head-1.1",
                "EM-PVC support for sleeves-1.2",
                "EM-PVC cover for filter support-1.3",
                "EM-O-ring for bowl-1.4",
                "EM-Air Screw with O-ring-1.5",
                "EM-Transparent bowl-1.6",
                "EM-Riser tube-1.7",
                "EM-Flange-1.8",
                "EM-Wall bracket-1.9",
                "EM-Spanner-1.10",
                "EM-Refiner Boost-2",
                "EM-Cover, Top-2.1",
                "EM-Salt Lid-2.2",
                "EM-Damper/Hinge-2.3",
                "EM-Power Cable-2.4",
                "EM-Electronic Controller (PWA)-2.5",
                "EM-Repl. Salt Level Sensor Assembly-2.6",
                "EM-Repl. Wi-Fi Board-2.7",
                "EM-Power Supply, 28V DC-2.8",
                "EM-Brinewell Mounting Hardware Kit-2.9",
                "EM-Brine Valve Assembly-2.10",
                "EM-Float, Stem & Guide Assembly-2.11",
                "EM-Gravel, 8 kg req-2.12",
                "EM-Filled Media Tank-2.13",
                "EM-Distributor O-Ring Kit-2.14",
                "EM-Blending Bypass Valve-2.15",
                "EM-Softener Chemical-2.16",
                "EM-Softener Salt-2.17",
                "EM-SMRAT RO-3",
                "EM-Pos Filter Head-3.1",
                "EM-Pos Filter FC-130-3.2",
                "EM-Membrane GPD-3.3",
                "EM-Membrane GPD-3.4",
                "EM-Electronic Display-3.5",
                "EM-Electronic Board-3.6",
                "EM-Solenoid Valve-3.7",
                "EM-Solenoid Valve-3.8",
                "EM-Smart Drain System-3.9",
                "EM-Bypass Valve Switch-3.10",
                "EM-Power Code-3.11",
                "EM-Sleeve for RO-Mem-3.12",
                "EM-Sleeve O-ring Set-3.13",
                "EM-Sleeve Cover-3.14",
                "EM-Water Inlet Hose-3.15",
                "EM-Flow Switch-3.16",
                "EM-Water Pump-3.17",
                "EM-Input Pressure Gauge-3.18",
                "EM-Tank Fitting-3.19",
                "EM-Max Pressure Switch-3.20",
                "EM-Minimum Pressure Switch-3.21",
                "EM-UV Disinfection Unit-4",
                "EM-UV Sleeves-4.1",
                "EM-UV Lamp-4.2",
                "EM-UV Controller-4.3",
                "EM-Pressurized 60l Tank-5.2",
                "EM-Accessories-5.1",
                "EM-Quad Head-6",
                "EM-Triple Head-6.1",
                "EM-Twin Head-6.2",
                "EM-Single Head-6.3",
                "EM-Pre-Filter 20-6.4",
                "EM-Pre-20-6.5",
                "EM-Pre-Filter 10-6.6",
                "EM-Pre-10-6.7",
                "EM-10' Carbon Filter-6.8",
                "EM-Combination Carbon Filter-6.9",
                "EM-Carbon Filter Coffee Machine",
                "EM-Carbon Filter Oven-6.21",
                "EM-SS-10 Complete Set-6.12",
                "EM-SS-10 Scale Inhibitor-6.13",
                "EW eVOLUTION 500 Power",
                "AZ-JUMBO 20' Twin Complete Set",
                "FT HDO REVERSE OSMOSIS",
                "AZ ROTANK 60",
                "EU UV 412-LCD",
                "AZ SS Stand",
                "Installation And Service",
                "EM-20' Carbon Filter 2.5-6.15",
                "EM-20' Carbon Filter 4.5-6.14",
                "EM-Pressurized 5g Tank-5.3",
                "EM-Pre-Filter 20' Complete Crbn 4.5-6.16",
                "EM-Pre-Filter 20' Complete Crbn 2.5-6.17",
                "EM-Pre-Filter 20' Complete Sdmt 4.5-6.18",
                "EM-Pre-Filter 20' Complete Sdmt 2.5-6.19",
                "EM-Pre-20' Sediment 4.5-6.20",
    ].map((item) => (
      <div key={item} className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id={`item-${item}`}
          checked={formData.itemsUsed?.includes(item)}
          onChange={(e) => {
            const checked = e.target.checked;
            const newItems = checked
              ? [...(formData.itemsUsed || []), item]
              : (formData.itemsUsed || []).filter((i) => i !== item);

            setFormData((prev) => ({
              ...prev,
              itemsUsed: newItems,
            }));
          }}
        />
        <label className="form-check-label" htmlFor={`item-${item}`}>
          {item}
        </label>
      </div>
    ))}
  </div>
</details>

        </div>

        <div className="col-md-6">
  <label className="form-label text-primary">
    Details of Items Needed
  </label>

  <details
    style={{
      border: "1px solid #ccc",
      borderRadius: "5px",
      padding: "10px",
    }}
  >
    <summary className="text-secondary mb-2">
      Select Items Needed (Click to expand)
    </summary>

    <div
      style={{
        maxHeight: "300px", // adjust height as needed
        overflowY: "auto",
        borderTop: "1px solid #ddd",
        paddingTop: "10px",
      }}
    >
      {[
        "EW evolution Refiner Power",
        "EW evolution Refiner Boost",
        "EW evolution 200 Compact",
        "EW SMART DIRECT REVERSE OSMOSIS eDRO+",
        "EU Pallas Enjoy Smart",
        "EU Robin Premium AE Maxi Softener",
        "EU Pallas Enjoy Slim 300GPD Direct Flow",
        "EU Pallas Enjoy Cool SO",
        "EU Robin Premium AE Mini Softener",
        "EU Pallas Enjoy Slim Digital 400 GPD DF",
        "EU VISION WATER REVERSE OSMOSIS 100",
        "FT Compact RO HORECA",
        "FT Commercial RO",
        "FT FC130 Carbon Filter",
        "FT RO Membrane-330",
        "PW KWE-4HC-H KWH3200S",
        "PW KWE-5MKDF",
        "PW KWE-5M-KDF-P",
        "PW KWE-ELF-DK7",
        "PW KWS-10 Scale Stick",
        "PW KWE - I2000-4000",
        "PW KWE-MC2",
        "HP Fountain & Combination Large",
        "HP Fountain & Combination Small",
        "HP COFFEE Large",
        "HP COFFEE Small",
        "HP DISHWASHING Large",
        "HP DISHWASHING Small",
        "HP ICE Large",
        "HP ICE Small",
        "HP OVEN Large",
        "HP OVEN Small",
        "HP Single Head",
        "HP Twin Head",
        "HP Triple Head",
        "HP Quad Head",
        "AZ Pre-20 Slim",
        "AZ Pre-20 Jumbo",
        "AZ Pre-10 Slim",
        "AZ Pre-10 Hot",
        "AZ Pre-10 Clear",
        "AZ Pre20 - Sediment Slim",
        "AZ Pre20 - Sediment Big blue",
        "AZ Pre10 - Sediment Slim",
        "AZ Self-Clean",
        "AZ Auto-Clean",
        "AZ Salt 25",
        "EM-MAINT-DXB-7",
        "EM-MAINT-SHJ-7.1",
        "EM-MAINT-AJM-7.2",
        "EM-MAINT-UAQ-7.3",
        "EM-MAINT-RAK-7.4",
        "EM-MAINT-FUJ/KORF-7.5",
        "EM-MAINT-AUH-7.6",
        "EM-MAINT-ALN-7.7",
        "EM-Hydra Self-cleaning Filter-1",
        "EM-Filter head-1.1",
        "EM-PVC support for sleeves-1.2",
        "EM-PVC cover for filter support-1.3",
        "EM-O-ring for bowl-1.4",
        "EM-Air Screw with O-ring-1.5",
        "EM-Transparent bowl-1.6",
        "EM-Riser tube-1.7",
        "EM-Flange-1.8",
        "EM-Wall bracket-1.9",
        "EM-Spanner-1.10",
        "EM-Refiner Boost-2",
        "EM-Cover, Top-2.1",
        "EM-Salt Lid-2.2",
        "EM-Damper/Hinge-2.3",
        "EM-Power Cable-2.4",
        "EM-Electronic Controller (PWA)-2.5",
        "EM-Repl. Salt Level Sensor Assembly-2.6",
        "EM-Repl. Wi-Fi Board-2.7",
        "EM-Power Supply, 28V DC-2.8",
        "EM-Brinewell Mounting Hardware Kit-2.9",
        "EM-Brine Valve Assembly-2.10",
        "EM-Float, Stem & Guide Assembly-2.11",
        "EM-Gravel, 8 kg req-2.12",
        "EM-Filled Media Tank-2.13",
        "EM-Distributor O-Ring Kit-2.14",
        "EM-Blending Bypass Valve-2.15",
        "EM-Softener Chemical-2.16",
        "EM-Softener Salt-2.17",
        "EM-SMRAT RO-3",
        "EM-Pos Filter Head-3.1",
        "EM-Pos Filter FC-130-3.2",
        "EM-Membrane GPD-3.3",
        "EM-Membrane GPD-3.4",
        "EM-Electronic Display-3.5",
        "EM-Electronic Board-3.6",
        "EM-Solenoid Valve-3.7",
        "EM-Solenoid Valve-3.8",
        "EM-Smart Drain System-3.9",
        "EM-Bypass Valve Switch-3.10",
        "EM-Power Code-3.11",
        "EM-Sleeve for RO-Mem-3.12",
        "EM-Sleeve O-ring Set-3.13",
        "EM-Sleeve Cover-3.14",
        "EM-Water Inlet Hose-3.15",
        "EM-Flow Switch-3.16",
        "EM-Water Pump-3.17",
        "EM-Input Pressure Gauge-3.18",
        "EM-Tank Fitting-3.19",
        "EM-Max Pressure Switch-3.20",
        "EM-Minimum Pressure Switch-3.21",
        "EM-UV Disinfection Unit-4",
        "EM-UV Sleeves-4.1",
        "EM-UV Lamp-4.2",
        "EM-UV Controller-4.3",
        "EM-Pressurized 60l Tank-5.2",
        "EM-Accessories-5.1",
        "EM-Quad Head-6",
        "EM-Triple Head-6.1",
        "EM-Twin Head-6.2",
        "EM-Single Head-6.3",
        "EM-Pre-Filter 20-6.4",
        "EM-Pre-20-6.5",
        "EM-Pre-Filter 10-6.6",
        "EM-Pre-10-6.7",
        "EM-10' Carbon Filter-6.8",
        "EM-Combination Carbon Filter-6.9",
        "EM-Carbon Filter Coffee Machine",
        "EM-Carbon Filter Oven-6.21",
        "EM-SS-10 Complete Set-6.12",
        "EM-SS-10 Scale Inhibitor-6.13",
        "EW eVOLUTION 500 Power",
        "AZ-JUMBO 20' Twin Complete Set",
        "FT HDO REVERSE OSMOSIS",
        "AZ ROTANK 60",
        "EU UV 412-LCD",
        "AZ SS Stand",
        "Installation And Service",
        "EM-20' Carbon Filter 2.5-6.15",
        "EM-20' Carbon Filter 4.5-6.14",
        "EM-Pressurized 5g Tank-5.3",
        "EM-Pre-Filter 20' Complete Crbn 4.5-6.16",
        "EM-Pre-Filter 20' Complete Crbn 2.5-6.17",
        "EM-Pre-Filter 20' Complete Sdmt 4.5-6.18",
        "EM-Pre-Filter 20' Complete Sdmt 2.5-6.19",
        "EM-Pre-20' Sediment 4.5-6.20",
      ].map((item) => (
        <div key={item} className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id={`needed-${item}`}
            checked={formData.itemsNeeded?.includes(item)}
            onChange={(e) => {
              const checked = e.target.checked;
              const newItems = checked
                ? [...(formData.itemsNeeded || []), item]
                : (formData.itemsNeeded || []).filter((i) => i !== item);

              setFormData((prev) => ({
                ...prev,
                itemsNeeded: newItems,
              }));
            }}
          />
          <label
            className="form-check-label"
            htmlFor={`needed-${item}`}
          >
            {item}
          </label>
        </div>
      ))}
    </div>
  </details>
</div>


        <div className="col-md-12">
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            placeholder="Enter Additional Notes"
            rows={3}
            name="notes"
            onChange={handleChange}
          ></textarea>
        </div>
        {/*water analysis */}

        <WaterAnalysisForm onDataChange={setWaterAnalysisData} />

        {/*water analusis ends */}

        <div className="col-12">
          <label className="form-label text-primary mt-4">Type</label>
          <div className="d-flex flex-wrap gap-3">
            {["workshop", "warranty", "amc", "inspection", "repair"].map(
              (type) => (
                <div key={type} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`type-${type}`}
                    checked={formData.types?.[type] || false}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        types: {
                          ...prevData.types,
                          [type]: e.target.checked,
                        },
                      }))
                    }
                  />
                  <label className="form-check-label" htmlFor={`type-${type}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                </div>
              )
            )}
          </div>
        </div>

        <div className="col-md-4">
          <label className="form-label">Arrival Time</label>
          <input
            className="form-control"
            type="time"
            name="arrivalTime"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Time Completed</label>
          <input
            className="form-control"
            type="time"
            name="timeCompleted"
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Hours Spent</label>
          <input
            className="form-control "
            readOnly
            name="hoursSpent"
            onChange={handleChange}
            placeholder="Hours Spent (Auto Calculated)"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Technicial Engineer Name</label>
          <input
            className="form-control"
            name="technician"
            onChange={handleChange}
            placeholder="Enter Technical Engineer Name"
          />
        </div>

        {/* Signature section */}

        <div className="col-md-12 mt-4">
          <label className="form-label">Customer E-Signature</label>
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            className="border border-secondary rounded w-100"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: "none" }}
          ></canvas>
          <div className="mt-2">
            <button
              className="btn btn-secondary me-2"
              type="button"
              onClick={clearSignature}
            >
              Clear
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={saveSignature}
            >
              Save Signature
            </button>
          </div>
        </div>

        <div className="col-md-12">
          <label className="form-label">Upload Report Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="form-control"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              const imagePreviews = [];

              files.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  imagePreviews.push(reader.result);
                  if (imagePreviews.length === files.length) {
                    setFormData((prev) => ({
                      ...prev,
                      images: imagePreviews,
                    }));
                  }
                };
                reader.readAsDataURL(file);
              });
            }}
          />
        </div>

        <div className="col-12 text-center mt-4">
          <button className="btn btn-primary px-4" onClick={handlePreview}>
            Preview Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceReportInput;
