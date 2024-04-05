
const Router = require('express');
const router = new Router()
const abilityRouter = require('./abilityRouter')
const userRouter = require('./userRouter')
const reposRouter = require('./reposRouter')

router.use('/user', userRouter)
router.use('/ability', abilityRouter)
router.use('/repos', reposRouter)

module.exports = router





