const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const op = Sequelize.Op;

class Faculty extends Model {
}

class Pulpit extends Model {
}

class Teacher extends Model {
}

class Subject extends Model {
}

class Auditorium_type extends Model {
}

class Auditorium extends Model {
}


function internalORM(sequelize) {
    Faculty.init(
        {
            faculty: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            faculty_name: {type: Sequelize.STRING, allowNull: false}
        },
        {
            sequelize,
            modelName: 'Faculty',
            tableName: 'Faculty',
            timestamps: false
        }
    );
    Faculty.addHook('beforeCreate', () => {
        console.warn('Before Faculty create')
    })
    Faculty.addHook('afterCreate', () => {
        console.warn('After Faculty create')
    })
    Pulpit.init(
        {
            pulpit: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            pulpit_name: {type: Sequelize.STRING, allowNull: false},
            faculty: {
                type: Sequelize.STRING, allowNull: false,
                references: {model: Faculty, key: 'faculty'}
            }
        },
        {
            sequelize,
            modelName: 'Pulpit',
            tableName: 'Pulpit',
            timestamps: false
        }
    );
    Teacher.init(
        {
            teacher: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            teacher_name: {type: Sequelize.STRING, allowNull: false},
            pulpit: {
                type: Sequelize.STRING, allowNull: false,
                references: {model: Pulpit, key: 'pulpit'}
            }
        },
        {
            sequelize,
            modelName: 'Teacher',
            tableName: 'Teacher',
            timestamps: false
        }
    );
    Subject.init(
        {
            subject: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            subject_name: {type: Sequelize.STRING, allowNull: false},
            pulpit: {
                type: Sequelize.STRING, allowNull: false,
                references: {model: Pulpit, key: 'pulpit'}
            }
        },
        {
            sequelize,
            modelName: 'Subject',
            tableName: 'Subject',
            timestamps: false
        }
    );

    Pulpit.hasMany(Subject, { foreignKey: 'pulpit', sourceKey: 'pulpit' });
    Subject.belongsTo(Pulpit, { foreignKey: 'pulpit', targetKey: 'pulpit' });


    Auditorium_type.init(
        {
            auditorium_type: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            auditorium_typename: {type: Sequelize.STRING, allowNull: false},
        },
        {
            sequelize,
            modelName: 'Auditorium_type',
            tableName: 'Auditorium_type',
            timestamps: false
        }
    );

    Auditorium.init(
        {
            auditorium: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
            auditorium_name: {type: Sequelize.STRING, allowNull: false},
            auditorium_capacity: {type: Sequelize.INTEGER, allowNull: false},
            auditorium_type: {
                type: Sequelize.STRING, allowNull: false,
                references: {model: Auditorium_type, key: 'auditorium_type'}
            }
        },
        {
            sequelize,
            modelName: 'Auditorium',
            tableName: 'Auditorium',
            timestamps: false
        }
    );

    Auditorium.belongsTo(Auditorium_type, { foreignKey: 'auditorium_type', as: 'auditoriumType' });
    Auditorium_type.hasMany(Auditorium, { foreignKey: 'auditorium_type', as: 'auditoriums' });


    Auditorium.addScope('auditoriumsBetween10And60',{
        where: {
            auditorium_capacity: {
                [op.between]: [10, 60]
            }
        }
    });
}

exports.ORM = (s) => {
    internalORM(s);
    return {Faculty, Pulpit, Teacher, Subject, Auditorium_type, Auditorium};
}