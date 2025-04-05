import express from 'express'
import cors from 'cors'
import 'dotenv/config' 

import connectDB from "./config/mongodb.js";  // ".js" लगाना जरूरी है
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';


const PORT = process.env.PORT ||4000
const app = express()

app.use(express.json()) //to use req.body
app.use(cors()) //Enables cross-origin requests to prevent browser security issues.

await connectDB()

app.use('/api/user',userRouter)
app.use('/api/image',imageRouter)

app.get('/',(req,res)=>{
    res.send("api working");
})

app.listen(PORT,()=>{
    console.log("app is listening");
})
