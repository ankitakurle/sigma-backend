import express from 'express';
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(express.json());

// serverr.js (New, controlled CORS)
const allowedOrigins = [
   
    // !!! IMPORTANT: REPLACE THIS PLACEHOLDER with your actual Vercel frontend domain !!!
    'https://sigma-frontend-nu.vercel.app/' 
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl) or if origin is in allowed list
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'), false);
        }
    }
};

app.use(cors(corsOptions));
// app.use(cors());

// Root route (prevents 404)
app.get("/", (req, res) => {
    res.json({ status: "OK", message: "API is running" });
});

app.use("/api", chatRoutes);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connecting to database");
    } catch (err) {
        console.log(err);
    }
};

connectDB();

export default app;



// app.post("/test",async(req,res)=>{

//     const options={
//         method:"POST",
//         headers:{
//          "Content-Type": "application/json",
//          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
//         },
//         body:JSON.stringify({
//             model:"gpt-4o-mini",
//             messages:[{
//                 role: "user",
//                 content: req.body.message
//             }]
//         })

//     }

//     try{
//         const response=await fetch("https://api.openai.com/v1/chat/completions",options)
//         const data=await response.json();
//         // console.log(data.choices[0].message.content);
//         res.send(data.choices[0].message.content);

//     }catch(err){
//         console.log(err);
//     }

// })
