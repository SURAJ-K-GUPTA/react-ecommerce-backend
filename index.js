const express = require('express');
const { default: mongoose } = require('mongoose');
const { createProduct } = require('./controller/Product');
const productsRouters = require('./routes/Products')
const categoriesRouter = require('./routes/Categories')
const brandsRouter = require('./routes/Brands')
const server = express();
const cors = require('cors')
//middelewares
server.use(cors({
    exposedHeaders:['X-Total-Count']
}))
server.use(express.json()); // to parse req.body
server.use('/products', productsRouters.router)
server.use('/categories', categoriesRouter.router)
server.use('/brands', brandsRouter.router)

main().then(console.log("DB Connected")).catch(err=>console.log(err))
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/react-ecommerce')
}
server.get('/',(req,res)=>{
    res.json({status:'success'})
})


server.listen(8080,()=>{
    console.log(`Server Started at PORT 8080`)
})