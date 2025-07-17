import React, { useEffect, useState } from 'react';
import UserStoreDashboard from '../components/StoreUserSidebar';
import axiosInstance from '../api/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// MUI components
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function UserDashboard() {
  const sidebarWidth = 200;

  const dashboardContentStyle = {
    padding: '20px',
    marginLeft: window.innerWidth >= 768 ? `${sidebarWidth}px` : '0',
    transition: 'margin-left 0.3s',
  };

  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});

  const fetchAllProducts = async () => {
    try {
      const response = await axiosInstance.get('/products/');
      setProducts(response.data);

      // Initialize quantity state
      const initialQuantities = {};
      response.data.forEach(product => {
        initialQuantities[product._id] = 1;
      });
      setQuantities(initialQuantities);

    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch products.');
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product._id] || 1;
    toast.success(`Added ${quantity} of "${product.name}" to cart.`);
  };

  return (
    <div>
      <UserStoreDashboard />
      <div style={dashboardContentStyle}>
        <Typography variant="h4" gutterBottom>
          All Products
        </Typography>
        <Grid container spacing={3}>
          {products.map(product => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card sx={{ maxWidth: 280, margin: 'auto'}}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.img_src || 'https://placehold.co/250x160'}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Category:</strong> {product.category}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    <strong>Price:</strong> ${product.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Available:</strong> {product.qty}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', padding: '0 16px 16px' }}>
                  <div>
                    <IconButton onClick={() => handleQuantityChange(product._id, -1)}>
                      <RemoveIcon />
                    </IconButton>
                    <Typography component="span" variant="body1">
                      {quantities[product._id] || 1}
                    </Typography>
                    <IconButton onClick={() => handleQuantityChange(product._id, 1)}>
                      <AddIcon />
                    </IconButton>
                  </div>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(product)}
                  >
                    Add
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
      <ToastContainer />
    </div>
  );
}

export default UserDashboard;
