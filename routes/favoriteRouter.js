const express = require("express");
const cors = require("./cors");
const authenticate = require("../authenticate");
const Favorite = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorites) => {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          req.body.forEach((fav) => {
            if (!favorite.campsites.includes(fav._id)) {
              favorite.campsites.push(fav._id);
            }
          });
          favorite
            .save()
            .then((favorites) => {
              res.setHeader("Content-Type", "application/json");
              res.statusCode = 200;
              res.json(favorites);
            })
            .catch((err) => next(err));
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body }).then(
            (favorites) => {
              res.setHeader("Content-Type", "application/json");
              res.statusCode = 200;
              res.json(favorites);
            }
          );
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((favorites) => {
        res.statusCode = 200;
        if (favorites) {
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        } else {
          res.setHeader("Content-Type", "plain/text");
          res.end("You do not have any favorites to delete.");
        }
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorites) => {
      if (favorites) {
        if (favorites.campsites.includes(req.params.campsiteId)) {
          res.end("That campsite is already in the list of favorites!");
        } else {
          favorites.campsites.push(req.params.campsiteId);
          favorites.save().then((favorites) => {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.json(favorites);
          });
        }
      } else {
        Favorite.create({
          user: req.user._id,
          campsites: [req.params.campsiteId],
        });
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.json(favorites);
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  });
delete (cors.corsWithOptions,
authenticate.verifyUser,
(req, res, next) => {
  Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
      if (favorite) {
        const index = favorite.campsites.indexOf(req.params.campsiteId);
        if (index >= 0) {
          favorite.campsites.splice(index, 1);
        }
        favorite
          .save()
          .then((favorite) => {
            Favorite.findById(favorite._id).then((favorite) => {
              console.log("Favorite Campsite Deleted!", favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({
                Message: `Favorite campsite ${req.params.campsiteId} deleted`,
                Favorite: favorite,
              });
            });
          })
          .catch((err) => next(err));
      } else {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      }
    })
    .catch((err) => next(err));
});

module.exports = favoriteRouter;
