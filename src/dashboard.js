import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Tab, Nav, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Import XLSX for exporting to Excel

const Dashboard = ({ setIsAuthenticated }) => {
  const [userName, setUserName] = useState(localStorage.getItem("name"));
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const [availableStock, setAvailableStock] = useState([]);
  const [soldStock, setSoldStock] = useState([]);
  const [searchAvailable, setSearchAvailable] = useState(""); // For search in available stock
  const [searchSold, setSearchSold] = useState(""); // For search in sold stock
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showSellProductModal, setShowSellProductModal] = useState(false);
  const [productData, setProductData] = useState({
    date: "",
    proforma: "",
    productName: "",
    quantity: "",
    price: "",
    oem: "",
    reorder: "",
    addedBy: "",
  });
  const [saleData, setSaleData] = useState({
    productName: "",
    quantity: "",
    price: 0,
    customer: "",
    po: "",
    invoice: "",
    availableQty: 0,
  });
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableStock();
    fetchSoldProducts();
  }, []);

  const fetchAvailableStock = async () => {
    try {
      const response = await fetch("http://localhost:7500/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const stockData = await response.json();
        setAvailableStock(stockData);  // Update state with new stock data
      } else {
        console.error("Failed to fetch available stock.");
      }
    } catch (error) {
      console.error("Error fetching available stock:", error);
    }
  };
  

  const fetchSoldProducts = async () => {
    try {
      const response = await fetch("http://localhost:7500/api/sales", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        // Assuming the API returns 'soldBy' for each sale record
        setSoldStock(data);
      } else {
        setSoldStock([]);
      }
    } catch (error) {
      console.error(error);
      setSoldStock([]);
    }
  };
  

  const handleProductSelect = (productName) => {
    setSaleData((prevData) => ({ ...prevData, productName }));
    const selectedProduct = availableStock.find(
      (product) => product.product === productName
    );
    if (selectedProduct) {
      setSaleData((prevData) => ({
        ...prevData,
        availableQty: selectedProduct.quantity,
        price: selectedProduct.price,
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch("http://localhost:7500/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: productData.date || new Date().toLocaleDateString("en-CA"),
          proforma: productData.proforma,
          product: productData.productName,
          quantity: parseInt(productData.quantity),
          price: parseFloat(productData.price),
          oem: productData.oem,
          reorder: parseInt(productData.reorder),
          addedBy: userName,
        }),
      });

      if (response.ok) {
        alert("Product added successfully!");
        await fetchAvailableStock();
        setShowAddProductModal(false);
        setProductData({
          date: "",
          proforma: "",
          productName: "",
          quantity: "",
          price: "",
          oem: "",
          reorder: "",
          addedBy: "",
        });
      } else {
        alert("Failed to add product.");
      }
    } catch (error) {
      console.error("Add product error:", error);
    }
  };

  const handleSellProduct = async () => {
    try {
      const product = availableStock.find(
        (item) => item.product === saleData.productName
      );
  
      if (!product) {
        alert("Product not found or out of stock.");
        return;
      }
  
      const sellingQty = parseInt(saleData.quantity);
      if (product.quantity < sellingQty) {
        alert("Insufficient stock available.");
        return;
      }
  
      // Only call the /sell endpoint — no PATCH to product!
      const saleResponse = await fetch("http://localhost:7500/api/sales/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        
        body: JSON.stringify({
          date: new Date().toLocaleDateString("en-CA"),
          product: saleData.productName,
          quantity: sellingQty,
          price: parseFloat(saleData.price),
          customer: saleData.customer,
          po: saleData.po,
          invoice: saleData.invoice,
        }),
      });
  
      if (saleResponse.ok) {
        alert("Product sold successfully!");
        fetchAvailableStock(); // Refresh stock list
        fetchSoldProducts(); // Refresh sales list
        setShowSellProductModal(false); // Close modal
  
        setSaleData({
          productName: "",
          quantity: 0,
          price: 0,
          customer: "",
          po: "",
          invoice: "",
          availableQty: 0,
        });
      } else {
        const errorData = await saleResponse.json();
        console.error("Sale save error:", errorData);
        alert("Failed to save sale.");
      }
    } catch (error) {
      console.error("Error processing sale:", error);
      alert("Error processing sale.");
    }
  };
  

  const exportToExcel = (tableId) => {
    const table = document.getElementById(tableId);
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });
    XLSX.writeFile(wb, `${tableId}.xlsx`);
  };

  // Filtering functions for search fields
  const filterAvailableStock = availableStock.filter((product) =>
    product.product.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const filterSoldStock = soldStock.filter((sale) =>
    sale.product.toLowerCase().includes(searchSold.toLowerCase())
  );
  const totalStockValue = availableStock.reduce((acc, p) => {
    const price = parseFloat(p.price) || 0;
    const qty = parseInt(p.quantity) || 0;
    return acc + price * qty;
  }, 0).toFixed(2);
  
  const totalSoldValue = soldStock.reduce((acc, s) => {
    const price = parseFloat(s.price) || 0;
    const qty = parseInt(s.quantity) || 0;
    return acc + price * qty;
  }, 0).toFixed(2);
  
  const profitLoss = (totalSoldValue - totalStockValue).toFixed(2);
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Stock Manager
          </a>
          <ul className="navbar-nav ms-auto">
            {userRole === "admin" && (
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#"
                  onClick={() => setShowAddProductModal(true)}
                >
                  Add Product
                </a>
              </li>
            )}
            <li className="nav-item">
              <a
                className="nav-link"
                onClick={() => setShowSellProductModal(true)}
              >
                Sell Product
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link">
                Welcome <span>{userName}</span>
              </a>
            </li>
            <li className="nav-item">
              <button className="nav-link text-danger" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="container mb-4" style={{ paddingTop: "80px" }}>
        <div className="row g-3 text-center">
          <div className="col-md-4">
            <div className="bg-primary text-white p-3 rounded">
              <h5>Total Stock Value</h5>
              <h4>AED {totalStockValue}</h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-success text-white p-3 rounded">
              <h5>Total Sold Value</h5>
              <h4>AED {totalSoldValue}</h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-warning text-dark p-3 rounded">
              <h5>Profit / Loss</h5>
              <h4>AED {profitLoss}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <Tab.Container defaultActiveKey="available">
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="available">Stock In</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="sold">Stock Out</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="available">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search in Available Stock"
                value={searchAvailable}
                onChange={(e) => setSearchAvailable(e.target.value)}
              />
              <Table striped bordered hover responsive id="availableStockTable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Proforma</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>OEM</th>
                    <th>Reorder Level</th>
                    <th>Added By</th>
                  </tr>
                </thead>
                <tbody>
                  {filterAvailableStock.length > 0 ? (
                    filterAvailableStock.map((product, idx) => (
                      <tr key={idx}>
                        <td>{product.date}</td>
                        <td>{product.proforma}</td>
                        <td>{product.product}</td>
                        <td>{product.quantity}</td>
                        <td>{product.price}</td>
                        <td>{product.oem}</td>
                        <td>{product.reorder}</td>
                        <td>{product.addedBy}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">No products available</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <Button onClick={() => exportToExcel("availableStockTable")}>
                Export to Excel
              </Button>
            </Tab.Pane>
            <Tab.Pane eventKey="sold">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search in Sold Stock"
                value={searchSold}
                onChange={(e) => setSearchSold(e.target.value)}
              />
              <Table striped bordered hover responsive id="soldStockTable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Customer</th>
                    <th>PO</th>
                    <th>Invoice</th>
                    <th>Sold By</th>
                  </tr>
                </thead>
                <tbody>
                  {filterSoldStock.length > 0 ? (
                    filterSoldStock.map((sale, idx) => (
                      <tr key={idx}>
                        <td>{sale.date}</td>
                        <td>{sale.product}</td>
                        <td>{sale.quantity}</td>
                        <td>{sale.price}</td>
                        <td>{sale.customer}</td>
                        <td>{sale.po}</td>
                        <td>{sale.invoice}</td>
                        <td>{sale.soldBy}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No sales recorded</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <Button onClick={() => exportToExcel("soldStockTable")}>
                Export to Excel
              </Button>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
      <Modal
show={showAddProductModal}
onHide={() => setShowAddProductModal(false)}
>
<Modal.Header closeButton>
  <Modal.Title>Stock In (Add Product)</Modal.Title>
</Modal.Header>
<Modal.Body>
  <Form>
    <Form.Group controlId="date">
      <Form.Label>Date</Form.Label>
      <Form.Control
        type="date"
        value={productData.date}
        onChange={(e) =>
          setProductData({ ...productData, date: e.target.value })
        }
      />
    </Form.Group>

    <Form.Group controlId="proforma">
      <Form.Label>Proforma</Form.Label>
      <Form.Control
        type="text"
        value={productData.proforma}
        onChange={(e) =>
          setProductData({ ...productData, proforma: e.target.value })
        }
      />
    </Form.Group>

    <Form.Group controlId="productName">
      <Form.Label>Product Name</Form.Label>
      <Form.Control
        type="text"
        value={productData.productName}
        onChange={(e) =>
          setProductData({
            ...productData,
            productName: e.target.value,
          })
        }
      />
    </Form.Group>

    <Form.Group controlId="quantity">
      <Form.Label>Quantity</Form.Label>
      <Form.Control
        type="number"
        value={productData.quantity}
        onChange={(e) =>
          setProductData({ ...productData, quantity: e.target.value })
        }
      />
    </Form.Group>

    <Form.Group controlId="price">
      <Form.Label>Price</Form.Label>
      <Form.Control
        type="number"
        value={productData.price}
        onChange={(e) =>
          setProductData({ ...productData, price: e.target.value })
        }
      />
    </Form.Group>

    <Form.Group controlId="oem">
      <Form.Label>OEM</Form.Label>
      <Form.Control
        type="text"
        value={productData.oem}
        onChange={(e) =>
          setProductData({ ...productData, oem: e.target.value })
        }
      />
    </Form.Group>

    <Form.Group controlId="reorder">
      <Form.Label>Reorder Level</Form.Label>
      <Form.Control
        type="number"
        value={productData.reorder}
        onChange={(e) =>
          setProductData({ ...productData, reorder: e.target.value })
        }
      />
    </Form.Group>

    <Form.Group controlId="addedBy">
      <Form.Label>Added By</Form.Label>
      <Form.Control type="text" value={productData.addedBy} readOnly />
    </Form.Group>
  </Form>
</Modal.Body>
<Modal.Footer>
  <Button
    variant="secondary"
    onClick={() => setShowAddProductModal(false)}
  >
    Close
  </Button>
  <Button variant="primary" onClick={handleAddProduct}>
    Save Product
  </Button>
</Modal.Footer>
</Modal>

{/* Sell Product Modal */}
<Modal
show={showSellProductModal}
onHide={() => setShowSellProductModal(false)}
>
<Modal.Header closeButton>
  <Modal.Title>Stock Out (Sell Product)</Modal.Title>
</Modal.Header>
<Modal.Body>
<Form>
<Form.Group controlId="productName">
<Form.Label>Product Name</Form.Label>
<Form.Select
    value={saleData.productName}
    onChange={(e) => handleProductSelect(e.target.value)}
>
    <option value="">Select a product</option>
    {availableStock.map((product, idx) => (
        <option key={idx} value={product.product}>
            {product.product}
        </option>
    ))}
</Form.Select>
</Form.Group>

<Form.Group controlId="availableQty">
<Form.Label>Available Quantity</Form.Label>
<Form.Control
    type="number"
    value={saleData.availableQty}
    readOnly
/>
</Form.Group>

<Form.Group controlId="quantity">
<Form.Label>Quantity</Form.Label>
<Form.Control
    type="number"
    value={saleData.quantity}
    onChange={(e) =>
        setSaleData({ ...saleData, quantity: e.target.value })
    }
/>
</Form.Group>

<Form.Group controlId="price">
<Form.Label>Price</Form.Label>
<Form.Control
    type="number"
    value={saleData.price}
    onChange={(e) =>
        setSaleData({ ...saleData, price: e.target.value })
    }
/>
</Form.Group>

<Form.Group controlId="customer">
<Form.Label>Customer</Form.Label>
<Form.Control
    type="text"
    value={saleData.customer}
    onChange={(e) =>
        setSaleData({ ...saleData, customer: e.target.value })
    }
/>
</Form.Group>

<Form.Group controlId="po">
<Form.Label>PO Number</Form.Label>
<Form.Control
    type="text"
    value={saleData.po}
    onChange={(e) =>
        setSaleData({ ...saleData, po: e.target.value })
    }
/>
</Form.Group>

<Form.Group controlId="invoice">
<Form.Label>Invoice Number</Form.Label>
<Form.Control
    type="text"
    value={saleData.invoice}
    onChange={(e) =>
        setSaleData({ ...saleData, invoice: e.target.value })
    }
/>
</Form.Group>
</Form>

</Modal.Body>
<Modal.Footer>
  <Button
    variant="secondary"
    onClick={() => setShowSellProductModal(false)}
  >
    Close
  </Button>
  <Button variant="primary" onClick={handleSellProduct}>
    Save Sale
  </Button>
</Modal.Footer>
</Modal>
    </div>
  );
};

export default Dashboard;
