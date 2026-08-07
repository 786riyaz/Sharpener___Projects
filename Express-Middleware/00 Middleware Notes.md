Middleware is a function sits between request and final response
the request has to go through Each middleware function untill the response is send.
Middleware can modify req and res objects

app.use((req,res,next)=>{
    console.log("Inside Middleware ::", req.method);
    next();
})