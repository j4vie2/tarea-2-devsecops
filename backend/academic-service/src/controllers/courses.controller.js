const AcademicFacade = require('../facades/academic.facade');

function getCourses(req, res) {
  try {
    const courses = AcademicFacade.getCourses(req.user);
    res.json(courses);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
}

module.exports = { getCourses };
