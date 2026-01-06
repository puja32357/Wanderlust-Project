const express=require("express");
const router=express.Router();
const mongoose=require ("mongoose");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const { listingSchema , reviewSchema}=require("../schema.js");
const Listing=require("../models/listing.js");
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");
const User=require("../models/user.js");
const listingController = require("../Controllers/listings.js");
const multer=require("multer");
const {storage} = require("../cloudConfig.js");
const upload=multer({ storage });

router
 .route("/")
 .get(wrapAsync(listingController.index))
 .post(
   isLoggedIn ,
   upload.single('listing[image]'),
   validateListing,
   wrapAsync(listingController.createListing)
  );

router.get("/new" , isLoggedIn, listingController.renderNewForm);
router
 .route("/:id")
 .get(wrapAsync(listingController.showListings))
 .put(isLoggedIn , isOwner , upload.single('listing[image]'), validateListing ,  wrapAsync(listingController.updateListing))
 .delete( isLoggedIn , isOwner , wrapAsync(listingController.deleteListing));


router.get("/:id/edit", isLoggedIn, isOwner , wrapAsync(listingController.renderEditForm));

router.post("/" , isLoggedIn , validateListing ,wrapAsync(listingController.new));

module.exports=router;

