const express = require('express');

const router = express.Router();
const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')
const otpHelpers = require('../helpers/otp-helpers')
const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    redirect('/authentication')
  }

}



/* GET users listing. */
router.get('/', async function (req, res, next) {
  const userId = req?.session?.user?._id || null;
  let user = null
  if (userId) {
    user = await userHelpers.getuserDetails(userId);
    req.session.user = user
    console.log(req.session.user)
  }
  let CartCount = null
  if (req.session.user) {
    CartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render('user/index', { products, layout: "user-layout", users: true, user, CartCount });
  })
});

router.get('/authentication', (req, res) => {
  res.render('user/authentication', { layout: 'user-layout' })
})
router.get('/otp', (req, res) => {
  console.log('no available')
  res.render('user/otp', { layout: 'user-layout' })

})


router.post('/signup', (req, res) => {
  req.session.userData = req.body
  otpHelpers.otpMake(req.session.userData.phoneNumber).then((response) => {
    res.redirect('/otp')
  })


})
router.post('/otp', (req, res) => {
  req.session.otp = req.body
  phoneNumber = req.session.userData.phoneNumber
  const userDetails = req.session.userData
  otpHelpers.verifyOtp(phoneNumber, req.session.otp).then((verified) => {
    if (verified) {
      userHelpers.dosignup(userDetails).then(() => {
        req.session.loggedIn = true;
        res.redirect('/')
      })
    } else {
      res.redirect('/otp')
    }
  })

})


router.post('/signin', (req, res) => {
  userHelpers.dosignin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      res.redirect('/authentication')
    }
  })

})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/edituser', verifyLogin, (req, res) => {

  let user = req.session.user

  console.log(user);
  userHelpers.getuserDetails(user._id).then((response) => {
    req.session.loggedIn = true

    res.render('user/edituser', { user, layout: 'user-layout', response, users: true })
  })

})

router.post('/edituser', (req, res) => {
  const user = req.session.user
  console.log(req.body)
  userHelpers.updateUser(req.body, user._id).then((response) => {
    console.log(response);
    res.redirect('/edituser')
  })
})


router.get('/shop', async (req, res) => {
  const user = req.session.user
  let CartCount = null
  if (req.session.user) {
    CartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {

    console.log('the shop click not working');
    res.render('user/shopping', { user, products, layout: 'user-layout', users: true, CartCount })

  })
})


router.get('/add-to-cart/:id', (req, res) => {

  console.log('the user details only ');
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {

    res.json({ status: true })
  })

})



router.get('/shoppingCart', verifyLogin, async (req, res) => {
  console.log('WHAT');
  const user = req.session.user
  let CartCount = null
  if (req.session.user) {
    CartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  let products = await userHelpers.getCartProducts(req.session.user._id)
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  console.log(products);
  console.log(totalValue);
  res.render('user/shoppingCart', { totalValue, user, layout: 'user-layout', products, users: true, CartCount })
})


router.post('/change-product-quantity', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then((response) => {
    res.json(response)

  })
})

router.get('place-order', verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order', {
    user,
    total,
    user: req.session.user,
    layout: "user-layout",
    users: true,
  });
});


router.post("/place-order", async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  userHelpers.placeOrder(req.body, products, totalPrice).then((response) => {
    if (req.body["paymentMethod"] === "COD") {
      console.log('hai evey');
      res.json({ codSuccess: true, orderId: response });
    } else {
      console.log('is running');
      userHelpers.generateRazorpay(response, totalPrice).then((response) => {
        res.json(response)
      })
    }
  });
  console.log(req.body);
});


router.get("/order-success/:id", async (req, res) => {
  const { id: orderId } = req.params;
  userId = req.session.user._id;
  const products = await userHelpers.getUserOrders(userId);
  console.log(products);
  res.render("user/order-success", {
    products,
    users: true,
    layout: "user-layout",
    user: req.session.user,
    orderId,
  });
});

router.get("/view-order-products/:id", async (req, res) => {
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id);
  let products = await userHelpers.getOrderProducts(req.params.id);

  res.render("user/view-order-products", {
    totalValue,
    products,
    user: req.session.user,
    layout: "user-layout",
    users: true,
  });
});


router.get("/orders", async (req, res) => {
  user = req.session.user
  let orders = await userHelpers.getUserOrders(user._id)
  res.render("users/orders", { user, users: true, layout: "user-layout", orders })
})

router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
      console.log('Payment Successfull');
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err + 'ERROR');
    res.json({ status: false, errMsg: '' })
  })
})









module.exports = router;
