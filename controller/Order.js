const { Order } = require("../model/Order")

exports.fetchOrderByUser = async (req, res) =>{
    const {userId} = req.params
    try {
        const orders = await Order.find({user:userId})
        res.status(200).json(orders)
    } catch (error) {
        res.status(400).json(error)
    }
}

exports.createOrder = async (req,res)=>{
    console.log(req.body)
    const order = new Order(req.body)
    try {
        const doc = await order.save();
        console.log(doc)
        res.status(201).json(doc)
    } catch (error) {
        res.status(400).json(error)
    }
}

exports.deleteOrder = async (req,res)=>{
    const {id} = req.params
    try {
        const order = await Order.findByIdAndDelete(id)
        res.status(201).json(order)
    } catch (error) {
        res.status(400).json(error)
    }
}

exports.updateOrderById = async (req,res)=>{
    const {id} = req.params
    try {
        const order = await Order.findByIdAndUpdate(id,req.body,{new:true})
            res.status(200).json(order)
        } catch (error) {
            res.status(400).json(error)
        }
    
}

exports.fetchAllOders = async (req, res) => {
    // here we need all query string
  
    // TODO : We have to try with multiple categories and brands after change in front-end
  
    let query = Order.find({ deleted: { $ne: true } });
  
    let totalOrdersQuery = Order.find({ deleted: { $ne: true } });
    // TODO : How to get sort on discounted Price not on Actual Price
    if (req.query._sort && req.query._order) {
      query = query.sort({
        [req.query._sort]: req.query._order,
        deleted: { $exists: false, $ne: true },
      });
      totalOrdersQuery = totalOrdersQuery.sort({
        [req.query._sort]: req.query._order,
        deleted: { $exists: false, $ne: true },
      });
    }
  
    totalDocs = await totalOrdersQuery.count().exec();
    console.log({ totalDocs });
    if (req.query._page && req.query._limit) {
      const pageSize = req.query._limit;
      const page = req.query._page;
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
      totalOrdersQuery = totalOrdersQuery
        .skip(pageSize * (page - 1))
        .limit(pageSize);
    }
    try {
      const docs = await query.exec();
      res.set("X-Total-Count", totalDocs);
  
      res.status(200).json(docs);
    } catch (error) {
      res.status(400).json(error);
    }
  };