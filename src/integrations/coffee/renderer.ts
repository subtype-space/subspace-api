import type { MarkupVariant } from '../../types/trmnl/types.js'
import type { CoffeeRecipe } from '../../types/coffee/types.js'
import escapeHtml from 'escape-html'

// let TRMNL handle the e-ink coloring
const LAYER_COLORS: [RegExp, string][] = [
  [/espresso/i, '#2b1b12'],
  [/brewed coffee|french pressed|iced coffee/i, '#3a2418'],
  [/whipped cream/i, '#faf6ee'],
  [/foam/i, '#e9ddc8'],
  [/condensed milk/i, '#e8d9a8'],
  [/half & half|steamed milk|scalded milk/i, '#dcc9a8'],
  [/hot water/i, '#eeeeee'],
  [/\bice\b/i, '#dbe7ea'],
  [/whiskey|brandy/i, '#a9601a'],
  [/sugar/i, '#c9a35a'],
  [/chocolate|caramel/i, '#5a3420'],
  [/vanilla ice cream/i, '#fbf4e4'],
  [/lemon/i, '#e6d94f'],
]

function colorFor(label: string): string {
  for (const [re, color] of LAYER_COLORS) if (re.test(label)) return color
  return '#c7b299'
}

export function renderMarkup(recipe: CoffeeRecipe, variant: MarkupVariant): string {
  const titleSize = variant === 'full' ? '72px' : variant === 'half_vertical' ? '56px' : variant === 'quadrant' ? '32px' : '40px'
  const showIngredients = variant !== 'quadrant'
  const cupHeight = variant === 'half_horizontal' || variant === 'quadrant' ? '140px' : '260px'

  const layers = recipe.ingredients
    .map((i) => `<div class="layer" style="flex:${i.ml} 0 0; background:${colorFor(i.label)}"></div>`)
    .join('')

  const ingredientList = showIngredients
    ? `<ul class="ingredients">${recipe.ingredients
        .map((i) => `<li><span class="dot" style="background:${colorFor(i.label)}"></span>${escapeHtml(i.label)} — ${i.ml}ml</li>`)
        .join('')}</ul>`
    : ''

  return `
<style>
  .content-element { font-family: "Helvetica Neue", "Helvetica Now Text", Arial, sans-serif; }
  .coffee-layout { display:flex; align-items:center; gap:32px; height:100%; }
  .coffee-title { font-size:${titleSize}; font-weight:800; letter-spacing:-1px; margin:0 0 8px; text-transform:uppercase; }
  .cup { width:120px; height:${cupHeight}; border:4px solid #111; border-radius:0 0 18px 18px; overflow:hidden;
         display:flex; flex-direction:column-reverse; flex-shrink:0; }
  .layer { width:100%; }
  .ingredients { list-style:none; margin:0; padding:0; font-size:20px; line-height:1.6; }
  .ingredients li { display:flex; align-items:center; gap:8px; }
  .dot { width:14px; height:14px; border-radius:50%; border:2px solid #111; flex-shrink:0; }
</style>
<div class="content-element coffee-layout">
  <div class="cup">${layers}</div>
  <div>
    <h1 class="coffee-title">${escapeHtml(recipe.name)}</h1>
    ${ingredientList}
  </div>
</div>`.trim()
}
