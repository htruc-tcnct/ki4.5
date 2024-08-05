const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET




// * 
// * Check login
const  authMiddleware = (req, res, next)=>{
    const token = req.cookies.token
    if(!token)
    {
        return res.status(401).json({message: 'Unauthorized'})
    }
    try{
        const decoded = jwt.verify(token, jwtSecret)
        req.userId = decoded.userId
        next()

    }catch(err){
        res.status(401).json({message: 'Unauthorized'})
    }

}









// * GET /
// * Admin - LoginPage
router.get('/admin', async (req, res) =>{
    const locals = {
        title: "Admin",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    try{
    res.render('admin/index', {locals, layout: adminLayout})
    }catch(err){
        console.log(err)
    }
});
// * POST /
// * Admin - Check login
router.post('/admin', async (req, res) =>{
   
    try{
        const {username, password} = req.body
      
        const user = await User.findOne({username})
        if(!user){
            return res.status(401).json({message: 'Invalid credentials'})

        }
        const isPassword = await bcrypt.compare(password, user.password)
        if(!isPassword){
            return res.status(401).json({message: 'Invalid credentials'})

        }
        const token = jwt.sign({userId: user._id}, jwtSecret)
        res.cookie('token', token, {httpOnly: true})
        res.redirect('/dashboard')
    }catch(err){
        console.log(err)
    }
});

// * GET /
// * Admin Dashboard
router.get('/dashboard',authMiddleware, async (req, res) =>{
try{
    const locals = {
        title: "Dashboard",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    const data = await Post.find()
   res.render('admin/dashboard',{
    locals,
    data,
    layout: adminLayout
   })
    
}catch(err){
console.log(err)
}   
});
// * GET /
// * Admin - Add New Post
router.get('/add-post',authMiddleware, async (req, res) =>{
    try{
        const locals = {
            title: "Add New Post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
        const data = await Post.find()
       res.render('admin/add-post',{
        locals,
        layout: adminLayout
       })
        
    }catch(err){
    console.log(err)
    }   
    });

    // * POST /
// * Admin - Add New Post
router.post('/add-post',authMiddleware, async (req, res) =>{
    try{
       const newPost = new Post({
        title : req.body.title,
        body: req.body.body
       })
       await Post.create(newPost)
      res.redirect('dashboard')
    }catch(err){
    console.log(err)
    }   
    });
// * GET     /
// * Admin - Edit Post
router.get('/edit-post/:id',authMiddleware, async (req, res) =>{
    try{    
        const locals = {
            title: "Edit Post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
    const  data = await Post.findOne({_id: req.params.id})
    res.render('admin/edit-post',{
        locals,
        data,
        layout: adminLayout
    })
        
    }catch(err){
    console.log(err)
    }   
    });
    // * PUT     /
// * Admin - Edit Post
router.put('/edit-post/:id',authMiddleware, async (req, res) =>{
    try{
        
     await Post.findByIdAndUpdate(req.params.id, 
        {
            title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
        })
        res.redirect(`/edit-post/${req.params.id}`)
        
    }catch(err){
    console.log(err)
    }   
    });




// * DELETE     /
// * Admin - Delete
router.delete('/delete-post/:id',authMiddleware, async (req, res) =>{
    try{
        
     await Post.deleteOne({_id : req.params.id})
     res.redirect('/dashboard')
        
    }catch(err){
    console.log(err)
    }   
    });
// router.post('/admin', async (req, res) =>{
   
//     try{
//         const {username, password} = req.body
//         if(req.body.username === 'admin' && req.body.password === 'password')

//         res.send('You are logged in')
//         else{
//             res.send('Wrong username & password')
//         }
//     }catch(err){
//         console.log(err)
//     }
// });

// * POST /
// * Admin - Register
router.post('/register', async (req, res) =>{
   
    try{
        const {username, password} = req.body
      const hashedPassword = await bcrypt.hash(password, 10)
      try{
        const user = await User.create({username, password: hashedPassword})
        res.status(201).json({message: 'User Created', user})
      }catch(err){
        if(err.code === 11000 ){
            res.status(409).json({message: "User already in use"})
        }
        res.status(500).json({message: "Internal server error"})
      }
    }catch(err){
        console.log(err)
    }
});

// * GET /
// * Admin - LOg out
router.get('/logout', async (req, res) =>{
    res.clearCookie('token')
    res.redirect('/')
});
module.exports = router 
