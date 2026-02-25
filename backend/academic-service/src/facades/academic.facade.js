const coursesService = require('../services/courses.service');

class AcademicFacade {
  static getCourses(user) {
    if (!user) {
      throw new Error('No autorizado');
    }
    return coursesService.getAll();
  }
}

module.exports = AcademicFacade;
