'use strict';
window.MenuDomain = (() => {
  const C = window.MenuCatalog;
  const portions = { small: 0.75, regular: 1, large: 1.5 };
  const empty = () => ({
    cuisine: '', category: '', dishId: '', portion: 'regular', quantities: {}, substitution: '',
    extras: [], bread: 'Keep bread', cheese: 'Keep cheese', cooking: 'Kitchen default',
    spice: 'Mild', side: '', combo: false, beverage: '', size: 'Medium', ice: 'Regular',
    dessert: '', dessertPortion: 1, topping: 'None',
  });
  const dishFor = order => C.dishes.find(d => d.id === order.dishId);
  const substitutions = dish => {
    const primary = dish?.ingredients.find(i => i.id.startsWith('protein-'));
    return primary ? [C.pantry.tofu, C.pantry.chicken].filter(i => i.id !== primary.id) : [];
  };
  const isBread = item => item.id.startsWith('bread-') || item.id === 'bread';
  const isCheese = item => item.id === 'cheese' || item.id === 'cheese-feta';
  function resolve(input) {
    const order = { ...input, quantities: { ...input.quantities }, extras: [...input.extras] };
    const dish = dishFor(order);
    const conflicts = [];
    if (!dish) return { order, conflicts };
    order.quantities = Object.fromEntries(dish.ingredients.map(i =>
      [i.id, C.quantities.includes(order.quantities[i.id]) ? order.quantities[i.id] : 1]));
    if (!substitutions(dish).some(i => i.id === order.substitution)) order.substitution = '';
    order.extras = [...new Set(order.extras)].filter(id => C.extras.some(i => i.id === id));
    if (order.bread === 'No bread' && dish.ingredients.some(i => isBread(i) && order.quantities[i.id] > 0)) {
      dish.ingredients.filter(isBread).forEach(i => { order.quantities[i.id] = 0; });
      conflicts.push({ id: 'bread-choice', stage: 'ingredients', message: 'No bread removed bread quantities. Other ingredients are preserved. Restore Keep bread and a quantity to recover.' });
    }
    if (order.cheese === 'No cheese' && (dish.ingredients.some(i => isCheese(i) && order.quantities[i.id] > 0) || order.extras.includes('extra-cheese'))) {
      dish.ingredients.filter(isCheese).forEach(i => { order.quantities[i.id] = 0; });
      order.extras = order.extras.filter(id => id !== 'extra-cheese');
      conflicts.push({ id: 'cheese-choice', stage: 'ingredients', message: 'No cheese removed cheese ingredients and extras. Dairy cream and yogurt are not cheese and remain. Restore Keep cheese and quantities to recover.' });
    }
    const blocked = order.substitution === 'protein-tofu' ? 'extra-chicken' : order.substitution === 'protein-chicken' ? 'extra-tofu' : '';
    if (blocked && order.extras.includes(blocked)) {
      order.extras = order.extras.filter(id => id !== blocked);
      conflicts.push({ id: 'substitution-extras', stage: 'extras', message: 'Protein substitution removed an incompatible extra. Choose another extra or restore the original protein.' });
    }
    if (order.combo && order.side !== 'fries') {
      order.side = 'fries';
      conflicts.push({ id: 'combo-side', stage: 'sides', message: 'Combo replaced your side with fries. Turn combo off to choose a different side.' });
    }
    return { order, conflicts };
  }
  function calculate(input) {
    const { order } = resolve(input);
    const dish = dishFor(order);
    if (!dish) return { price: 0, calories: 0, priceDelta: 0, calorieDelta: 0 };
    let price = dish.price;
    let calories = dish.calories;
    for (const i of dish.ingredients) {
      price += (order.quantities[i.id] - 1) * i.price;
      calories += (order.quantities[i.id] - 1) * i.calories;
    }
    const primary = dish.ingredients.find(i => i.id.startsWith('protein-'));
    const sub = substitutions(dish).find(i => i.id === order.substitution);
    if (primary && sub) {
      price += (sub.price - primary.price) * order.quantities[primary.id];
      calories += (sub.calories - primary.calories) * order.quantities[primary.id];
    }
    for (const extra of C.extras.filter(i => order.extras.includes(i.id))) {
      price += extra.price;
      calories += extra.calories;
    }
    const multiplier = portions[order.portion] || 1;
    price = Math.max(0, price) * multiplier;
    calories = Math.max(0, calories) * multiplier;
    const priceDelta = Math.round((price - dish.price) * 100) / 100;
    const calorieDelta = Math.round(calories) - dish.calories;
    const side = C.sides.find(i => i.id === order.side);
    if (side) { price += side.price; calories += side.calories; }
    const drink = C.beverages.find(i => i.id === order.beverage);
    if (drink) {
      const size = { Small: 0, Medium: 1, Large: 2 }[order.size] ?? 1;
      price += drink.price + size * 0.65;
      calories += drink.calories ? drink.calories * (1 + size * 0.4) : size;
    }
    const dessert = C.desserts.find(i => i.id === order.dessert);
    if (dessert) {
      const portion = [0.5, 1, 1.5].includes(order.dessertPortion) ? order.dessertPortion : 1;
      price += (dessert.price + (order.topping === 'Chocolate sauce' ? 0.75 : 0)) * portion;
      calories += (dessert.calories + (order.topping === 'Chocolate sauce' ? 60 : 0)) * portion;
    }
    return { price: Math.round(price * 100) / 100, calories: Math.round(calories), priceDelta, calorieDelta };
  }
  function change(input, key, value) {
    let order = { ...input, quantities: { ...input.quantities }, extras: [...input.extras] };
    const changed = order[key] !== value;
    order[key] = value;
    if (changed && key === 'cuisine') order = { ...empty(), cuisine: value };
    if (changed && key === 'category') order = { ...empty(), cuisine: input.cuisine, category: value };
    if (changed && key === 'dishId') {
      order = { ...empty(), cuisine: input.cuisine, category: input.category, dishId: value };
    }
    if (changed && key === 'beverage') { order.size = 'Medium'; order.ice = 'Regular'; }
    if (changed && key === 'dessert') { order.dessertPortion = 1; order.topping = 'None'; }
    if (changed && key === 'combo' && !value && input.combo) order.side = '';
    return resolve(order);
  }
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  return { empty, dishFor, substitutions, resolve, calculate, change, money };
})();
