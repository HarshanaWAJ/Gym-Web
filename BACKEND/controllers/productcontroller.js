const productSchema = require('../models/productModel');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const product = new productSchema(req.body);
        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await productSchema.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await productSchema.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
      const product = await productSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
  } catch (error) {
      res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const product = await productSchema.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Counts for Dashboards
exports.getAllProductsCount = async (req, res) => {
    try {
        const allProcuctCount = await productSchema.countDocuments();
        res.status(200).json({ allProcuctCount })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}


exports.getProductCountsByCategory = async (req, res) => {
    try {
        const counts = await productSchema.aggregate([
            {
                $group: {
                    _id: "$category", // group by category field
                    count: { $sum: 1 } // count each group
                }
            },
            {
                $project: {
                    category: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({ counts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
