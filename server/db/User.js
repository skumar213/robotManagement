const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  userType: {
    type: Sequelize.ENUM('STUDENT', 'TEACHER'),
    defaultValue: 'STUDENT',
    allowNull: false,
  },
  isStudent: {
    type: Sequelize.DataTypes.VIRTUAL,
    get() {
      return this.userType === 'STUDENT' ? true : false;
    },
  },
  isTeacher: {
    type: Sequelize.DataTypes.VIRTUAL,
    get() {
      return this.userType === 'TEACHER' ? true : false;
    },
  },
});

//class methods
User.findUnassignedStudents = function () {
  const studentNoMentor = User.findAll({
    where: {
      userType: 'STUDENT',
      mentorId: null,
    },
  });

  return studentNoMentor;
};

User.findTeachersAndMentees = function () {
  const teachers = User.findAll({
    where: {
      userType: 'TEACHER',
    },
    include: {
      model: User,
      as: 'mentees',
    },
  });

  return teachers;
};

//instance methods
User.prototype.getPeers = function () {
  const mentorsStudents = User.findAll({
    where: {
      mentorId: this.mentorId,
      id: {
        [Op.ne]: this.id,
      },
    },
  });

  return mentorsStudents;
};

//hooks

User.beforeUpdate(async (user) => {
  const mentor = await User.findByPk(user.mentorId);

  if (
    user.dataValues.mentorId !== user._previousDataValues.mentorId &&
    !mentor.isTeacher
  ) {
    throw new Error(
      `We shouldn't be able to update ${user.name} with ${mentor.name} as a mentor, because ${mentor.name} is not a TEACHER`
    );
  } else if (
    user.dataValues.userType !== user._previousDataValues.userType &&
    user.mentorId !== null
  ) {
    throw new Error(
      `We shouldn't be able to update ${user.name} to a TEACHER, because ${mentor.name} is their mentor`
    );
  } else if (user.dataValues.userType !== user._previousDataValues.userType) {
    const allMentors = await User.findAll({
      where: {
        mentorId: {
          [Op.ne]: null,
        },
      },
    });

    const mentorIds = allMentors.map((obj) => obj.mentorId);

    if (mentorIds.includes(user.id)) {
      const student = await User.findOne({
        where: {
          mentorId: user.id,
        },
      });

      throw new Error(
        `We shouldn't be able to update ${user.name} to a STUDENT, because ${student.name} is their mentee`
      );
    }
  }
});

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
