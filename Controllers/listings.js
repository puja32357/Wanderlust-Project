const { models } = require("mongoose");
const Listing = require("../models/listing");
const mongoose = require("mongoose");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken});

module.exports.index=async(req,res) => {
   const allListings=await Listing.find({});
   res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req , res) => {
    res.render("listings/new.ejs");
};

module.exports.showListings = async(req,res) => {
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({
        path:"reviews", 
        populate:{
          path:"author"
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error" , "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs" ,{listing , currUser:req.user});
};

module.exports.createListing = async(req,res,next) => {
    let response = await geocodingClient.forwardGeocode({
        query : req.body.listing.location,
        limit : 1 ,
    })
    .send();

    let url = req.file.path;
    let filename=req.file.filename;
    let{title,description,image,price,location,country}=req.body;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url , filename};
    newListing.geometry= response.body.features[0].geometry;
    let savedListing = await newListing.save();
    req.flash("success" , "New Listing Created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res) => {
     let { id } = req.params;
     id=id.trim();
     if(!mongoose.Types.ObjectId.isValid(id))
     {
        console.log("Invalid objectId provided:",id);
     }
     const listing=await Listing.findById(id);
     if(!listing)
     {
        console.log("Listing not found for Id:",id);
     }
     let originalImageUrl=listing.image.url;
     originalImageUrl = originalImageUrl.replace("/upload" , "/upload/w_250");
     res.render("listings/edit.ejs" , {listing , originalImageUrl});
};

module.exports.updateListing = async(req,res) => {
      let { id } = req.params;
      id=id.trim();
     let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
     
      if(typeof req.file !== "undefined")
      {
        let url = req.file.path;
        let filename=req.file.filename;
        listing.image = {url,filename};
        await listing.save();
      }

     req.flash("success" , "Listing Updated!!");
     res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async(req,res) => {
    let { id }=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    console.log("deleted listing");
    res.redirect("/listings");
};

module.exports.new = async (req,res) => {
   const newListing = new Listing(req.body.listing);
   newListing.owner = req.user._id;
   await newListing.save();
   res.redirect("/listings");
};

