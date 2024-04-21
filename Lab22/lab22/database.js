const Sequelize = require('sequelize');

const sequelize = new Sequelize('Telegram', 'User1', 'user1', {
    host: 'localhost', dialect: 'mssql',
});

const Subscriber = sequelize.define('Subscriber', {
        chat_id: {
            type: Sequelize.DataTypes.NUMBER,
            allowNull: false,
            primaryKey: true,
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
)

module.exports = Subscriber;