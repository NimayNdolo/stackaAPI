const express = require('express')
const passport = require('passport')
const Recipe = require('../models/Recipe')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// GET(INDEX)
router.get('/recipes', requireToken, (req, res, next) => {
  const id = req.user.id
  Recipe.find({ owner: id })
    .then(recipes => {
      return recipes.map(recipe => recipe.toObject())
    })
    .then(recipe => res.status(200).json({ recipe: recipe }))
    .catch(next)
})

// GET(SHOW)
router.get('/recipes/show', requireToken, (req, res, next) => {
  const title = req.body.recipe.title
  Recipe.findOne({ title: title })
    .then(handle404)
    .then(recipe => res.status(200).json({ recipe: recipe.toObject() }))
    .catch(next)
})

// POST(CREATE)
router.post('/recipes', requireToken, (req, res, next) => {
  const recipe = req.body.recipe
  recipe.owner = req.user.id
  Recipe.create(req.body.recipe)
    .then(recipe => {
      res.status(201).json({ recipe })
    })
    .catch(next)
})

// PATCH(UPDATE)
router.patch('/recipes/:id', requireToken, removeBlanks, (req, res, next) => {
  const id = req.params.id
  delete req.body.recipe.owner

  Recipe.findOneAndUpdate({ _id: id }, req.body.recipe, { new: true })
    .then(handle404)
    .then(recipe => {
      return requireOwnership(req, recipe)
    })
    .then(recipe => res.status(201).json({ recipe: recipe.toObject() }))
    .catch(next)
})

// DELETE(DESTROY)
router.delete('/recipes/:id', requireToken, (req, res, next) => {
  Recipe.findById(req.params.id)
    .then(handle404)
    .then(recipe => {
      requireOwnership(req, recipe)
      recipe.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
