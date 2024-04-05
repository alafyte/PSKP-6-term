const {Repos, Commits} = require('../models');
const Op = require('sequelize').Op;

const getAllRepos = async (request, response) => {
    try {
        request.ability.throwUnlessCan('manage', 'all');
        const repos = await Repos.findAll();
        return response.status(200).json(repos);
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}

const getOneRepo = async (request, response) => {
    try {
        request.ability.throwUnlessCan('read', await Repos.findByPk(request.params.id));
        const repo = await Repos.findOne(
            {
                where:
                    {
                        id: request.params.id
                    }
            });

        if (repo) {
            return response.status(200).json(repo);
        } else {
            return response.status(404).send('Repo is not found');
        }

    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}

const createRepo = async (request, response) => {
    try {
        request.ability.throwUnlessCan('create', 'Repos');
        const existingRepo = await Repos.findOne({
            where: {
                name: request.body.name,
                authorId: request.payload.id
            }
        });
        if (existingRepo) {
            return response.status(409).end('Repo with name ' + existingRepo.name + ' already exists')
        } else {
            const repo = await Repos.create({
                name: request.body.name,
                authorId: request.payload.id
            });
            return response.status(200).json(repo);
        }
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}


const updateRepo = async (request, response) => {
    try {
        request.ability.throwUnlessCan('update', await Repos.findByPk(request.params.id));
        const repo = await Repos.findOne({
            where: {
                id: request.params.id
            }
        });
        if (repo) {
            const existingRepo = await Repos.findOne({
                where: {
                    id: {[Op.ne]: request.params.id},
                    name: request.body.name,
                    authorId: request.payload.id
                }
            });
            if (existingRepo) {
                return response.status(409).end('Repo with name ' + existingRepo.name + ' already exists')
            } else {
                await Repos.update({
                    name: request.body.name
                }, {
                    where: {
                        id: request.params.id
                    }
                });

                return response.status(200).send('Repo is updated');
            }
        } else return response.status(404).send('Repo is not found');
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}

const deleteRepo = async (request, response) => {
    try {
        request.ability.throwUnlessCan('manage', 'all');
        const repo = await Repos.findOne({
            where: {
                id: request.params.id
            }
        });
        if (repo) {
            await Repos.destroy({
                where: {
                    id: request.params.id
                }
            });
            return response.status(200).send('Repo is deleted');
        } else return response.status(404).send('Repo is not found');
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}

const getAllCommitsByRepo = async (request, response) => {
    try {
        request.ability.throwUnlessCan('read', await Repos.findByPk(request.params.id));
        const commits = await Commits.findAll({
            include: [{
                model: Repos,
                required: true,
                where: {
                    id: request.params.id
                },
                attributes: []
            }]
        });
        return response.status(200).json(commits);
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}

const getOneCommitByRepo = async (request, response) => {
    try {
        request.ability.throwUnlessCan('read', await Repos.findByPk(request.params.id));
        const commit = await Commits.findOne({
            where: {
                id: request.params.commitId
            },
            include: [{
                model: Repos,
                required: true,
                where: {
                    id: request.params.id
                },
                attributes: []
            }]
        });
        if (commit) return response.status(200).json(commit);
        else return response.status(404).send('Commit is not found');
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}

const createCommitByRepo = async (request, response) => {
    try {
        request.ability.throwUnlessCan('create', await Repos.findByPk(request.params.id));
        const commit = await Commits.create({
            message: request.body.message,
            repoId: request.params.id
        });
        return response.status(200).send(commit);
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}

const updateCommitByRepo = async (request, response) => {
    try {
        request.ability.throwUnlessCan('update', await Repos.findByPk(request.params.id));
        await Commits.update({
            message: request.body.message
        }, {
            where: {
                id: request.params.commitId
            },
            include: [{
                model: Repos,
                required: true,
                where: {
                    id: request.params.id
                },
                attributes: []
            }]
        });
        return response.status(200).send('Commit is updated');
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}

const deleteCommitByRepo = async (request, response) => {
    try {
        request.ability.throwUnlessCan('manage', 'all');
        await Commits.destroy({
            where: {
                id: request.params.commitId
            },
            include: [{
                model: Repos,
                required: true,
                where: {
                    id: request.params.id
                },
                attributes: []
            }]
        });
        return response.status(200).send('Commit is deleted');
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}

module.exports = {
    getAllRepos: getAllRepos,
    getOneRepo: getOneRepo,
    createRepo: createRepo,
    updateRepo: updateRepo,
    deleteRepo: deleteRepo,
    getAllCommitsByRepo: getAllCommitsByRepo,
    getOneCommitByRepo: getOneCommitByRepo,
    createCommitByRepo: createCommitByRepo,
    updateCommitByRepo: updateCommitByRepo,
    deleteCommitByRepo: deleteCommitByRepo
};