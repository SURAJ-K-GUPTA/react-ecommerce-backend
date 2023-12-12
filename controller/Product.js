const { Product } = require("../model/Product");

exports.createProduct = async (req, res) => {
  // this product we have to get from API body
  const product = new Product(req.body);
  try {
    const doc = await product.save();

    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json(error);
  }
};


exports.fetchAllProducts = async (req, res) => {
    // ... (previous code)
  
    let condition = {};
    if (!req.query.admin) {
      condition.deleted = { $exists: false, $ne: true };
    }
  
    let query = Product.find(condition);
    let totalProductsQuery = Product.find(condition);
  
    if (req.query.category) {
      query = query.find({ ...condition, category: req.query.category });
      totalProductsQuery = totalProductsQuery.find({ ...condition, category: req.query.category });
    }
  
    if (req.query.brand) {
      query = query.find({ ...condition, brand: req.query.brand });
      totalProductsQuery = totalProductsQuery.find({ ...condition, brand: req.query.brand });
    }
  
    if (req.query._sort && req.query._order) {
      query = query.sort({ [req.query._sort]: req.query._order });
      totalProductsQuery = totalProductsQuery.sort({ [req.query._sort]: req.query._order });
    }
  
    totalDocs = await totalProductsQuery.countDocuments().exec();
  
    if (req.query._page && req.query._limit) {
      const pageSize = parseInt(req.query._limit);
      const page = parseInt(req.query._page);
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }
  
    try {
      const docs = await query.exec();
      res.set("X-Total-Count", totalDocs);
      res.status(200).json(docs);
    } catch (error) {
      res.status(400).json(error);
    }
  };
  
exports.fetchProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.updateProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json(error);
  }
};
