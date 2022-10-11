const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('express');

module.exports = {
	adminLogin: (adminData) => {

		let loginStatus = false;
		let response = {};
		return new Promise(async (resolve, reject) => {

			try {

				let admin = await db
					.get()
					.collection(collection.ADMIN_COLLECTION)
					.findOne({ email: adminData.email });
				if (admin) {
					bcrypt.compare(adminData.password, admin.password).then((status) => {
						if (status) {
							response.admin = admin;
							response.status = true;
							resolve(response);
						} else {
							console.log('login failed');
							resolve({ status: false });
						}
					});
				} else {
					console.log('login failed');
					resolve({ status: false });
				}
			} catch (error) {
				console.log(error);
				reject({ serverError: true })
			}
		});
	},
	getuser:()=>{
		return new Promise((resolve,reject)=>{
			let UserData=db.get().collection(collection.USER_COLLECTION).find().toArray()
				resolve(UserData);
			
			
		})
	},
	deleteUser:(userId)=>{
		return new Promise((resolve,reject)=>{
			db.get().
			collection(collection.USER_COLLECTION).
			deleteOne({_id:ObjectId(userId)})
			.then((response)=>{
				resolve(response)
			})
		})
	},
};
