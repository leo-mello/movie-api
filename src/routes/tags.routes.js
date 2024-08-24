const { Router } = require('express');

const TagsController = require('../controllers/TagsController');

const tagsRoutes = Router();

// tagsRoutes.post("/:user_id", TagsController.index);

module.exports = tagsRoutes;