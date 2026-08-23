import express from 'express'
import {bcryptPassword , checkJWTToken, refreshToken, registerUser} from '../controllers/user.controller.js'


const router = express.Router();

router.get('/checkjwt' ,  checkJWTToken)
router.get('/hasspass' , bcryptPassword)
router.post('/register' , registerUser)
router.post('/refreshtoken' , refreshToken)

export default router;