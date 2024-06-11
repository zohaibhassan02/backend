const express = require('express')
const router = express.Router()
const { authCheck } = require("../MiddleWare/Auth")



const { userSignUp, userSignIn, userSignOut, userEditProfile, requestPasswordReset, resetPassword, changePassword, inviteSubUser, toggleSubUserStatus } = require("../Controller/UserAuthController")



router.post("/userSignUp", userSignUp)
router.post("/userSignIn", userSignIn)
router.post("/userSignOut", userSignOut)
router.post("/requestPasswordReset", requestPasswordReset)
router.put("/resetPassword/:token", resetPassword)


router.put("/userEditProfile", authCheck, userEditProfile)
router.put("/changePassword", authCheck, changePassword)
router.post("/inviteSubUser", authCheck, inviteSubUser)
router.put("/toggleSubUserStatus", authCheck, toggleSubUserStatus)








module.exports = router