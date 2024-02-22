const Sequelize = require('sequelize');
const {Transaction} = require("sequelize");

const sequelize = new Sequelize('RNA', 'User1', 'user1', {
    host: 'localhost', dialect: 'mssql', define: {
        hooks: {
            beforeBulkDestroy: (instance, options) => {
                console.log('Before destroy');
            },
        }
    },
});
const Op = Sequelize.Op;
const {Faculty, Pulpit, Teacher, Subject, Auditorium_type, Auditorium} = require('./models').ORM(sequelize);

class DB {
    connection = sequelize.authenticate();

    getFaculties = () => {
        return this.connection.then(() => Faculty.findAll());
    }
    getPulpits = () => {
        return this.connection.then(() => Pulpit.findAll());
    }
    getSubjects = () => {
        return this.connection.then(() => Subject.findAll());
    }
    getTeachers = () => {
        return this.connection.then(() => Teacher.findAll());
    }
    getAuditoriumsTypes = () => {
        return this.connection.then(() => Auditorium_type.findAll());
    }
    getAuditoriums = () => {
        return this.connection.then(() => Auditorium.findAll());
    }

    getSubjectsByFaculty = async (faculty) => {
        const foundFaculty = await this.connection.then(() => Faculty.findByPk(faculty));
        if (!foundFaculty) {
            throw new Error("Faculty does not exist");
        }

        const pulpitList = await this.connection.then(() => Pulpit.findAll({
            where: {faculty: faculty},
            include: [{
                model: Subject,
                as: 'Subjects'
            }]
        }));

        const subjects = pulpitList.flatMap(pulpit => pulpit.Subjects);

        return subjects;
    }
    getAuditoriumsByAuditoriumType = async (audType) => {
        let type = await this.connection.then(() => Auditorium_type.findByPk(audType));
        if (type === null) {
            throw new Error("Auditorium type does not exist");
        }

        return await this.connection.then(() => Auditorium.findAll({
            where: { auditorium_type: audType },
            include: [{
                model: Auditorium_type,
                as: 'auditoriumType'
            }]
        }));
    }

    getAuditoriumsBetween10And60 = () => {
        return this.connection.then(() => Auditorium.scope("auditoriumsBetween10And60").findAll());
    }

    insertFaculties = (faculty, facultyName) => {
        return this.connection.then(() => Faculty.create({faculty: faculty, faculty_name: facultyName}));
    }

    insertPulpits = (pulpit, pulpitName, faculty) => {
        return this.connection.then(() => Pulpit.create({pulpit: pulpit, pulpit_name: pulpitName, faculty: faculty}));
    }

    insertSubjects = (subject, subjectName, pulpit) => {
        return this.connection.then(() => Subject.create({
            subject: subject,
            subject_name: subjectName,
            pulpit: pulpit
        }));
    }
    insertTeachers = (teacher, teacherName, pulpit) => {
        return this.connection.then(() => Teacher.create({
            teacher: teacher,
            teacher_name: teacherName,
            pulpit: pulpit
        }));
    }

    insertAuditoriumTypes = (audType, audTypeName) => {
        return this.connection.then(() => Auditorium_type.create({
            auditorium_type: audType,
            auditorium_typename: audTypeName
        }));
    }

    insertAuditoriums = (auditorium, audName, audCapacity, audType) => {
        return this.connection.then(() => Auditorium.create({
            auditorium: auditorium,
            auditorium_name: audName,
            auditorium_capacity: audCapacity,
            auditorium_type: audType
        }));
    }

    updateFaculties = async (faculty, facultyName) => {
        let fac = await this.connection.then(() => Faculty.findByPk(faculty));
        if (fac === null) {
            throw new Error("Faculty does not exist");
        }
        return this.connection.then(() =>
            Faculty.update({faculty_name: facultyName}, {where: {faculty: faculty}})
        );
    }

    updatePulpits = async (pulpit, pulpitName, faculty) => {
        let pulp = await this.connection.then(() => Pulpit.findByPk(pulpit));
        if (pulp === null) {
            throw new Error("Pulpit does not exist");
        }

        return this.connection.then(() =>
            Pulpit.update({pulpit_name: pulpitName, faculty: faculty}, {where: {pulpit: pulpit}})
        );
    }

    updateSubjects = async (subject, subjectName, pulpit) => {
        let subj = await this.connection.then(() => Subject.findByPk(subject));
        if (subj === null) {
            throw new Error("Subject does not exist");
        }
        return this.connection.then(() =>
            Subject.update({subject_name: subjectName, pulpit: pulpit}, {where: {subject: subject}}));
    }

    updateTeachers = async (teacher, teacherName, pulpit) => {
        let teach = await this.connection.then(() => Teacher.findByPk(teacher));
        if (teach === null) {
            throw new Error("Teacher does not exist");
        }
        return this.connection.then(() =>
            Teacher.update({teacher_name: teacherName, pulpit: pulpit}, {where: {teacher: teacher}}));
    }

    updateAuditoriumTypes = async (audType, audTypeName) => {
        let type = await this.connection.then(() => Auditorium_type.findByPk(audType));
        if (type === null) {
            throw new Error("Auditorium type does not exist");
        }

        return this.connection.then(() =>
            Auditorium_type.update({auditorium_typename: audTypeName}, {where: {auditorium_type: audType}}));
    }

    updateAuditoriums = async (auditorium, audName, audCapacity, audType) => {
        let aud = await this.connection.then(() => Auditorium.findByPk(auditorium));
        if (aud === null) {
            throw new Error("Auditorium does not exist");
        }
        return this.connection.then(() =>
            Auditorium.update({
                auditorium_name: audName,
                auditorium_capacity: audCapacity,
                auditorium_type: audType
            }, {where: {auditorium: auditorium}}));
    }

    deleteFaculty = async (faculty) => {
        let fac = await this.connection.then(() => Faculty.findByPk(faculty));
        if (fac === null) {
            throw new Error("Faculty does not exist");
        }
        return this.connection.then(() => Faculty.destroy({where: {faculty: faculty}}));
    }

    deletePulpit = async (pulpit) => {
        let pulp = await this.connection.then(() => Pulpit.findByPk(pulpit));
        if (pulp === null) {
            throw new Error("Pulpit does not exist");
        }
        return this.connection.then(() => Pulpit.destroy({where: {pulpit: pulpit}}));
    }

    deleteSubject = async (subject) => {
        let subj = await this.connection.then(() => Subject.findByPk(subject));
        if (subj === null) {
            throw new Error("Subject does not exist");
        }
        return this.connection.then(() => Subject.destroy({where: {subject: subject}}));
    }

    deleteTeacher = async (teacher) => {
        let teach = await this.connection.then(() => Teacher.findByPk(teacher));
        if (teach === null) {
            throw new Error("Teacher does not exist");
        }
        return this.connection.then(() => Teacher.destroy({where: {teacher: teacher}}));
    }

    deleteAuditoriumType = async (audType) => {
        let type = await this.connection.then(() => Auditorium_type.findByPk(audType));
        if (type === null) {
            throw new Error("Auditorium type does not exist");
        }
        return this.connection.then(() => Auditorium_type.destroy({where: {auditorium_type: audType}}));
    }

    deleteAuditorium = async (auditorium) => {
        let aud = await this.connection.then(() => Auditorium.findByPk(auditorium));
        if (aud === null) {
            throw new Error("Auditorium does not exist");
        }
        return this.connection.then(() => Auditorium.destroy({where: {auditorium: auditorium}}));
    }

    auditoriumsTransaction = async () => {
        const t = await sequelize.transaction({isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED});
        await Auditorium.update({auditorium_capacity: 0}, {
            where: {auditorium_capacity: {[Op.gte]: 0}},
            transaction: t
        });
        setTimeout(async () => {
            await t.rollback();
        }, 10000);
        return this.connection.then(() => Auditorium.findAll({transaction: t}));
    }
}

exports.DB = DB;