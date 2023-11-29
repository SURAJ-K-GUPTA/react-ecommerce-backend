const express = require('express');
const { default: mongoose } = require('mongoose');

const server = express();

server.get('/',(req,res)=>{
    res.json({status:'success'})
})

server.listen(9000,()=>{
    console.log('server started')
})