const db = require('../config/connection')
const collection = require('../config/collection')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');


module.exports = {
    dosignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {

                delete userData.confirmPassword;
                userData.password = bcrypt.hashSync(userData.password, 10);
                db.get()
                    .collection(collection.USER_COLLECTION).insertOne(userData).then(() => {

                        resolve()



                    });
            } catch (error) {
                console.log('it is error' + error);
                reject(error)
            }

        });
    },

    dosignin: (userData) => {
        let loginStatus = false
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {

                let user = await db
                    .get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
                if (user) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            console.log("login success");
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("login failed");
                            resolve({ status: false })
                        }

                    })

                } else {
                    console.log('login failed');
                    resolve({ status: false })
                }
            } catch (error) {
                console.log('it is error' + error)
                reject(error)
            }
        });
    },

    getuserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) }).then((response) => {
                    console.log(response);
                    resolve(response)
                })
            } catch (error) {
                console.log('it is error ');
                reject(error)
            }
        })
    },

    updateUser: (userDetails, userId) => {
        console.log("user details", userDetails)
        const { Name, Email, Number } = userDetails
        console.log(Name, Email, Number)



        return new Promise((resolve, reject) => {
            try {

                db.get().collection(collection.USER_COLLECTION)
                    .updateOne({ _id: ObjectId(userId) },
                        {
                            $set: {
                                username: Name,
                                email: Email,
                                phoneNumber: Number
                            },
                        }
                    ).then((response) => {
                        resolve(response)
                    })
            } catch (error) {
                console.log('it is error' + error);
                reject(error)
            }

        })

    },

    addToCart: (proId, userId) => {
        let proObj = {
            item: ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().
                collection(collection.CART_COLLECTION).
                findOne({ user: ObjectId(userId) })


            if (userCart) {
                let proExist = userCart.products.
                    findIndex((product) => product.item == proId)
                console.log(proExist);


                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(userId), 'products.item': ObjectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {

                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(userId) },
                            {
                                $push:
                                {
                                    products: proObj
                                }

                            }).then((response) => {
                                resolve()
                            });
                }

            } else {
                let CartObj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(CartObj).then((response) => {
                    resolve()
                })

            }

        })
    },

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let CartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'

                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$products', 0] }
                    }
                }

            ]).toArray()
            console.log(CartItems);
            resolve(CartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            count = 0
            let Cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (Cart) {
                count = Cart.products.length
            }
            resolve(count)
        })
    },

    changeProductQuantity: ({ details }) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart) },
                        {
                            $pull: { products: { item: ObjectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart),
                         'products.item': ObjectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        
                        resolve(true)

                    })
            }
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
          console.log(userId);
          let cart = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .findOne({ user: ObjectId(userId) });
          if (cart) {
            let total = await db
              .get()
              .collection(collection.CART_COLLECTION)
              .aggregate([
                {
                  $match: { user: ObjectId(userId) },
                },
                {
                  $unwind: "$products",
                },
                {
                  $project: {
                    item: "$products.item",
                    quantity: "$products.quantity",
                  },
                },
                {
                  $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: "item",
                    foreignField: "_id",
                    as: "products",
                  },
                },
                {
                  $project: {
                    item: 1,
                    quantity: 1,
                    product: { $arrayElemAt: ["$products", 0] },
                  },
                },
    
                {
                  $group: {
                    _id: null,
                    total: {
                      $sum: {
                        $multiply: [
                          "$quantity",
                          { $convert: { input: "$product.price", to: "int" } },
                        ],
                      },
                    },
                  },
                },
              ])
              .toArray();
            resolve(total[0].total);
          } else {
            resolve(0);
          }
        });
      },

      placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
          console.log(order, products, total);
          let status = order.paymentMethod === "COD" ? "placed" : "pending";
          let orderObj = {
            DeliveryDetails: {
              name: order.name,
              mobile: order.phone,
              address: order.housename,
              pincode: order.pincode,
              town: order.town,
              district: order.district,
              state: order.state,
              email: order.email,
            },
            userId: ObjectId(order.userId),
            paymentMothed: order.paymentMethod,
            products: products,
            totalAmount: total,
            status: status,
            date: new Date(),
          };
    
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .insertOne(orderObj)
            .then((response) => {
              db.get()
                .collection(collection.CART_COLLECTION)
                .deleteOne({ user: ObjectId(order.userId) });
              resolve(response.insertedId);
            });
        });
      },

      getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
          console.log(userId);
          let cart = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .findOne({ user: ObjectId(userId) });
          console.log(cart);
          resolve(cart.products);
        });
      },

      getUserOrders: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
          let orders = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .find({ userId: ObjectId(userId) })
            .toArray();
          resolve(orders);
        });
      },

      getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
          let orderItems = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: { _id: ObjectId(orderId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "products",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$products", 0] },
                },
              },
            ])
            .toArray();
          console.log(orderItems);
          console.log("its that");
          resolve(orderItems);
        });
      },


      generateRazorpay: (orderId, total) => {
        console.log("hait velly");
        return new Promise((resolve, reject) => {
          var options = {
            amount: total * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: "" + orderId,
          };
          instance.orders.create(options, function (err, order) {
            console.log("New Order:", order);
            resolve(order);
          });
        });
      },

      verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
          const crypto = require("crypto");
          let hmac = crypto.createHmac("sha256", "tSbOUUiR8D0d54ngGpTj6bWb");
          hmac.update(
            details["payment[razorpay_order_id]"] +
              "|" +
              details["payment[razorpay_payment_id]"]
          );
          hmac = hmac.digest("hex")
          if (hmac==details['payment[razorpay_signature]']) {
            console.log('it not a problem');
            resolve();
          } else {
            console.log("error in hmac");
            reject();
          }
        });
      },
      changePaymentStatus: (orderId) => {
        console.log("payment status");
        return new Promise((resolve, reject) => {
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .updateOne(
              { _id: ObjectId(orderId) },
              {
                $set: {
                  status: "placed",
                },
              }
            )
            .then(() => {
              resolve();
            });
        });
      },










      
}