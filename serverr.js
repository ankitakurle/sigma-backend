import express from 'express';
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(express.json());

// =================================================================
// 1. CRITICAL CHANGE: CORS Configuration
// You MUST replace the placeholder below with your actual Vercel frontend URL.
// =================================================================
const allowedOrigins = [
   
    // !!! IMPORTANT: REPLACE THIS PLACEHOLDER with your actual Vercel frontend domain !!!
    'https://[YOUR_ACTUAL_FRONTEND_DOMAIN].vercel.app' // <--- CHANGE THIS LINE
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


// =================================================================
// 2. CRITICAL CHANGE: Implement Cached MongoDB Connection
// This prevents connection timeouts and connection floods on Vercel.
// =================================================================
// Define a cache variable to persist across Vercel function instances
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
    // 1. Return the cached connection if it exists
    if (cached.conn) {
        console.log("Using cached MongoDB connection");
        return cached.conn;
    }

    // 2. If a connection promise is not running, create a new one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Recommended for serverless
        };

        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
            console.log("New MongoDB connection established");
            return mongoose;
        });
    }

    // 3. Wait for the promise and cache the result
    cached.conn = await cached.promise;
    return cached.conn;
};

// DO NOT CALL connectDB() here. It must be called in your routes/chat.js
// or a middleware before any database operation.

export default app;
// import express from 'express';
// import cors from "cors";
// import mongoose from "mongoose";
// import "dotenv/config";
// import chatRoutes from "./routes/chat.js";

// const app = express();

// app.use(express.json());

// // serverr.js (New, controlled CORS)
// const allowedOrigins = [
   
//     // !!! IMPORTANT: REPLACE THIS PLACEHOLDER with your actual Vercel frontend domain !!!
//     'https://sigma-frontend-nu.vercel.app' 
// ];

// const corsOptions = {
//     origin: (origin, callback) => {
//         // Allow requests with no origin (like mobile apps or curl) or if origin is in allowed list
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'), false);
//         }
//     }
// };

// app.use(cors(corsOptions));
// // app.use(cors());

// // Root route (prevents 404)
// app.get("/", (req, res) => {
//     res.json({ status: "OK", message: "API is running" });
// });

// app.use("/api", chatRoutes);

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGODB_URI);
//         console.log("connecting to database");
//     } catch (err) {
//         console.log(err);
//     }
// };

// // connectDB();

// export default app;



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
