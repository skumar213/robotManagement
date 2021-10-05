const router = require('express').Router();
const {
  models: { User },
} = require('../db');

/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

router.get('/unassigned', async (req, res, next) => {
  try {
    const studentNoMentor = await User.findUnassignedStudents();

    res.send(studentNoMentor);
  } catch (e) {
    next(e);
  }
});

router.get('/teachers', async (req, res, next) => {
  try {
    const teachers = await User.findTeachersAndMentees();
    res.send(teachers);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (isNaN(req.params.id)) {
      res.send(400);
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      res.sendStatus(404);
    } else {
      user.destroy();
      res.sendStatus(204);
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
