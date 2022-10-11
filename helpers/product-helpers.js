const collection = require('../config/collection');
const db = require('../config/connection');
const { ObjectId } = require('mongodb');


module.exports = {
	addProduct: (product, images) => {
		images.forEach((image) => {
			image._id = new ObjectId();
		});
		const { Brand } = product;
		const { Product } = product;
		const { category } = product;
		const { Description } = product;
		const { Price } = product;

		const productObject = {
			Brand,
			Product,
			category,
			Description,
			Price,
			stocks: [
				{
					size: 'S',
					stock: Number(product.S),
				},
				{
					size: 'M',
					stock:Number( product.M),
				},
				{
					size: 'L',
					stock: Number(product.L),
				},
				{
					size: 'XL',
					stock: Number(product.XL),
				},
				{
					size: 'XXL',
					stock:Number( product.XXL),
				},
			],
			images,
		};

		console.log('product');
		return new Promise((resolve, reject) => {
			db.get()
				.collection(collection.PRODUCT_COLLECTION)
				.insertOne(productObject)
				.then((data) => {
					console.log(data);
					resolve();
				});
		});
	},
	getAllProducts: () => {
		return new Promise(async (resolve, reject) => {
			let products = await db
				.get()
				.collection(collection.PRODUCT_COLLECTION)
				.find()
				.toArray();
			resolve(products);
		});
	},
	addCategory: (category, image) => {
	
		image._id = new ObjectId();
		

		const categoryObject = {
		    ...category,
			image,
		};

		return new Promise((resolve, reject) => {
			db.get()
				.collection(collection.CATEGORY_COLLECTION)
				.insertOne(categoryObject)
				.then((data) => {
					console.log(data);
					resolve();
				});
		});
	},
	
	deleteCategory: (catId) => {
		return new Promise((resolve, reject) => {
			db.get()
				.collection(collection.CATEGORY_COLLECTION)
				.deleteOne({ _id: ObjectId(catId) })
				.then((response) => {
					resolve(response);
				});
		});
	},
	
	deleteproduct: (proId) => {
		return new Promise((resolve, reject) => {
			db.get()
				.collection(collection.PRODUCT_COLLECTION)
				.deleteOne({ _id: ObjectId(proId) })
				.then((responses) => {
					resolve(responses);
				});
		});
	},
	getProductDetails: (proId) => {
		return new Promise((resolve, reject) => {
			db.get()
				.collection(collection.PRODUCT_COLLECTION)
				.findOne({ _id: ObjectId(proId) })
				.then((product) => {
					resolve(product);
				});
		});
	},
	updateCategory: (catId, catDetails, image) => {
		image._id = new ObjectId();
		return new Promise((resolve, reject) => {
		  db.get()
			.collection(collection.CATEGORY_COLLECTION)
			.updateOne(
			  { _id: ObjectId(catId) },
			  {
				$set: {
				  category: catDetails.category,
				  image: image,
				},
			  }
			)
			.then((response) => {
			  resolve();
			});
		});
	  },
	  getCategoryDetials: (catId) => {
		return new Promise((resolve, reject) => {
		  db.get()
			.collection(collection.CATEGORY_COLLECTION)
			.findOne({ _id: ObjectId(catId) })
			.then((category) => {
			  resolve(category);
			});
		});
	  },
	  getCategory: () => {
		return new Promise(async (resolve, reject) => {
		  try {
			let category = await db
			  .get()
			  .collection(collection.CATEGORY_COLLECTION)
			  .find()
			  .toArray();
			resolve(category);
		  } catch (error) {
			reject(error);
		  }
		});
	  },
	updateProduct: (product, proId,images) => {
		images.forEach((image)=>{
			image._id=new ObjectId();
		});

		const { Brand } = product;
		const { Product } = product;
		const { category } = product;
		const { Description } = product;
		const { Price } = product;

		const productObject={
			Brand,
			Product,
		    category,
			Description,
			Price,
			stocks: [
				{
					size: 'S',
					stock: Number(product.S),
				},
				{
					size: 'M',
					stock:Number( product.M),
				},
				{
					size: 'L',
					stock: Number(product.L),
				},
				{
					size: 'XL',
					stock: Number(product.XL),
				},
				{
					size: 'XXL',
					stock:Number( product.XXL),
				},
			],
			images

		};
		return new Promise ((resolve,reject)=>{
			db.get()
			.collection(collection.PRODUCT_COLLECTION)
			.updateOne(
				{_id:ObjectId(proId)},
				{
					$set:{
						...productObject
					},
				}
			).then(()=>{
				resolve()
			})
		});
	},
	
};
