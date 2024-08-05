const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
// * GET /
// * Home

router.get('', async (req, res) =>{
    try{
        const locals = {
            title: "NodeJS Blogs",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
        let perPage = 5;
        let page = req.query.page || 1;
        const data = await Post.aggregate([{$sort: {createdAt : -1}}])
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count/perPage)
    res.render('index', {locals, data, current: page, nextPage: hasNextPage ? nextPage : null, currentRoute: '/'})
        
    }catch(err){
        console.log(err)
    }
});
// router.get('', async (req, res) =>{
//     const locals = {
//         title: "NodeJS Blogs",
//         description: "Simple Blog created with NodeJs, Express & MongoDb."
//     }

//     try{
//         const data = await Post.find();
//     res.render('index', {locals, data})
        
//     }catch(err){
//         console.log(err)
//     }
// });
// * GET /
// * Post : id

router.get('/post/:id', async (req, res) =>{
    try{
        let slug = req.params.id
        const data = await Post.findById({_id: slug });

        const locals = {
            title: data.title,
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
    res.render('post', {locals, data, currentRoute: `/post${slug}`})
        
    }catch(err){
        console.log(err)
    }
});
// * GET /
// * Post : searchTerm
router.post('/search', async (req, res) =>{
    

    try{
        const locals = {
            title: "Search",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
        let searchTerm = req.body.searchTerm
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "")
        
        const data = await Post.find({$or: [
            {title:{$regex: new RegExp(searchNoSpecialChar, 'i') }},
            {body:{$regex: new RegExp(searchNoSpecialChar, 'i') }}
        ]});
    res.render("search", ({data, locals}))
        
    }catch(err){
        console.log(err)
    }
});
router.get('/about', (req, res) =>{
    res.render('about', {currentRoute: '/about'})
})

module.exports = router 