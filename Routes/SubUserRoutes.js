const express = require('express')
const router = express.Router()
const { authCheck } = require("../MiddleWare/Auth")

const { subUserSignIn, subUserSignOut, requestPasswordReset, resetPassword, changePassword } = require("../Controller/SubUserController")

router.post("/subUserSignIn", subUserSignIn)
router.post("/subUserSignOut", subUserSignOut)
router.post("/requestPasswordReset", requestPasswordReset)
router.put("/resetPassword/:token", resetPassword)

router.put("/changePassword", authCheck, changePassword)

module.exports = router