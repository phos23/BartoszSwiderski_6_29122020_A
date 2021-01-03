const Sauce = require('../models/sauce');
const fs = require('fs');
const {
    Z_FIXED
} = require('zlib');

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then((sauces) => {
        res.status(200).json(sauces);
    }).catch((error) => {
        res.status(400).json({
            error: error
        })
    })
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then((sauce) => {
        res.status(200).json(sauce);
    }).catch((error) => {
        res.status(404).json({
            error: error
        })
    })
};

exports.addSauce = (req, res, next) => {
    req.body.sauce = JSON.parse(req.body.sauce);
    const url = req.protocol + '://' + req.get('host');
    const sauce = new Sauce({
        name: req.body.sauce.name,
        manufacturer: req.body.sauce.manufacturer,
        description: req.body.sauce.description,
        mainPepper: req.body.sauce.mainPepper,
        imageUrl: url + '/images/' + req.file.filename,
        heat: req.body.sauce.heat,
        userId: req.body.sauce.userId,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save().then(
        () => {
            res.status(201).json({
                message: 'Post saved successfully!'
            })
        }).catch((error) => {
        res.status(400).json({
            error: error,
        })
    });
};

exports.modifySauce = (req, res, next) => {
    let sauce = new Sauce({
        _id: req.params.id
    });
    if (req.file) {
        req.body.sauce = JSON.parse(req.body.sauce);
        const url = req.protocol + '://' + req.get('host');
        sauce = {
            _id: req.params.id,
            name: req.body.sauce.name,
            manufacturer: req.body.sauce.manufacturer,
            description: req.body.sauce.description,
            mainPepper: req.body.sauce.mainPepper,
            imageUrl: url + '/images/' + req.file.filename,
            heat: req.body.sauce.heat,
            userId: req.body.sauce.userId,
        }
    } else {
        sauce = {
            _id: req.params.id,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            heat: req.body.heat,
            userId: req.body.userId,
        };
    };
    Sauce.updateOne({
        _id: req.params.id
    }, sauce).then(() => {
        res.status(201).json({
            message: 'Sauce updated successfully!'
        })
    }).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then((sauce) => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink('images/' + filename, () => {
            Sauce.deleteOne({
                    _id: req.params.id
                })
                .then(() => {
                    res.status(200).json({
                        message: 'Deleted!'
                    });
                }).catch((error) => {
                    res.status(400).json({
                        error: error
                    });
                });
        });
    });
};

exports.modifyLike = (req, res, next) => {
    Sauce.findOne({
        _id: res.req.params.id,
    }, function (error, sauce) {
        console.log(sauce.userLiked);
        if (req.body.like === 1) {
            sauce.userLiked.push(req.body.userId)
        } else if (req.body.like === -1) {
            sauce.userDisliked.push(req.body.userId)
        } else {
            sauce.userLiked.indexOf(req.body.userId).remove();
            sauce.userDisliked.indexOf(req.body.userId).remove();
        }
        sauce.likes = sauce.userLiked.length;
        sauce.dislikes = sauce.usersDisliked.length;
        Sauce.updateOne({
            _id: res.req.params.id
        }, sauce).then(() => {
            res.status(200).json({
                message: 'Liked successfully!'
            })
        }).catch(
            (error) => {
                console.log(error)
            })
    })
}