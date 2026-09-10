// Coffee-of-the-day preview scenarios.
import type { CoffeeRecipe } from '../../src/types/coffee/types.js'
import { COFFEE_RECIPES } from '../../src/types/coffee/types.js'

function byName(name: string): CoffeeRecipe {
  const recipe = COFFEE_RECIPES.find((r) => r.name === name)
  if (!recipe) throw new Error(`Unknown recipe: ${name}`)
  return recipe
}

export type Scenario = { title: string; recipe: CoffeeRecipe }
export const scenarios: Scenario[] = [
  { title: 'Two-layer (Affogato)', recipe: byName('Affogato') },
  { title: 'Equal thirds (Cappuccino)', recipe: byName('Cappuccino') },
  { title: 'Milk-dominant (Cafe Latte)', recipe: byName('Cafe Latte') },
  { title: 'Four ingredients (Irish Coffee)', recipe: byName('Irish Coffee') },
  { title: 'Corrected ratio (Mocha)', recipe: byName('Mocha') },
  { title: 'Single ingredient (Doppio)', recipe: byName('Doppio') },
]
