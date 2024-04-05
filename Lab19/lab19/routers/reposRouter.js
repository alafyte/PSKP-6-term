const Router = require('express');
const repoRouter = new Router()
const reposController = require('../controllers/reposController')

repoRouter.get('/', reposController.getAllRepos);
repoRouter.get('/:id', reposController.getOneRepo);
repoRouter.post('/', reposController.createRepo);
repoRouter.put('/:id', reposController.updateRepo);
repoRouter.delete('/:id', reposController.deleteRepo);
repoRouter.get('/:id/commits', reposController.getAllCommitsByRepo);
repoRouter.get('/:id/commits/:commitId', reposController.getOneCommitByRepo);
repoRouter.post('/:id/commits', reposController.createCommitByRepo);
repoRouter.put('/:id/commits/:commitId', reposController.updateCommitByRepo);
repoRouter.delete('/:id/commits/:commitId', reposController.deleteCommitByRepo);



module.exports = repoRouter;