import express from "express";
import Thread from "../models/thread.js";
import  openAiResponse from "../utils/openai.js";


const router=express.Router();

// test
router.post("/test",async(req,res)=>{
    try{
        const thread=new Thread({
            threadId:"xyz",
            title:"testing new thread"
        })
        const response=await thread.save();
        res.send(response);

    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to save to db"})

    }
});

//get all threads
router.get("/thread",async(req,res)=>{
    try{
        const threads=await Thread.find({}).sort({updatedAt:-1})
        res.json(threads)

    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to fetch thread"})
    }
});


router.get("/thread/:threadId",async(req,res)=>{
    const {threadId}=req.params;
    try{
        const thread=await Thread.findOne({threadId});

        if(!thread){
            res.status(404).json({error:"thread not found"})

        }
        res.json(thread.messages);


    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to fetch chat"});
    }
});

router.delete("/thread/:threadId",async(req,res)=>{
    const {threadId}=req.params;
    try{
        const deletedThread=await Thread.findOneAndDelete({threadId});
        if(!deletedThread){
            res.status(404).json({error:"thread could not be deleted"});

        }
        res.status(200).json({success:"thread deleted successfully"});
        

    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to delete chat"});
    }

});

router.post("/chat",async(req,res)=>{
    const {threadId,message}=req.body;
    if(!threadId || !message){
        res.status(400).json({error:"missing required fields"});
    }

     try{
        let thread=await Thread.findOne({threadId});
        if(!thread){
            //create a new thread in DB
            thread=new Thread({
                threadId,
                title:message,
                messages:[{
                    role:"user",
                    content:message
                }]
            })
        }else{
            thread.messages.push({role:"user",content:message});
        }
        
        const assistantReply= await openAiResponse(message);

        thread.messages.push({role:"assistance",content:assistantReply});
        thread.updatedAt=new Date();
        
        await thread.save();

        res.json({reply:assistantReply});
        
        
    }catch(err){
        console.log(err);
        res.status(500).json({error:"something went wrong"});
    }


})

export default router;