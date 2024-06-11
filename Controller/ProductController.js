const ItemModal = require("../Model/ProductModal")
const jwt = require("jsonwebtoken")
const SubUserModal = require("../Model/SubUserModal")
const e = require("express");
const QRCode = require('qrcode');

exports.productCreation = (req, res) => {

    if(req.userType === "user"){
        const {
            productName,
            abv,
            category,
            description,
            type,
            style,
            producer,
            quantity,
            pricintList,
            imageUrl,
            active
        } = req.body;
        const userId = req.userId;
        const _newItem = new ItemModal({
            userId,
            productName,
            abv,
            category,
            description,
            type,
            style,
            producer,
            quantity,
            pricintList,
            imageUrl,
            active
        })

        _newItem.save((error, data) => {
            if (error) {
                return res.status(400).json({
                    status: "error",
                    message: "Something went wrong",
                    error: error
                })
            }
            if (data) {
                return res.status(201).json({
                    status: "Success",
                    message: "Item created successfully",
                    data: data,
                });
            }
        })
    }
    else {
        res.status(400).json({
            status: "error",
            message: "You are not authorized. Please sign in as a user to continue",
        })
    }
}


exports.getUserProductsByCategory = async (req, res) => {
    try {
        if (req.userType === "subUser") {
            const subUser = await SubUserModal.findById(req.userId)
                if (subUser) {
                    const Record = await ItemModal.find({ userId: subUser.parentUser, category: req.body.category, active: true});
                    if (Record) {
                        res.status(200).json({
                            status: "success",
                            message: "Get All Product Successfully",
                            data: Record,
                        })
                    } else {
                        res.status(400).json({
                            status: "error",
                            message: "Something Went Wrong",
                        })
                    }
                }  else {
                    res.status(400).json({
                        status: "error",
                        message: "Something Went Wrong",
                    })
                }
        }

        if(req.userType === "user"){
            const Record = await ItemModal.find({ userId: req.userId, category: req.body.category });
            if (Record) {
                res.status(200).json({
                    status: "success",
                    message: "Get All Product Successfully",
                    data: Record,
                })
            } else {
                res.status(400).json({
                    status: "error",
                    message: "Something Went Wrong",

                })
            }
        }

        else {
            res.status(400).json({
                status: "error",
                message: "You are not signed in. Please sign in to continue",
            })
        }
    } catch (error) {
        console.log(error)
    }

}

exports.getAllUserProducts = async (req, res) => {
    try{
        if(req.userType === "user"){
            const Record = await ItemModal.find({ userId: req.userId });
            if (Record) {
                res.status(200).json({
                    status: "success",
                    message: "Get All Product Successfully",
                    data: Record,
                })
            } else {
                res.status(400).json({
                    status: "error",
                    message: "Something Went Wrong",

                })
            }
        }
        else {
            res.status(400).json({
                status: "error",
                message: "You are not authorized. Please sign in as a user to continue",
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.setProductStatus = (req, res) => {
    if(req.userType === "user"){
        ItemModal.findOneAndUpdate(
            { _id: req.body._id },
            {
                active: req.body.active,
            },
            { new: true },
            (error, data) => {
                if (data) {
                    return res.status(200).json({
                        status: 200,
                        data: data,
                    });
                } else {
                    return res.status(400).json({
                        status: 400,
                        message: "Something went wrong",
                    });
                }
            }
        );
    }
    else {
        res.status(400).json({
            status: "error",
            message: "You are not authorized. Please sign in as a user to continue",
        })
    }
};


// exports.updateProductItem = (req, res) => {
//     ItemModal.findOneAndUpdate(
//         { _id: req.body._id },
//         {
//             active: req.body.active,
//         },
//         { new: true },
//         (error, data) => {
//             if (data) {
//                 return res.status(200).json({
//                     status: 200,
//                     data: data,
//                 });
//             } else {
//                 return res.status(400).json({
//                     status: 400,
//                     message: "Something went wrong",
//                 });
//             }
//         }
//     );
// };

// userId,
// productName,
// abv,
// category,
// description,
// type,
// style,
// producer,
// quantity,
// pricintList,
// imageUrl,
// active

exports.updateItemCompletely = (req, res) => {
    if(req.userType === "user"){
        ItemModal.findOneAndUpdate(
            { _id: req.body._id },
            {
                productName: req.body.productName,
                abv: req.body.abv,
                category: req.body.category,
                description: req.body.description,
                type: req.body.type,
                style: req.body.style,
                producer: req.body.producer,
                quantity: req.body.quantity,
                imageUrl: req.body.imageUrl,
                userId: req.userId

            },
            { new: true },
            (error, data) => {
                if (data) {
                    return res.status(200).json({
                        status: 200,
                        data: data,
                    });
                } else {
                    return res.status(400).json({
                        status: 400,
                        message: "Something went wrong",
                    });
                }
            }
        );
    }
    else {
        res.status(400).json({
            status: "error",
            message: "You are not authorized. Please sign in as a user to continue",
        })
    }
};




exports.findItemById = (req, res) => {
        ItemModal.findById(req.body._id, (err, record) => {
            if (err) {
                return res.status(400).json({
                    status: 400,
                    message: "Something went wrong",
                });
            }
            if (record) {
                return res.status(200).json({
                    status: 200,
                    record: record,
                });
            }


        })

};




exports.deleteItemById = (req, res) => {
    if(req.userType === "user"){
        ItemModal.findByIdAndDelete(req.body._id, (err, doc) => {
            if (err) {
                return res.status(400).json({
                    status: 400,
                    message: "Something went wrong",
                });
            } else {
                return res.status(200).json({
                    status: 200,
                    record: "Item deleted successfully",
                });
            }
        });
    }
    else {
        res.status(400).json({
            status: "error",
            message: "You are not authorized. Please sign in as a user to continue",
        })
    }
}

// exports.generateQRCode = async (req, res) => {
//     try {
//         // Generate a link for active products
//         const link = `http://localhost:4000/product/api/active?category=${req.query.category}`;
        
//         // Generate QR Code
//         QRCode.toDataURL(link, (err, url) => {
//             if (err) {
//                 return res.status(500).json({
//                     status: "error",
//                     message: "Failed to generate QR code",
//                     error: err
//                 });
//             }

//             return res.status(200).json({
//                 status: "success",
//                 message: "QR code generated successfully",
//                 link: link,
//                 qrcode: url
//             });
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: "error",
//             message: "Server error",
//             error: error
//         });
//     }
// };

// Generate Link for Active Products
exports.generateLinkForActiveProducts = (req, res) => {
    try {
        const link = `http://localhost:${process.env.PORT}/product/api/active?category=${req.query.category}`;
        return res.status(200).json({
            status: "success",
            message: "Link generated successfully",
            link: link
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Server error",
            error: error
        });
    }
};

// Generate QR Code for a Given Link
exports.generateQRCodeForLink = (req, res) => {
    const { link } = req.body;

    try {
        QRCode.toDataURL(link, (err, url) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Failed to generate QR code",
                    error: err
                });
            }

            return res.render('displayQRCode', { qrcode: url });
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Server error",
            error: error
        });
    }
};

// Get Active Products by Category
exports.getActiveProductsByCategory = async (req, res) => {
    const { category } = req.query;

    console.log("hello");
    try {
        const categories = category.split(',');

        const query = {
            category: { $in: categories },
            active: true
        };

        const products = await ItemModal.find(query);

        return res.render('activeProducts', { products });

    } catch (error) {
        return res.status(500).json({
            
            status: "error",
            message: "Server error",
            error: error
        });
    }
};


// exports.getActiveProductsByCategory = async (req, res) => {
//     const { category } = req.query;

//     try {
//         const categories = category.split(',');

//         const query = {
//             category: { $in: categories },
//             active: true
//         };

//         const products = await ItemModal.find(query);

//         return res.render('activeProducts', { products });
//     } catch (error) {
//         return res.status(500).json({
//             status: "error",
//             message: "Server error",
//             error: error
//         });
//     }
// };


