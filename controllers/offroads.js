const Offroad = require("../models/offroad");
const cloudinary = require('cloudinary');


// Geolocation
const NodeGeocoder = require('node-geocoder');
const geocoder = NodeGeocoder({
  provider: "opencage",
  apiKey: process.env.GEOCODER_API_KEY
});

// Regex for search bar
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// cloudinary image storage info
cloudinary.config({ 
  cloud_name: 'shadowrust', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let offroadController = { 
  // render offroad view
    getOffroad: async (req, res) => {
      try {
        // find last 10 recently added offroad machines
        let allOffroads = await Offroad.find({}).limit(10).sort({"$natural": -1});
        res.render("offroads/index", { offroads: allOffroads, currentUser: req.user });
      } catch(err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    }, 
    // create new offroad machine listing
    postOffroad: async (req, res) => {
      // if there is an image
        if(req.file) {
            try {
              // upload image to cloudinary
              let result = await cloudinary.v2.uploader.upload(req.file.path);
              req.body.image = result.secure_url;
              req.body.image_id = result.public_id
              var image = req.body.image    
              var imageId = req.body.image_id 
            } catch(err) {
              req.flash("error", err.message);
              return res.redirect("back");
            }
          }
          try {
            // set location for offroad machine listing
            let newLocation = await geocoder.geocode(req.body.location);
            var lat = newLocation[0].latitude;
            var lng = newLocation[0].longitude;
            var location = req.body.location
          } catch(err) {
            req.flash('error', err.message)
            return res.redirect('back')
          }
          // set offroad machine fields from inputs
          let name = req.body.name
          let desc = req.body.description
          let price = req.body.price
          let title = req.body.title
          let author = {
            id: req.user._id,
            username: req.user.username
          }
          let vin = req.body.vin
          let odometer = req.body.odometer
          let make = req.body.make
          let makeModel = req.body.makeModel
        
          let newOffroad = {name: name, title: title, vin: vin, odometer: odometer, make: make, makeModel: makeModel, price: price, imageId: imageId,  image: image, description: desc, author: author, location: location, lat: lat, lng: lng}
          try {
            // create new offroad machine
            let offroad = await Offroad.create(newOffroad);
            res.redirect('/offroads/' + offroad.id);  
          } catch(err) {
            req.flash('error', err.message);
            return res.redirect('back');
          }
    },
    // render all offroad machines view
    getAllOffroad: async (req, res) => {
      // control number of offroad machines per page
        const perPage = 9;
        const pageQuery = parseInt(req.query.page);
        const pageNumber = pageQuery ? pageQuery : 1;
        try {
          // finds all offroad machine, skips machines it has already shown depending on the page
          // limits the number of machines viewable per page at 9 
          // Shows most recently added first
          let allOffroads = await Offroad.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).sort({"$natural": -1}).exec();
          // returns count of documents that match query
          let count = await Offroad.countDocuments().exec();  
          res.render("offroads/all", { offroads: allOffroads, currentUser: req.user, current: pageNumber, pages: Math.ceil(count / perPage)});
        } catch(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    },
    // render search offroad machines view
    getSearchOffroad: async (req, res) => {
      // controls how many per page
      const perPage = 9;
      const pageQuery = parseInt(req.query.page);
      const pageNumber = pageQuery ? pageQuery : 1;
      // if there is a query in search bar
      if (req.query.search) {
        // regex for search params
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        try {
          // finds all offroad machine that fit regex pattern, skips machines it has already shown depending on the page
          // limits the number of machines viewable per page at 9 
          // Shows most recently added first
          let searchOffroads = await Offroad.find({ name: regex }).skip((perPage * pageNumber) - perPage).limit(perPage).sort({"$natural": -1}).exec();
          // returns count of documents that match regex query
          let count = await Offroad.countDocuments({name: regex}).exec();  
          res.render("offroads/search", { offroads: searchOffroads, currentUser: req.user, current: pageNumber, pages: Math.ceil(count / perPage), search: req.query.search});
        } catch(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
      } else {
        return res.redirect("/offroads");
      }
    },
    // render new offroads view
    getNewOffroad: async (req, res) => {
        res.render("offroads/new");
    }, 
    // render specific offroad machine view
    getIdOffroad: async (req, res) => {
        try {
          // find offroad machine by id and populate comments section
            let foundOffroad = await Offroad.findById(req.params.id).populate("comments").exec();
            res.render("offroads/show", { offroad: foundOffroad, currentUser: req.user, MAPBOX_API_KEY: process.env.MAPBOX_API_KEY });
          } catch(err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
    },
    // render offroad edit view
    getIdEditOffroad: async (req, res) => {
        try {
          // find offroad machine by id
            let foundOffroad = await Offroad.findById(req.params.id);
            res.render("offroads/edit", { offroad: foundOffroad });
          } catch(err) {
            req.flash("error", err.message);
            return res.redirect("campgrounds");
          }
    },
    // update specific offroad machine
    updateIdOffroad: (req, res) => {
      // find offroad machine by id
        Offroad.findById(req.params.id, async (err, offroad) => {
            if(err) {
              req.flash("error", "Dirtbike Update Failed");
              return res.redirect("/offroads");
            }
            // if there is a new image
            if(req.file) {
              try {
                // destroy old image
                await cloudinary.v2.uploader.destroy(offroad.imageId);
                // upload new image
                let result = await cloudinary.v2.uploader.upload(req.file.path);
                offroad.imageId = result.public_id;
                offroad.image = result.secure_url;  
              } catch(err) {
                req.flash("error", err.messagee);
                return res.redirect("back");
              }
            }
            if(req.body.location !== offroad.location){
              try {
                // update geocoder location
                let updatedLocation = await geocoder.geocode(req.body.location);
                offroad.lat = updatedLocation[0].latitude;
                offroad.lng = updatedLocation[0].longitude;
                offroad.location = req.body.location;
              } catch(err){
                req.flash("error", err.message);
                return res.redirect("back");
              }
            }
            // set offroad fields
            offroad.name = req.body.name
            offroad.description = req.body.description
            offroad.price = req.body.price
            offroad.title = req.body.title
            offroad.vin = req.body.vin
            offroad.odometer = req.body.odometer
            offroad.make = req.body.make
            offroad.makeModel = req.body.makeModel
            
            // save offroad machine info
            offroad.save();
            req.flash("success", "Offroad Listing Updated");
            res.redirect("/offroads/" + req.params.id);
          });        
    }, 
    // delete specific offroad machine
    deleteIdOffroad: (req, res) => {
      // find offroad machine by id
        Offroad.findById(req.params.id, async (err, offroad) => {
            if(err) {
              req.flash("error", err.message);
              return res.redirect("/offroads");
            }
            try {
              // delete image in cloudinary
              await cloudinary.v2.uploader.destroy(offroad.imageId);
              // delete specific machine
              Offroad.deleteOne({_id: req.params.id}).exec();
              req.flash("success", "Offroad Listing Deleted");
              res.redirect("/offroads");
            } catch(err) {
              req.flash("error", err.message);
              return res.redirect("/offroads/" + req.params.id);
            }
          });        
    },
    // favorite an offroad machine 
    postIdFavoriteOffroad: (req, res) => {
        Offroad.findById(req.params.id, (err, foundOffroad) => {
            if(err) {
              req.flash("error", err.message);
              return res.redirect("/offroads");  
            }
          // check if req.user._id exists in foundOffroad favorites
          var foundUserFavorite = foundOffroad.favorites.some(function (favorite) {
            return favorite.equals(req.user._id);
          });
    
          if (foundUserFavorite) {
            // user already favorite, removing favorite
            foundOffroad.favorites.pull(req.user._id);
          } else {
            // adding the new user favorite
            foundOffroad.favorites.push(req.user);
          }
          // save offroad machine info
          foundOffroad.save(function (err) {
            if (err) {
              console.log(err);
              return res.redirect("/offroads");
          }
          return res.redirect("/offroads/" + foundOffroad._id);
          });
        });    
    }
};

module.exports = offroadController;