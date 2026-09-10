import { Request, Response } from 'express'
import { pickCurrentCoffee } from '../../../types/coffee/types.js'

export function coffeeController(_req: Request, res: Response) {
  const recipe = pickCurrentCoffee()
  const totalMl = recipe.ingredients.reduce((sum, i) => sum + i.ml, 0)
  res.status(200).json({
    date: new Date().toISOString().slice(0, 10),
    name: recipe.name,
    total_ml: totalMl,
    ingredients: recipe.ingredients,
  })
}
