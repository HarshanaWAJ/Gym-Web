import React, { useEffect, useState } from 'react';
import { Typography, IconButton, Tooltip, Button } from '@mui/material';
import StoreAdminSidebar from '../components/StoreAdminSidebar';
import axiosInstance from '../api/axiosInstance';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import AddProductModal from './forms/AddProductModal';
import UpdateProductModal from './forms/UpdateProductModal';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function ProductManagement() {
  const sidebarWidth = 200;
  const dashboardContentStyle = {
    padding: '20px',
    marginLeft: window.innerWidth >= 768 ? `${sidebarWidth}px` : '0',
    transition: 'margin-left 0.3s',
    overflowX: 'auto',
  };

  const [products, setProducts] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      const response = await axiosInstance.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch products.');
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axiosInstance.delete(`/products/delete/${id}`);
            // Use functional update
            setProducts(prev => prev.filter(product => product._id !== id));
            toast.success('Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product.');
        }
    };

  const handleEdit = (product) => {
    setProductToUpdate(product);
    setOpenUpdateModal(true);
  };

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
    fetchAllProducts();
  };

  const handleProductUpdated = (updatedProduct, success) => {
    setOpenUpdateModal(false);
    setProductToUpdate(null);

    if (success) {
      toast.success('Product updated successfully!');
      fetchAllProducts(); 
    }
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setProductToUpdate(null);
  };

  return (
    <div>
      <StoreAdminSidebar />
      <div style={dashboardContentStyle}>
        <Typography variant="h5" gutterBottom>
          Product Management
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddModal}
          sx={{ mb: 2 }}
        >
          Add Product
        </Button>

        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover mt-3">
            <thead className="thead-dark">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price ($)</th>
                <th>Description</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Purchase Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.img_src}
                        alt={product.name}
                        width="80"
                        height="100"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.price != null ? product.price.toFixed(2) : 'N/A'}</td>
                    <td>{product.description}</td>
                    <td>{product.category}</td>
                    <td>{product.qty}</td>
                    <td>{new Date(product.expiry_date).toLocaleDateString()}</td>
                    <td>{new Date(product.date_of_purchase).toLocaleDateString()}</td>
                    <td>
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEdit(product)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(product._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Product Modal */}
        <AddProductModal
          open={openAddModal}
          onClose={handleCloseAddModal}
          onProductAdded={handleProductAdded}
        />

        {/* Update Product Modal */}
        {productToUpdate && (
          <UpdateProductModal
            open={openUpdateModal}
            onClose={handleCloseUpdateModal}
            product={productToUpdate}
            onProductUpdated={handleProductUpdated}
          />
        )}

        {/* Toast Container */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}

export default ProductManagement;
