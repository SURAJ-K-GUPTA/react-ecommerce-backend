const { Brand } = require("../model/Brand")
const { Cart } = require("../model/Cart")

exports.fetchCartByUser = async (req, res) =>{
    const {user} = req.query
    try {
        const cartItems = await Cart.find({user}).populate('user').populate('product')
        res.status(200).json(cartItems)
    } catch (error) {
        res.status(400).json(error)
    }
}

exports.addToCart = async (req,res)=>{
    const cart = new Cart(req.body)
    try {
        const doc = await cart.save()
    
        res.status(201).json(doc)
    } catch (error) {
        res.status(400).json(error)
    }
}
