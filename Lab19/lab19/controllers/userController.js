const {Users} = require('../models');

const getAllUsers = async (request, response) => {
    try {
        request.ability.throwUnlessCan('manage', 'all');
        const users = await Users.findAll(
            {
                attributes: ['id', 'username', 'email', 'role']
            });
        return response.status(200).json(users);
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}

const getOneUser = async (request, response) => {
    try {
        request.ability.throwUnlessCan('read', new Users({id: Number(request.params.id)}));
        const user = await Users.findOne(
            {
                where:
                    {
                        id: request.params.id
                    },
                attributes: ['id', 'username', 'email', 'role']
            });
        if (user) {
            return response.status(200).json(user);
        } else {
            return response.status(404).send('User is not found');
        }
    } catch (err) {
        return response.status(403).send('Forbidden');
    }
}


module.exports = {
    getAllUsers: getAllUsers,
    getOneUser: getOneUser
};