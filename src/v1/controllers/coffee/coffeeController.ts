import { Request, Response } from 'express'
import { pickRandomCoffee, findCoffeeByName } from '../../../types/coffee/types.js'

export function coffeeController(req: Request, res: Response) {
  const name = typeof req.query.name === 'string' ? req.query.name : undefined
  const recipe = name ? findCoffeeByName(name) : pickRandomCoffee()
  if (!recipe) {
    res.status(404).json({ error: `No recipe found matching "${name}"` })
    return
  }
  const totalMl = recipe.ingredients.reduce((sum, i) => sum + i.ml, 0)
  res.status(200).json({
    date: new Date().toISOString().slice(0, 10),
    name: recipe.name,
    total_ml: totalMl,
    ingredients: recipe.ingredients,
  })
}
