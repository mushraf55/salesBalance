import React, { useRef } from "react";
import Header from "../src/Images/header.png";
import Footer from "../src/Images/footer.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ServiceReportPreview = ({ data }) => {
  const reportRef = useRef();

  const handleDownloadPDF = () => {
    const input = reportRef.current;
  
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const headerImg = Header; // already imported
      const footerImg = Footer; // already imported
  
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
  
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  
      let heightLeft = imgHeight;
      let position = 0;
      let pageCount = 0;
  
      while (heightLeft > 0) {
        if (pageCount > 0) pdf.addPage();
  
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  
        // Add header only on first page
        if (pageCount === 0) {
          pdf.addImage(headerImg, "PNG", 0, 0, pdfWidth, 30); // Adjust Y & height as needed
        }
  
        // Add footer only on last page
        if (heightLeft <= pdfHeight) {
          pdf.addImage(footerImg, "PNG", 0, pdfHeight - 20, pdfWidth, 20); // Adjust Y & height as needed
        }
  
        heightLeft -= pdfHeight;
        position = heightLeft - imgHeight;
        pageCount++;
      }
  
      pdf.save(`ServiceReport_${data.reportNo || "Preview"}.pdf`);
    });
  };
  

  const contentStyle = {
    position: "relative",
    zIndex: 1,
    padding: "40px",
    paddingTop: "150px",
    backgroundColor: "white",
  };

  return (
    <>
      <div>
        {/* Download Button */}
        <div style={{ textAlign: "center", margin: "20px" }}>
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            Download PDF
          </button>
        </div>

        <div
          ref={reportRef}
          style={{
            position: "relative",
            width: "900px",
            margin: "0 auto",
            fontFamily: "Arial",
            backgroundColor: "white",
          }}
        >
          {/* Foreground content */}
          <div style={contentStyle}>
            

            <h2
              style={{
                textAlign: "center",
                margin: "20px 0px",
                color: "#003366",
              }}
            >
              Work Record Sheet
            </h2>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="d-flex flex-column align-items-start text-primary">
                <p>
                  <strong>Report No:</strong>{" "}
                  <span style={{ color: "black" }}>{data.reportNo}</span>
                </p>
                <p>
                  <strong>Requisition:</strong>{" "}
                  <span style={{ color: "black" }}>{data.requisition}</span>
                </p>
                <p>
                  <strong>Customer Name:</strong>{" "}
                  <span style={{ color: "black" }}>{data.customerName}</span>
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  <span style={{ color: "black" }}>{data.address}</span>
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  <span style={{ color: "black" }}>{data.location}</span>
                </p>
                <p>
                  <strong>Fault Reported By:</strong>{" "}
                  <span style={{ color: "black" }}>{data.faultReportedBy}</span>
                </p>
               
              </div>
              <div className="d-flex flex-column align-items-start text-primary">
                <p>
                  <strong>Date:</strong>{" "}
                  <span style={{ color: "black" }}>{data.date}</span>
                </p>
                <p>
                  <strong>Equipment Type:</strong>{" "}
                  <span style={{ color: "black" }}>{data.equipmentType}</span>
                </p>
                <p>
                  <strong>Item/Model:</strong>{" "}
                  <span style={{ color: "black" }}>{data.itemModel}</span>
                </p>
                <p>
                  <strong>Manufacturer:</strong>{" "}
                  <span style={{ color: "black" }}>{data.manufacturer}</span>
                </p>
                <p>
                  <strong>Serial No:</strong>{" "}
                  <span style={{ color: "black" }}>{data.serialNo}</span>
                </p>
                <p>
                  <strong>Other If Any</strong>{" "}
                  <span style={{ color: "black" }}>{data.otherifany}</span>
                </p>
                
              </div>
            </div>

            <hr />
            <div className="d-flex flex-column align-items-start text-primary">
              <p>
                <strong>Details of Work Carried Out:</strong>
              </p>
              <p style={{ color: "black", textAlign: "left", width: "100%" }}>
                {data.workDetails}
              </p>
            </div>

            <hr />
            <div className="d-flex justify-content-between">
              <div className="text-primary text-start mb-3">
                <p>
                  <strong>Items Used:</strong>
                </p>
                <ul>
                  {data.itemsUsed?.map((item, idx) => (
                    <li key={idx} style={{ color: "black" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-primary text-start mb-3">
                <p>
                  <strong>Items Needed:</strong>
                </p>
                <ul>
                  {data.itemsNeeded?.map((item, idx) => (
                    <li key={idx} style={{ color: "black" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <hr />

            <h3 className="d-flex flex-column align-items-start text-primary">
              Water Analysis Report
            </h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Range</th>
                  <th>Raw Water (ppm)</th>
                  <th>Treated Water (ppm)</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {data.waterAnalysis?.map((row, index) => (
                  <tr key={index}>
                    <td>{row.parameter}</td>
                    <td>{row.range}</td>
                    <td>{row.rawWater}</td>
                    <td>{row.treatedWater}</td>
                    <td>{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr />
            <div className="d-flex flex-column align-items-start text-primary">
              <p>
                <strong>Additional Notes:</strong>
              </p>
              <p style={{ color: "black", textAlign: "left", width: "100%" }}>
                {data.notes}
              </p>
            </div>

            <hr />
            <div className="d-flex flex-column align-items-start text-primary">
              <p>
                <strong>Type:</strong>{" "}
                <span style={{ color: "black" }}>
                  {Object.keys(data.types || {})
                    .filter((key) => data.types[key])
                    .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
                    .join(", ")}
                </span>
              </p>
            </div>

            <div className="d-flex flex-column align-items-start text-primary">
              <p>
                <strong>Arrival Time:</strong>{" "}
                <span
                  style={{ color: "black" }}
                >{`${data.arrivalTime} hrs`}</span>
              </p>
              <p>
                <strong>Time Completed:</strong>{" "}
                <span
                  style={{ color: "black" }}
                >{`${data.timeCompleted} hrs`}</span>
              </p>
              <p>
                <strong>Hours Spent On Site:</strong>{" "}
                <span
                  style={{ color: "black" }}
                >{`${data.hoursSpent} hrs`}</span>
              </p>
            </div>

            <div className="d-flex flex-column align-items-start text-primary">
              <p>
                <strong>Technical Engineer Name:</strong>{" "}
                <span style={{ color: "black" }}>{data.technician}</span>
              </p>
            </div>

            {data.signature && (
              <div className="d-flex flex-column align-items-start text-primary">
                <p>
                  <strong>Customer E-Signature:</strong>
                </p>
                <img
                  src={data.signature}
                  alt="Signature"
                  style={{
                    border: "1px solid #ccc",
                    width: "100%",
                    maxWidth: "400px",
                  }}
                />
              </div>
            )}

            <p className="d-flex flex-column align-items-start text-primary mt-4">
              <strong>Images:</strong>
            </p>
            <div className="d-flex align-items-start text-primary mt-3">
              {data.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Uploaded ${index}`}
                  style={{ maxWidth: "200px", marginRight: "10px" }}
                />
              ))}
            </div>

            {/* Footer image */}
           
          </div>
          {/* Spacer to prevent footer from being cut off in PDF */}
        </div>
      </div>
    </>
  );
};

export default ServiceReportPreview;
