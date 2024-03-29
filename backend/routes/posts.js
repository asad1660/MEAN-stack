const express = require('express')
const multer = require('multer')

const Post = require('../models/post')
const checkAuth = require("../middleware/check-auth")

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg':'jpg'
}

const storage =  multer.diskStorage({
  destination:(req,file,cb)=> {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Inavlid mime type")
    if(isValid){
     error = null;
    }
  cb(error,"backend/images");
  },
  filename:(req,file,cb) =>{
    const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    console.log(ext)
    cb(null,name + '-' + Date.now() + '.' + ext);
  }
})

router.post('',checkAuth,
multer({storage:storage}).single("image"),(req,res,next) => {
  const url = req.protocol + '://' + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath:url + "/images/" + req.file.filename
    });
    post.save().then(result =>{
      console.log(result)
      return  res.status(201).json(
          {
              message:"Posts added Successfully!",
            post:{
              ...result,
              id:result._id
            }
      });
    });
    
   })
   router.put('/:id',checkAuth,multer({storage:storage}).single("image"),(req,res,next) => {

      let imagePath = req.body.imagePath;
      if(req.file){
        const url = req.protocol + '://' + req.get("host");
          imagePath = url + "/images/" + req.file.filename
      }
      const post = new Post({
        _id:req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath:imagePath
      });
      Post.updateOne({_id:req.body.id},post).then(result =>{
        return  res.status(200).json(
            {
                message:"Posts updated Successfully!",
                id:result._id
        });
      });
      
     })
  
  router.get('',(req,res,next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if(pageSize && currentPage){
      postQuery.skip(pageSize * (currentPage - 1))
      .limit(pageSize);
    }
    postQuery.then(documents =>{
      fetchedPosts=documents;
      return Post.count();
    })
    .then(count =>{
      return  res.status(200).json(
          {
              message:"Posts Fetched Successfully!",
              posts:fetchedPosts,
              maxPosts:count
      });
    })
  
  })
  
  router.get('/:id',(req,res,next) => {
      Post.findById(req.params.id)
      .then(post =>{
        if(post){
          return  res.status(200).json(post);
        }else{
     return  res.status(404).json(
            {
                message:"Page not found!",
        });
        }
     
      })
    
    })
  router.delete("/:id",checkAuth,(req,res,next) => {
    
     Post.deleteOne({_id:req.params.id}).then(result => {
      return  res.status(200).json(
          {
              message:"deleted Successfully!",
      
          });
     })
     
     })
  
  module.exports = router;