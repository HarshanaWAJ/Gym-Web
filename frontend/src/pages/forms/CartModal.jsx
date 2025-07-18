import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Typography,
  IconButton,
  Divider,
  Button,
  Stack,
  Tooltip,
  DialogActions,
  DialogContentText,
  Box,
  Grid,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CartIcon from "@mui/icons-material/ShoppingBag";

import axiosInstance from "../../api/axiosInstance"; 

function CartModal({ open, handleClose, products }) {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [confirmClear, setConfirmClear] = useState(false);

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id;
  };

  const getCartKey = () => {
    const userId = getUserId();
    return userId ? `cart_${userId}` : null;
  };

  const saveCart = (items) => {
    const cartKey = getCartKey();
    if (!cartKey) return;

    const cartData = {
      items: items.map((i) => ({ product: i.productId, quantity: i.quantity })),
    };
    localStorage.setItem(cartKey, JSON.stringify(cartData));
  };

  useEffect(() => {
    if (!open) return;

    const cartKey = getCartKey();
    if (!cartKey) {
      setCartItems([]);
      setQuantities({});
      return;
    }

    const storedCart = JSON.parse(localStorage.getItem(cartKey));
    if (storedCart && storedCart.items) {
      const enrichedItems = storedCart.items.map((item) => {
        const product = products.find((p) => p._id === item.product);
        return {
          productId: item.product,
          name: product?.name || `Product ID: ${item.product}`,
          price: product?.price || 0,
          quantity: item.quantity,
          total: (product?.price || 0) * item.quantity,
          image: product?.image || null,
        };
      });
      setCartItems(enrichedItems);

      const initialQuantities = {};
      enrichedItems.forEach((i) => {
        initialQuantities[i.productId] = 1;
      });
      setQuantities(initialQuantities);
    } else {
      setCartItems([]);
      setQuantities({});
    }
  }, [open, products]);

  const updateCartItems = (newItems) => {
    setCartItems(newItems);
    saveCart(newItems);
  };

  const handleQtyChange = (productId, value) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
    } else if (parsed > item.quantity) {
      setQuantities((prev) => ({ ...prev, [productId]: item.quantity }));
    } else {
      setQuantities((prev) => ({ ...prev, [productId]: parsed }));
    }
  };

  const incrementQty = (productId) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.min(current + 1, item.quantity);
      return { ...prev, [productId]: next };
    });
  };

  const decrementQty = (productId) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(current - 1, 1);
      return { ...prev, [productId]: next };
    });
  };

  const handleRemoveQty = (productId) => {
    const amountToRemove = quantities[productId] || 1;
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;

    if (amountToRemove >= item.quantity) {
      const updated = cartItems.filter((i) => i.productId !== productId);
      updateCartItems(updated);
    } else {
      const updated = cartItems.map((i) => {
        if (i.productId === productId) {
          const newQty = i.quantity - amountToRemove;
          return {
            ...i,
            quantity: newQty,
            total: i.price * newQty,
          };
        }
        return i;
      });
      updateCartItems(updated);
    }
    setQuantities((prev) => ({ ...prev, [productId]: 1 }));
  };

  const handleRemoveItem = (productId) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    updateCartItems(updated);
    setQuantities((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const handleClearCart = () => {
    updateCartItems([]);
    setConfirmClear(false);
    setQuantities({});
  };

  const getTotal = () => cartItems.reduce((sum, item) => sum + item.total, 0);

  // ---- New: Send cart data to backend ----
  const handleCheckout = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        console.error("User not logged in");
        return;
      }

      const payload = {
        userId,
        items: cartItems.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        value: getTotal(),
        status: "payed",
      };

      const response = await axiosInstance.post("/cart/add", payload);
      console.log("Checkout success:", response.data);

      // Clear cart and close modal after successful checkout
      handleClearCart();
      handleClose();
      navigate("/user-payment");

      // Optionally show success notification here
    } catch (error) {
      console.error("Checkout error:", error);
      // Optionally show error notification here
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{ "& .MuiDialog-paper": { maxHeight: "90vh" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            p: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <CartIcon />
            <Typography variant="h6">Your Cart</Typography>
          </Stack>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {cartItems.length === 0 ? (
            <Box textAlign="center" py={6} color="text.secondary">
              <Typography variant="h6" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body2" mb={2}>
                Browse products and add them to your cart.
              </Typography>
              <Button variant="contained" onClick={handleClose}>
                Continue Shopping
              </Button>
            </Box>
          ) : (
            <List disablePadding>
              {cartItems.map((item) => (
                <React.Fragment key={item.productId}>
                  <ListItem sx={{ py: 2, alignItems: "flex-start" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={2}>
                        {item.image ? (
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: 1,
                              objectFit: "cover",
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: 1,
                              bgcolor: "grey.300",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              color: "grey.600",
                              fontSize: 12,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            No Image
                          </Box>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: ${item.price.toFixed(2)} | Quantity: {item.quantity}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => decrementQty(item.productId)}
                              disabled={(quantities[item.productId] || 1) <= 1}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <TextField
                              size="small"
                              variant="outlined"
                              value={quantities[item.productId] || 1}
                              onChange={(e) =>
                                handleQtyChange(item.productId, e.target.value)
                              }
                              inputProps={{
                                style: { textAlign: "center", width: 40 },
                                min: 1,
                                max: item.quantity,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => incrementQty(item.productId)}
                              disabled={(quantities[item.productId] || 1) >= item.quantity}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Stack>

                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleRemoveQty(item.productId)}
                            >
                              Remove
                            </Button>
                            <Tooltip title="Remove item completely">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveItem(item.productId)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>

                          <Typography variant="subtitle2" textAlign="right">
                            Total: ${item.total.toFixed(2)}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>

        {cartItems.length > 0 && (
          <DialogActions
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              px: 3,
              py: 2,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              Total: ${getTotal().toFixed(2)}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                color="error"
                onClick={() => setConfirmClear(true)}
                variant="outlined"
              >
                Clear Cart
              </Button>
              <Button onClick={handleClose} variant="outlined">
                Close
              </Button>
              <Button variant="contained" color="primary" onClick={handleCheckout}>
                Checkout
              </Button>
            </Stack>
          </DialogActions>
        )}
      </Dialog>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)}>
        <DialogTitle>Clear Cart</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all items from your cart? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button color="error" onClick={handleClearCart} variant="contained">
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CartModal;
