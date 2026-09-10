export type CoffeeIngredient = { label: string; ml: number }
export type CoffeeRecipe = { name: string; ingredients: CoffeeIngredient[] }

export const COFFEE_RECIPES: CoffeeRecipe[] = [
  { name: 'Affogato', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Vanilla Ice Cream', ml: 60 }] },
  { name: 'Americano', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Hot Water', ml: 90 }] },
  { name: 'Flat White', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Steamed Milk', ml: 100 }] },
  { name: 'Cafe Con Leche', ingredients: [{ label: 'Brewed Coffee', ml: 180 }, { label: 'Scalded Milk', ml: 180 }] },
  { name: 'Corretto', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Brandy', ml: 60 }] },
  { name: 'Cappuccino', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Steamed Milk', ml: 60 }, { label: 'Foamed Milk', ml: 60 }] },
  { name: 'Cafe Bombón', ingredients: [{ label: 'Espresso', ml: 30 }, { label: 'Sweet Condensed Milk', ml: 30 }] },
  { name: 'Cafe Au Lait', ingredients: [{ label: 'French Pressed Coffee', ml: 150 }, { label: 'Steamed Milk', ml: 150 }] },
  { name: 'Cortado', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Steamed Milk (thin foam)', ml: 60 }] },
  { name: 'Cafe Latte', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Steamed Milk & Foam', ml: 300 }] },
  { name: 'Breve', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Steamed Half & Half', ml: 90 }] },
  { name: 'Cappuccino Fredo', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Steamed Milk, Ice & Whipped Cream', ml: 300 }] },
  {
    name: 'Caramel Frappe',
    ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Steamed Milk, Ice, Whipped Cream & Caramel Syrup', ml: 300 }],
  },
  {
    name: 'Irish Coffee',
    ingredients: [
      { label: 'Espresso', ml: 60 },
      { label: 'Irish Whiskey', ml: 30 },
      { label: 'Brown Sugar', ml: 15 },
      { label: 'Whipped Cream', ml: 30 },
    ],
  },
  { name: 'Mocha', ingredients: [{ label: 'Chocolate Syrup', ml: 60 }, { label: 'Espresso', ml: 60 }, { label: 'Steamed Milk & Whipped Cream', ml: 180 }] },
  { name: 'Lungo', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Hot Water', ml: 90 }] },
  { name: 'Doppio', ingredients: [{ label: 'Espresso', ml: 60 }] },
  { name: 'Macchiato', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Foamed Milk (dot)', ml: 10 }] },
  { name: 'Ristretto', ingredients: [{ label: 'Espresso', ml: 15 }] },
  { name: 'Dry Cappucino', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Foamed Milk', ml: 100 }] },
  { name: 'Espresso Con Panna', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Whipped Cream', ml: 90 }] },
  { name: 'Iced Coffee', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Ice', ml: 60 }] },
  { name: 'Romano', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Lemon', ml: 5 }] },
  { name: 'Vienna Coffee', ingredients: [{ label: 'Espresso', ml: 60 }, { label: 'Whipped Cream', ml: 60 }] },
  { name: 'Latte Macchiato', ingredients: [{ label: 'Steamed Milk', ml: 270 }, { label: 'Espresso', ml: 30 }, { label: 'Milk Foam', ml: 60 }] },
]

export function pickCurrentCoffee(date: Date = new Date()): CoffeeRecipe {
  const fifteenMinBuckets = Math.floor(date.getTime() / (15 * 60 * 1000))
  return COFFEE_RECIPES[fifteenMinBuckets % COFFEE_RECIPES.length]
}
