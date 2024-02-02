const Router = require("express").Router();
const{getToken,checkoutData}  =require("../azampay/main")
Router.route("/").get(getToken)
Router.route("/").post(checkoutData)

module.exports = Router;