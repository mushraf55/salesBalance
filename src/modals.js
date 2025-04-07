const handleSellProduct = async () => {
  try {
    // Find the product in available stock
    const product = availableStock.find((item) => item.product === saleData.productName);
    if (!product) {
      alert("Product not found or out of stock.");
      return;
    }

    const sellingQty = parseInt(saleData.quantity);
    if (product.quantity < sellingQty) {
      alert("Insufficient stock available.");
      return;
    }

    const updatedQuantity = product.quantity - sellingQty;
    console.log("Before Update: ", product.quantity);
    console.log("Updated Quantity: ", updatedQuantity);
    // Update the product quantity in the available stock
   // Send the update request to backend
const updateResponse = await fetch(
`http://localhost:7500/api/products/${product._id}`,
{
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    quantity: updatedQuantity,
  }),
}
);

    // Check if the update was successful
    if (!updateResponse.ok) {
      const updateErrorData = await updateResponse.json();
      console.error("Failed to update product stock:", updateErrorData);
      alert("Failed to update stock.");
      return;
    }

    // Proceed with saving the sale
    const saleResponse = await fetch("http://localhost:7500/api/sales/sell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        product: saleData.productName,
        quantity: updatedQuantity,
        price: parseFloat(saleData.price),
        customer: saleData.customer,
        po: saleData.po,
        invoice: saleData.invoice,
      }),
    });

    // Check the response status for saving the sale
    if (saleResponse.ok) {
      alert("Product sold successfully!");

      // Fetch updated available stock
      fetchAvailableStock(); // Refresh available stock list after sale

      // Refresh sold products list (if needed)
      fetchSoldProducts(); // Refresh sold products list

      // Close the modal and reset form data
      setShowSellProductModal(false);
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
      const saleErrorData = await saleResponse.json();
      console.error("Sale save error:", saleErrorData);
      alert("Failed to save sale.");
    }
  } catch (error) {
    console.error("Error processing sale:", error);
    alert("Error processing sale.");
  }
};