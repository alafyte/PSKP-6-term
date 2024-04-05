const getAllRules = async (request, response) => {
    return response.status(200).send(request.ability.rules);
}

exports.getAllRules = getAllRules;