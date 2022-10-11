var express = require('express');
var router = express.Router();
const path = require('path');
const adminHelpers = require('../helpers/admin-helpers');
const productHelpers = require('../helpers/product-helpers');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      cb(null, './public/upload');
    } catch (error) {
      res.redirect('/admin/error-500');
    }
  },
  filename: function (req, file, cb) {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      console.log(file);
      cb(
        null,
        file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
      );
    } catch (error) {
      res.redirect('/admin/error-500');
    }
  },
});

const upload = multer({ storage: storage });
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/admin')
  }
}

// post page
// add product
router.post('/add-product', upload.array('files', 3), (req, res) => {
  productHelpers.addProduct(req.body, req.files).then(() => {
   
    res.redirect('/admin/products');
  });
});

// get page 
// add category
router.get('/add-category', function (req, res) {
  res.render('admin/add-category', { layout: 'admin-layout', admin: true });
});
router.post('/add-category', upload.single('files'), (req, res) => {
  productHelpers.addCategory(req.body, req.file).then(() => {
    console.log('hello');
    res.redirect('/admin/category');
  });
});

// get page
// getAll category
router.get('/category', (req, res) => {
  productHelpers.getCategory().then((category) => {
    res.render('admin/category', {
      category,
      layout: 'admin-layout',
      admin: true,
    });
  });
});

//get page
// home page

router.get('/', function (req, res, next) {
  if(req.session.loggedIn){
    res.redirect('/admin/dashboard')
  }else
  res.render('admin/login', { layout: 'admin-layout' ,loginErr:req.session.loginErr});
  req.session.loginErr=false
});

router.get('/error-500', (req, res) => {
  res.render('admin/error-500');
});

//get page
// home page
router.get('/dashboard',verifyLogin, (req, res) => {
  const admin=req.session.admin;
  console.log(admin);
  res.render('admin/index', { admin,layout: 'admin-layout', admin: true });
});
//post page
// login
router.post('/login', (req, res) => {
  adminHelpers
    .adminLogin(req.body)
    .then((response) => {
      if (response.status) {
        req.session.loggedIn=true
        req.session.admin=response.admin
        res.redirect('/admin/dashboard');
      } else {
        req.session.loginErr=true
        res.redirect('/admin');
      }
    })
    .catch((error) => {
      if (error.serverError) {
        res.redirect('/admin/error-500');
      }
    });
});
// get page
//getAll products
router.get('/products',verifyLogin, (req, res) => {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/products', {
      products,
      layout: 'admin-layout',
      admin: true,
    });
  });
});

//get page 
//add product
router.get('/add-product', verifyLogin,(req, res) => {
  productHelpers.getCategory(req.params.id).then((category) => {
    res.render('admin/add-product', {
      category,
      layout: 'admin-layout',
      admin: true,
    });
  });
});

// edit category
// get page 
router.get('/edit-category/:id',verifyLogin, async (req, res) => {
  let category = await productHelpers.getCategoryDetials(req.params.id);
  console.log(category);
  res.render('admin/edit-category', {
    layout: 'admin-layout',
    admin: true,
    category,
  });
});

// delete category
// get page 
router.get('/delete-category/:id', (req, res) => {
  let catId = req.params.id;
  console.log(catId);
  productHelpers.deleteCategory(catId).then((response) => {
    res.redirect('/admin/category');
  });
});

// delete product
// get page
router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id;
  console.log(proId);
  productHelpers.deleteproduct(proId).then((responses) => {
    res.redirect('/admin/products');
  });
});

// edit product
// get page
router.get('/edit-product/:id',verifyLogin, async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  const category = await productHelpers.getCategory(req.params.id);
  res.render('admin/edit-product', {
    layout: 'admin-layout',
    admin: true,
    product,
    category,
  });
});
// edit product
// post page
router.post('/edit-product/:id', upload.array('files', 3), (req, res) => {
  console.log('product details');
  console.log(req.body);
  console.log('product id');
  console.log(req.params.id);
  productHelpers.updateProduct(req.body, req.params.id, req.files).then(() => {
    console.log('hello');
    res.redirect('/admin/products');
  });
});

// edit category
// get page
router.get('/edit-category/:id',verifyLogin, async (req, res) => {
  const category = await productHelpers.getCategoryDetials(req.params.id);
  console.log(category);
  res.render('admin/edit-category', {
    category,
    layout: 'admin-layout',
    admin: true,
  });
});
// post page
router.post('/edit-category/:id', upload.single('files'), (req, res) => {
  let id = req.params.id;
  productHelpers.updateCategory(req.params.id, req.body, req.file).then(() => {
    res.redirect('/admin/category');
  });
});


  
// getAll users
router.get('/user',(req,res)=>{
  adminHelpers.getuser().then((UserData)=>{
    res.render('admin/userDetails',{UserData,layout:'admin-layout',admin:true})
  });
  });

  // delete users
  router.get('/delete-user/:id',(req,res)=>{
    userId=req.params.id
    console.log(userId);
    adminHelpers.deleteUser(userId).then((response)=>{
      res.redirect('/admin/user')
    })
  })
  




// #####  l o g o u t ***

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/admin')
})



module.exports = router;
