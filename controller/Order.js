const { Order } = require("../model/Order")

exports.fetchOrderByUser = async (req, res) =>{
    const {user} = req.query
    try {
        const orders = await Order.find({user})
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

