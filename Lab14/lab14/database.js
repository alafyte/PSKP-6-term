const {PrismaClient} = require('@prisma/client');

class DB {
    prisma = new PrismaClient();

    getFaculties = () => {
        return this.prisma.faculty.findMany();
    }
    getPulpits = () => {
        return this.prisma.pulpit.findMany({
            select: {
                PULPIT: true,
                PULPIT_NAME: true,
                FACULTY: true,
                _count: {
                    select: {TEACHER: true}
                }
            }
        });
    }
    getSubjects = () => {
        return this.prisma.subject.findMany();
    }
    getTeachers = () => {
        return this.prisma.teacher.findMany();
    }
    getAuditoriumsTypes = () => {
        return this.prisma.auditorium_type.findMany();
    }
    getAuditoriums = () => {
        return this.prisma.auditorium.findMany();
    }

    getSubjectsByFaculty = async (faculty) => {
        let fac = await this.prisma.faculty.findUnique({where: {FACULTY: faculty}});
        if (!fac)
            throw new Error('Faculty does not exist');
        return this.prisma.faculty.findMany({
            where: {FACULTY: faculty},
            select: {
                FACULTY: true,
                PULPIT: {
                    select: {
                        PULPIT: true,
                        SUBJECT: {select: {SUBJECT_NAME: true}}
                    }
                }
            }
        });
    }
    getAuditoriumsByAuditoriumType = async (audType) => {
        let aud = await this.prisma.auditorium_type.findUnique({where: {AUDITORIUM_TYPE: audType}});
        if (!aud)
            throw new Error('Auditorium type does not exist');
        return this.prisma.auditorium_type.findMany({
            where: {AUDITORIUM_TYPE: audType},
            select: {
                AUDITORIUM_TYPE: true,
                AUDITORIUM: {select: {AUDITORIUM: true}}
            }
        });
    }

    getComputerClassesFrom1 = () => {
        return this.prisma.auditorium.findMany({
            where: {
                AUDITORIUM_TYPE: {contains: 'ЛБ-К'},
                AUDITORIUM: {contains: '-1'}
            },
        })
    }

    getPulpitsWithoutTeachers = () => {
        return this.prisma.pulpit.findMany({
            where: {
                TEACHER: {none: {}}
            }
        });
    }

    getPulpitsWithVladimir = () => {
        return this.prisma.pulpit.findMany({
            where: {
                TEACHER: {
                    some: {TEACHER_NAME: {contains: 'Владимир'}}
                }
            }
        });
    }

    getAuditoriumsWithSameCount = () => {
        return this.prisma.auditorium.groupBy({
            by: ['AUDITORIUM_CAPACITY', 'AUDITORIUM_TYPE'],
            _count: {AUDITORIUM: true},
            having: {
                AUDITORIUM: {
                    _count: {gt: 1}
                }
            }
        });
    }
    insertFaculties = (faculty, facultyName) => {
        return this.prisma.faculty.create({
                data: {FACULTY: faculty, FACULTY_NAME: facultyName}
            }
        );
    }

    insertPulpits = (pulpit, pulpitName, faculty) => {
        return this.prisma.pulpit.create({
            data: {
                PULPIT: pulpit,
                PULPIT_NAME: pulpitName,
                FACULTY: faculty
            }
        });
    }

    insertSubjects = (subject, subjectName, pulpit) => {
        return this.prisma.subject.create({
            data: {
                SUBJECT: subject,
                SUBJECT_NAME: subjectName,
                PULPIT: pulpit
            }
        });
    }
    insertTeachers = (teacher, teacherName, pulpit) => {
        return this.prisma.teacher.create({
            data: {
                TEACHER: teacher,
                TEACHER_NAME: teacherName,
                PULPIT: pulpit
            }
        });
    }

    insertAuditoriumTypes = (audType, audTypeName) => {
        return this.prisma.auditorium_type.create({
            data: {
                AUDITORIUM_TYPE: audType,
                AUDITORIUM_TYPENAME: audTypeName
            }
        });
    }

    insertAuditoriums = (auditorium, audName, audCapacity, audType) => {
        return this.prisma.auditorium.create({
            data: {
                AUDITORIUM: auditorium,
                AUDITORIUM_NAME: audName,
                AUDITORIUM_CAPACITY: audCapacity,
                AUDITORIUM_TYPE: audType
            }
        });
    }

    updateFaculties = async (faculty, facultyName) => {
        let fac = await this.prisma.faculty.findUnique({where: {FACULTY: faculty}});
        if (!fac)
            throw new Error('Faculty does not exist');

        return this.prisma.faculty.update({
            where: {FACULTY: faculty},
            data: {FACULTY_NAME: facultyName}
        });
    }

    updatePulpits = async (pulpit, pulpitName, faculty) => {
        let pul = await this.prisma.pulpit.findUnique({where: {PULPIT: pulpit}});
        if (!pul)
            throw new Error('Pulpit does not exist');
        return this.prisma.pulpit.update({
            where: {PULPIT: pulpit},
            data: {PULPIT_NAME: pulpitName, FACULTY: faculty}
        });
    }

    updateSubjects = async (subject, subjectName, pulpit) => {
        let sub = await this.prisma.subject.findUnique({where: {SUBJECT: subject}});
        if (!sub)
            throw new Error('Subject does not exist');
        return this.prisma.subject.update({
            where: {SUBJECT: subject},
            data: {SUBJECT_NAME: subjectName, PULPIT: pulpit},
        });
    }

    updateTeachers = async (teacher, teacherName, pulpit) => {
        let tec = await this.prisma.teacher.findUnique({where: {TEACHER: teacher}});
        if (!tec)
            throw new Error('Teacher does not exist');
        return this.prisma.teacher.update({
            where: {TEACHER: teacher},
            data: {TEACHER_NAME: teacherName, PULPIT: pulpit}
        });
    }

    updateAuditoriumTypes = async (audType, audTypeName) => {
        let aud = await this.prisma.auditorium_type.findUnique({where: {AUDITORIUM_TYPE: audType}});
        if (!aud)
            throw new Error('Auditorium type does not exist');

        return this.prisma.auditorium_type.update({
            where: {AUDITORIUM_TYPE: audType},
            data: {AUDITORIUM_TYPENAME: audTypeName}
        });
    }

    updateAuditoriums = async (auditorium, audName, audCapacity, audType) => {
        let aud = await this.prisma.auditorium.findUnique({where: {AUDITORIUM: auditorium}});
        if (!aud)
            throw new Error('Auditorium does not exist');

        return this.prisma.auditorium.update({
            where: {AUDITORIUM: auditorium},
            data: {
                AUDITORIUM_NAME: audName,
                AUDITORIUM_CAPACITY: audCapacity,
                AUDITORIUM_TYPE: audType
            }
        });
    }

    deleteFaculty = async (faculty) => {
        let fac = await this.prisma.faculty.findUnique({where: {FACULTY: faculty}});
        if (!fac)
            throw new Error('Faculty does not exist');

        return this.prisma.faculty.delete({where: {FACULTY: faculty}});
    }

    deletePulpit = async (pulpit) => {
        let pul = await this.prisma.pulpit.findUnique({where: {PULPIT: pulpit}});
        if (!pul)
            throw new Error('Pulpit does not exist');
        return this.prisma.pulpit.delete({where: {PULPIT: pulpit}});
    }

    deleteSubject = async (subject) => {
        let sub = await this.prisma.subject.findUnique({where: {SUBJECT: subject}});
        if (!sub)
            throw new Error('Subject does not exist');
        return this.prisma.subject.delete({where: {SUBJECT: subject}});
    }

    deleteTeacher = async (teacher) => {
        let tec = await this.prisma.teacher.findUnique({where: {TEACHER: teacher}});
        if (!tec)
            throw new Error('Teacher does not exist');
        return this.prisma.teacher.delete({where: {TEACHER: teacher}});
    }

    deleteAuditoriumType = async (audType) => {
        let aud = await this.prisma.auditorium_type.findUnique({where: {AUDITORIUM_TYPE: audType}});
        if (!aud)
            throw new Error('Auditorium type does not exist');

        return this.prisma.auditorium_type.delete({where: {AUDITORIUM_TYPE: audType}});
    }

    deleteAuditorium = async (auditorium) => {
        let aud = await this.prisma.auditorium.findUnique({where: {AUDITORIUM: auditorium}});
        if (!aud)
            throw new Error('Auditorium does not exist');

        return this.prisma.auditorium.delete({where: {AUDITORIUM: auditorium}});
    }

    getPulpitsByFacultyFluentAPI = async (faculty) => {
        return this.prisma.faculty.findUnique({
            where: {FACULTY: faculty}
        }).PULPIT();
    }

    transaction = async () => {
        await this.prisma.$transaction(async prisma => {
            await prisma.auditorium.updateMany({
                data: {
                    AUDITORIUM_CAPACITY: {
                        increment: 100
                    }
                }
            });
            throw new Error('Transaction rollback');
        });
    }
}

exports.DB = DB;