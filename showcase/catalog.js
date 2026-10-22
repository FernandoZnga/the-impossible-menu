/* Separately maintained browser-native mock catalog; prices are dollars, not cents. */
'use strict';
window.MenuCatalog = (() => {
  const quantities = [0, 0.5, 1, 1.5, 2, 3];
  const ingredient = (id, name, price, calories, allergens = []) =>
    ({ id, name, price, calories, allergens, quantities });
  const pantry = {
    chicken: ingredient('protein-chicken', 'Chicken', 3.5, 185),
    beef: ingredient('protein-beef', 'Beef', 4.5, 240),
    pork: ingredient('protein-pork', 'Pork', 3.8, 230),
    duck: ingredient('protein-duck', 'Duck', 5, 260),
    lamb: ingredient('protein-lamb', 'Lamb', 5, 250),
    salmon: ingredient('protein-salmon', 'Salmon', 5, 205, ['Fish']),
    tuna: ingredient('protein-tuna', 'Tuna', 5, 160, ['Fish']),
    whitefish: ingredient('protein-whitefish', 'White fish', 4.5, 150, ['Fish']),
    shrimp: ingredient('protein-shrimp', 'Shrimp', 4.5, 100, ['Shellfish']),
    mussels: ingredient('protein-mussels', 'Mussels', 4.5, 110, ['Shellfish']),
    conch: ingredient('protein-conch', 'Conch', 5, 130, ['Shellfish']),
    tofu: ingredient('protein-tofu', 'Tofu', 2.5, 120, ['Soy']),
    beans: ingredient('beans', 'Beans', 1.2, 125),
    chickpeas: ingredient('chickpeas', 'Chickpeas', 1.4, 140),
    lentils: ingredient('lentils', 'Lentils', 1.3, 130),
    rice: ingredient('rice', 'Rice', 1.5, 200),
    pasta: ingredient('pasta', 'Pasta', 1.8, 230, ['Wheat']),
    noodles: ingredient('noodles', 'Wheat noodles', 1.8, 210, ['Wheat']),
    riceNoodles: ingredient('rice-noodles', 'Rice noodles', 1.8, 190),
    glassNoodles: ingredient('glass-noodles', 'Sweet potato glass noodles', 1.8, 190),
    flour: ingredient('flour', 'Wheat flour', 0.6, 110, ['Wheat']),
    breadcrumbs: ingredient('breadcrumbs', 'Golden breadcrumbs', 0.7, 110, ['Wheat']),
    flourTortilla: ingredient('bread-flour-tortilla', 'Flour tortilla', 1.4, 190, ['Wheat']),
    hominy: ingredient('hominy', 'Hominy corn', 1.2, 120),
    cornMasa: ingredient('corn-masa', 'Corn masa', 1.4, 210),
    cassava: ingredient('cassava', 'Cassava', 1.4, 180),
    plantain: ingredient('plantain', 'Plantain', 1.5, 190),
    bulgur: ingredient('bulgur', 'Bulgur wheat', 1.3, 150, ['Wheat']),
    almond: ingredient('almond', 'Toasted almonds', 0.9, 80, ['Tree nuts']),
    pineNut: ingredient('pine-nut', 'Toasted pine nuts', 1, 80, ['Tree nuts']),
    bread: ingredient('bread', 'Bread', 1.5, 180, ['Wheat']),
    bun: ingredient('bread-bun', 'Brioche bun', 1.7, 210, ['Wheat', 'Milk', 'Egg']),
    pita: ingredient('bread-pita', 'Pita bread', 1.4, 170, ['Wheat']),
    tortilla: ingredient('bread-tortilla', 'Corn tortillas', 1.2, 130),
    dough: ingredient('bread-dough', 'Pizza dough', 2, 280, ['Wheat']),
    pastry: ingredient('pastry', 'Butter pastry', 2, 250, ['Wheat', 'Milk']),
    cheese: ingredient('cheese', 'Cheese', 1.2, 110, ['Milk']),
    feta: ingredient('cheese-feta', 'Feta', 1.3, 95, ['Milk']),
    cream: ingredient('cream', 'Cream', 1, 100, ['Milk']),
    yogurt: ingredient('yogurt', 'Yogurt', 0.8, 65, ['Milk']),
    egg: ingredient('egg', 'Egg', 1, 75, ['Egg']),
    potato: ingredient('potato', 'Potatoes', 1.3, 160),
    tomato: ingredient('tomato', 'Tomatoes', 0.8, 25),
    greens: ingredient('greens', 'Leafy greens', 0.8, 15),
    cabbage: ingredient('cabbage', 'Cabbage', 0.7, 25),
    mushroom: ingredient('mushroom', 'Mushrooms', 1.2, 30),
    onion: ingredient('onion', 'Onion', 0.5, 30),
    pepper: ingredient('pepper', 'Sweet peppers', 0.7, 25),
    eggplant: ingredient('eggplant', 'Eggplant', 1.1, 45),
    zucchini: ingredient('zucchini', 'Zucchini', 0.9, 30),
    broccoli: ingredient('broccoli', 'Broccoli', 0.9, 35),
    cauliflower: ingredient('cauliflower', 'Cauliflower', 0.9, 30),
    pineapple: ingredient('pineapple', 'Pineapple', 0.8, 50),
    avocado: ingredient('avocado', 'Avocado', 1.8, 120),
    cucumber: ingredient('cucumber', 'Cucumber', 0.6, 15),
    carrot: ingredient('carrot', 'Carrot', 0.6, 30),
    herbs: ingredient('herbs', 'Fresh herbs', 0.4, 5),
    basil: ingredient('basil', 'Basil', 0.4, 5),
    coconut: ingredient('coconut', 'Coconut milk', 1.2, 140),
    peanut: ingredient('peanut', 'Roasted peanuts', 0.8, 85, ['Peanut']),
    sesame: ingredient('sesame', 'Sesame', 0.6, 50, ['Sesame']),
    soy: ingredient('soy-sauce', 'Soy sauce', 0.4, 15, ['Soy', 'Wheat']),
    fishSauce: ingredient('fish-sauce', 'Fish sauce', 0.4, 10, ['Fish']),
    kimchi: ingredient('kimchi', 'Traditional kimchi', 0.9, 25, ['Fish']),
    olive: ingredient('olive', 'Olives', 0.8, 50),
  };
  // Compact hand-authored recipe records: name, base price, kcal, pantry keys.
  // Descriptions below intentionally summarize ingredients, not original recipe prose.
  const recipes = {
    American: [
      ['Classic Cheeseburger', 13.5, 720, ['beef', 'bun', 'cheese', 'greens', 'tomato']],
      ['Southern Fried Chicken', 15, 810, ['chicken', 'flour', 'potato', 'cabbage', 'cream']],
      ['Smoky Pulled Pork Sandwich', 13, 690, ['pork', 'bun', 'cabbage', 'onion']],
      ['New England Fish Chowder', 14, 540, ['whitefish', 'potato', 'cream', 'onion']],
      ['Cajun Shrimp Rice', 16, 610, ['shrimp', 'rice', 'pepper', 'onion']],
      ['Macaroni and Cheese', 11.5, 780, ['pasta', 'cheese', 'cream']],
      ['California Chicken Club', 14, 650, ['chicken', 'bread', 'avocado', 'tomato', 'greens']],
      ['Mushroom Veggie Burger', 12.5, 570, ['beans', 'mushroom', 'bread', 'greens', 'tomato']],
      ['Texas Beef Chili', 13, 590, ['beef', 'beans', 'tomato', 'pepper']],
      ['Pacific Salmon Plate', 19, 620, ['salmon', 'potato', 'greens', 'herbs']],
    ],
    Mexican: [
      ['Carne Asada Tacos', 14, 610, ['beef', 'tortilla', 'onion', 'herbs']],
      ['Chicken Enchiladas', 15, 740, ['chicken', 'tortilla', 'tomato', 'cheese']],
      ['Bean and Rice Burrito', 12, 690, ['beans', 'flourTortilla', 'rice', 'pepper', 'avocado']],
      ['Pork Carnitas Bowl', 15, 730, ['pork', 'rice', 'beans', 'tomato']],
      ['Shrimp Tostadas', 16, 560, ['shrimp', 'tortilla', 'avocado', 'cabbage']],
      ['Cheese Quesadilla', 10.5, 590, ['tortilla', 'cheese', 'pepper']],
      ['Chicken Fajitas', 16, 660, ['chicken', 'tortilla', 'pepper', 'onion']],
      ['Chilaquiles Rojos', 12, 620, ['tortilla', 'tomato', 'egg', 'cheese']],
      ['Vegetable Pozole', 12, 470, ['hominy', 'beans', 'cabbage', 'herbs']],
      ['Tacos al Pastor', 14, 630, ['pork', 'tortilla', 'pineapple', 'onion', 'herbs']],
    ],
    Italian: [
      ['Pizza Margherita', 13, 760, ['dough', 'tomato', 'cheese', 'basil']],
      ['Spaghetti Bolognese', 15, 740, ['beef', 'pasta', 'tomato', 'onion', 'cheese']],
      ['Penne Arrabbiata', 12, 560, ['pasta', 'tomato', 'herbs']],
      ['Mushroom Risotto', 15, 660, ['rice', 'mushroom', 'cheese', 'onion']],
      ['Chicken Parmigiana', 17, 820, ['chicken', 'breadcrumbs', 'egg', 'pasta', 'tomato', 'cheese']],
      ['Eggplant Parmigiana', 14, 580, ['eggplant', 'tomato', 'cheese', 'basil']],
      ['Seafood Linguine', 20, 680, ['shrimp', 'mussels', 'pasta', 'tomato']],
      ['Lasagne al Forno', 16, 850, ['beef', 'pasta', 'tomato', 'cheese', 'cream']],
      ['Tuscan White Bean Stew', 12, 430, ['beans', 'tomato', 'greens', 'herbs']],
      ['Pesto Chicken Pasta', 16, 770, ['chicken', 'pasta', 'basil', 'cream', 'cheese']],
    ],
    Japanese: [
      ['Chicken Teriyaki Don', 14.5, 650, ['chicken', 'rice', 'soy', 'cucumber']],
      ['Salmon Sushi Bowl', 18, 610, ['salmon', 'rice', 'avocado', 'cucumber', 'sesame']],
      ['Tonkatsu Curry', 17, 840, ['pork', 'breadcrumbs', 'egg', 'rice', 'potato', 'carrot']],
      ['Miso Tofu Ramen', 14, 570, ['tofu', 'noodles', 'mushroom', 'soy']],
      ['Beef Gyudon', 15, 680, ['beef', 'rice', 'onion', 'soy']],
      ['Shrimp Tempura Udon', 17, 720, ['shrimp', 'flour', 'egg', 'noodles', 'soy', 'onion']],
      ['Vegetable Yakisoba', 12.5, 550, ['noodles', 'cabbage', 'carrot', 'mushroom', 'soy']],
      ['Chicken Katsu Sando', 13, 690, ['chicken', 'breadcrumbs', 'egg', 'bread', 'cabbage']],
      ['Tuna Poke Don', 19, 630, ['tuna', 'rice', 'sesame', 'avocado', 'cucumber']],
      ['Okonomiyaki', 13, 580, ['cabbage', 'egg', 'flour', 'soy']],
    ],
    Chinese: [
      ['Kung Pao Chicken', 15, 690, ['chicken', 'rice', 'pepper', 'peanut', 'soy']],
      ['Mapo Tofu', 14, 620, ['tofu', 'pork', 'rice', 'soy']],
      ['Beef and Broccoli Rice', 16, 670, ['beef', 'rice', 'broccoli', 'soy']],
      ['Sweet and Sour Pork', 15, 780, ['pork', 'flour', 'rice', 'pepper', 'tomato']],
      ['Yangzhou Fried Rice', 14, 710, ['shrimp', 'pork', 'rice', 'egg', 'carrot']],
      ['Dan Dan Noodles', 14.5, 730, ['pork', 'noodles', 'sesame', 'soy']],
      ['Mushroom Chow Mein', 12.5, 570, ['noodles', 'mushroom', 'cabbage', 'soy']],
      ['Ginger Scallion Fish', 18, 510, ['whitefish', 'rice', 'herbs', 'soy']],
      ['Peking Duck Wraps', 21, 760, ['duck', 'bread', 'cucumber', 'soy']],
      ['Sichuan Eggplant', 13, 560, ['eggplant', 'rice', 'pepper', 'soy']],
    ],
    Korean: [
      ['Beef Bibimbap', 16, 730, ['beef', 'rice', 'carrot', 'greens', 'egg', 'sesame']],
      ['Bulgogi Bowl', 17, 720, ['beef', 'rice', 'onion', 'soy', 'sesame']],
      ['Kimchi Fried Rice', 13, 610, ['kimchi', 'rice', 'egg', 'sesame']],
      ['Tofu Japchae', 14, 570, ['tofu', 'glassNoodles', 'mushroom', 'carrot', 'soy']],
      ['Dakgalbi Chicken', 16, 760, ['chicken', 'cabbage', 'potato', 'rice']],
      ['Pork Bossam Wraps', 18, 640, ['pork', 'cabbage', 'kimchi', 'rice']],
      ['Sundubu Jjigae', 15, 580, ['tofu', 'shrimp', 'egg', 'rice']],
      ['Korean Fried Chicken', 17, 830, ['chicken', 'flour', 'soy', 'cabbage', 'rice']],
      ['Doenjang Tofu Stew', 13, 490, ['tofu', 'zucchini', 'mushroom', 'rice', 'soy']],
      ['Spicy Pork Rice Bowl', 16, 750, ['pork', 'rice', 'onion', 'pepper', 'sesame']],
    ],
    Indian: [
      ['Butter Chicken', 16, 780, ['chicken', 'rice', 'tomato', 'cream']],
      ['Chana Masala', 12, 560, ['chickpeas', 'rice', 'tomato', 'onion']],
      ['Palak Paneer', 14, 650, ['cheese', 'greens', 'rice', 'cream']],
      ['Lamb Rogan Josh', 19, 750, ['lamb', 'rice', 'tomato', 'yogurt']],
      ['Vegetable Biryani', 13, 590, ['rice', 'potato', 'carrot', 'herbs']],
      ['Chicken Tikka Masala', 16.5, 760, ['chicken', 'rice', 'tomato', 'cream']],
      ['Dal Tadka', 11.5, 520, ['lentils', 'rice', 'onion', 'tomato']],
      ['Goan Fish Curry', 18, 640, ['whitefish', 'rice', 'coconut', 'tomato']],
      ['Aloo Gobi', 12, 530, ['potato', 'cauliflower', 'tomato', 'rice']],
      ['Keema Naan Plate', 15, 710, ['beef', 'bread', 'onion', 'yogurt']],
    ],
    Thai: [
      ['Chicken Pad Thai', 15, 740, ['chicken', 'riceNoodles', 'egg', 'peanut', 'fishSauce']],
      ['Green Tofu Curry', 14, 680, ['tofu', 'rice', 'eggplant', 'coconut', 'basil']],
      ['Red Shrimp Curry', 17, 710, ['shrimp', 'rice', 'pepper', 'coconut', 'fishSauce']],
      ['Pad Kra Pao Beef', 16, 730, ['beef', 'rice', 'basil', 'egg', 'soy']],
      ['Tom Kha Chicken', 14, 520, ['chicken', 'coconut', 'mushroom', 'herbs', 'fishSauce']],
      ['Pineapple Fried Rice', 16, 700, ['shrimp', 'rice', 'pineapple', 'egg', 'peanut']],
      ['Pad See Ew', 15, 710, ['chicken', 'riceNoodles', 'greens', 'soy']],
      ['Massaman Beef Curry', 18, 820, ['beef', 'potato', 'rice', 'coconut', 'peanut']],
      ['Larb Chicken Salad', 14, 490, ['chicken', 'cabbage', 'herbs', 'rice', 'fishSauce']],
      ['Thai Basil Eggplant', 13, 540, ['tofu', 'eggplant', 'rice', 'basil', 'soy']],
    ],
    Mediterranean: [
      ['Chicken Souvlaki', 15, 640, ['chicken', 'pita', 'tomato', 'yogurt']],
      ['Lamb Gyro', 16, 760, ['lamb', 'pita', 'onion', 'tomato', 'yogurt']],
      ['Moussaka', 18, 830, ['lamb', 'eggplant', 'potato', 'cheese', 'cream']],
      ['Spanakopita', 12, 590, ['pastry', 'greens', 'feta', 'herbs']],
      ['Horiatiki Salad', 12, 390, ['tomato', 'cucumber', 'olive', 'feta', 'onion']],
      ['Shrimp Saganaki', 18, 510, ['shrimp', 'tomato', 'feta', 'herbs']],
      ['Gemista', 13, 470, ['pepper', 'rice', 'tomato', 'herbs']],
      ['Pastitsio', 17, 820, ['beef', 'pasta', 'tomato', 'cream', 'cheese']],
      ['Fasolada', 11, 410, ['beans', 'carrot', 'tomato', 'herbs']],
      ['Lemon Chicken Rice', 15.5, 620, ['chicken', 'rice', 'cucumber', 'herbs']],
    ],
    'Honduran / Central American': [
      ['Baleada Sencilla', 9, 580, ['flourTortilla', 'beans', 'cheese', 'cream']],
      ['Baleada con Huevo', 11, 710, ['flourTortilla', 'beans', 'egg', 'cheese', 'avocado']],
      ['Pollo con Tajadas', 16, 810, ['chicken', 'flour', 'plantain', 'cabbage', 'tomato']],
      ['Carne Asada Catracha', 18, 790, ['beef', 'beans', 'rice', 'tortilla', 'cabbage']],
      ['Sopa de Caracol', 20, 670, ['conch', 'coconut', 'cassava', 'plantain', 'herbs']],
      ['Yuca con Chicharrón', 15, 740, ['pork', 'cassava', 'cabbage', 'tomato']],
      ['Honduran Enchiladas', 13, 680, ['beef', 'tortilla', 'cabbage', 'tomato', 'egg']],
      ['Pupusas Revueltas', 12, 690, ['cornMasa', 'pork', 'beans', 'cheese', 'cabbage']],
      ['Gallo Pinto Plate', 12, 650, ['rice', 'beans', 'pepper', 'egg', 'plantain']],
      ['Nacatamal Hondureño', 14, 760, ['cornMasa', 'pork', 'rice', 'potato', 'tomato']],
    ],
    French: [
      ['Coq au Vin', 19, 720, ['chicken', 'mushroom', 'onion', 'potato']],
      ['Beef Bourguignon', 22, 790, ['beef', 'mushroom', 'carrot', 'potato']],
      ['Ratatouille', 13, 350, ['eggplant', 'zucchini', 'pepper', 'tomato', 'herbs']],
      ['Croque Monsieur', 14, 750, ['pork', 'bread', 'cheese', 'cream']],
      ['Quiche Lorraine', 13.5, 680, ['pastry', 'egg', 'pork', 'cream']],
      ['Salmon en Papillote', 21, 570, ['salmon', 'zucchini', 'tomato', 'herbs']],
      ['French Onion Soup', 11, 460, ['onion', 'bread', 'cheese']],
      ['Moules Marinières', 20, 590, ['mussels', 'onion', 'cream', 'bread', 'herbs']],
      ['Duck Confit', 24, 860, ['duck', 'potato', 'greens']],
      ['Niçoise Salad', 17, 560, ['tuna', 'egg', 'olive', 'potato', 'greens']],
    ],
    'Middle Eastern': [
      ['Chicken Shawarma Plate', 16, 720, ['chicken', 'pita', 'tomato', 'cucumber', 'sesame']],
      ['Beef Kofta Kebab', 17, 730, ['beef', 'herbs', 'rice', 'tomato', 'yogurt']],
      ['Falafel Pita', 12, 610, ['chickpeas', 'pita', 'herbs', 'cucumber', 'tomato', 'sesame']],
      ['Hummus with Warm Pita', 11, 570, ['chickpeas', 'sesame', 'pita', 'cucumber', 'tomato']],
      ['Mujadara', 12, 530, ['lentils', 'rice', 'onion', 'herbs']],
      ['Shakshuka', 13, 560, ['egg', 'tomato', 'pepper', 'onion', 'bread']],
      ['Lamb Kabsa', 20, 810, ['lamb', 'rice', 'tomato', 'almond', 'onion']],
      ['Fattoush Salad', 11, 390, ['pita', 'tomato', 'cucumber', 'greens', 'herbs']],
      ['Baked Kibbeh', 16, 690, ['bulgur', 'beef', 'onion', 'pineNut', 'herbs']],
      ['Musakhan Chicken', 18, 790, ['chicken', 'bread', 'onion', 'pineNut', 'herbs']],
    ],
  };
  const slug = name => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function category(name) {
    if (/salad|horiatiki|fattoush/i.test(name)) return 'Salads';
    if (/burger|sandwich|club|tacos?|burrito|quesadilla|wraps?|sando|gyro|baleada|pupusas|falafel pita/i.test(name)) return 'Handhelds';
    if (/noodle|pasta|spaghetti|penne|linguine|lasagne|macaroni|udon|ramen|yakisoba|pad thai|pad see ew|japchae|pastitsio/i.test(name)) return 'Noodles & pasta';
    if (/soup|stew|chowder|chili|pozole|curry|tom kha|jjigae|dal tadka|chana masala|sopa|rogan josh/i.test(name)) return 'Soups & stews';
    if (/bowl|rice|biryani|risotto|bibimbap|gyudon|\bdon\b|gallo pinto|mujadara|kabsa/i.test(name)) return 'Bowls & rice';
    if (/pizza|quiche|spanakopita|hummus|okonomiyaki|kibbeh/i.test(name)) return 'Baked & shareable';
    return 'Plates';
  }
  const seafood = ['protein-salmon', 'protein-tuna', 'protein-whitefish', 'protein-shrimp', 'protein-mussels', 'protein-conch', 'fish-sauce', 'kimchi'];
  const meat = ['protein-chicken', 'protein-beef', 'protein-pork', 'protein-lamb', 'protein-duck'];
  const dishes = Object.entries(recipes).flatMap(([cuisine, rows]) => rows.map(([name, price, calories, keys]) => {
    const ingredients = keys.map(key => pantry[key]);
    const allergens = [...new Set(ingredients.flatMap(item => item.allergens))];
    const vegetarian = !ingredients.some(item => meat.includes(item.id) || seafood.includes(item.id));
    return {
      id: slug(name), name, cuisine, category: category(name), price, calories, ingredients, allergens,
      description: `A mock ${cuisine} dish featuring ${ingredients.map(item => item.name.toLowerCase()).join(', ')}.`,
      dietary: [...(vegetarian ? ['Vegetarian'] : []), ...(vegetarian && !allergens.some(a => ['Milk', 'Egg'].includes(a)) ? ['Vegan'] : []), ...(!allergens.includes('Wheat') ? ['No wheat ingredients'] : [])],
      restrictions: 'Illustrative nutrition only; cross-contact is not modeled.',
    };
  }));
  const extras = [
    ingredient('extra-avocado', 'Avocado', 1.8, 120),
    ingredient('extra-cheese', 'Extra cheese', 1.2, 110, ['Milk']),
    ingredient('extra-chicken', 'Extra chicken', 3.5, 185),
    ingredient('extra-tofu', 'Extra tofu', 2.5, 120, ['Soy']),
  ];
  const beverages = [
    { id: 'water', name: 'Still water', price: 1.5, calories: 0 },
    { id: 'cola', name: 'Classic cola', price: 2.5, calories: 105 },
    { id: 'lemonade', name: 'House lemonade', price: 3.25, calories: 110 },
    { id: 'coffee', name: 'Black coffee', price: 3, calories: 5 },
  ];
  const desserts = [
    { id: 'brownie', name: 'Chocolate brownie', price: 5, calories: 330, allergens: ['Milk', 'Egg', 'Wheat'] },
    { id: 'sorbet', name: 'Mango sorbet', price: 5, calories: 150, allergens: [] },
    { id: 'flan', name: 'Caramel flan', price: 6, calories: 290, allergens: ['Milk', 'Egg'] },
  ];
  const sides = [
    { id: 'fries', name: 'Fries', price: 3, calories: 320 },
    { id: 'salad', name: 'Garden salad', price: 3, calories: 80 },
  ];
  return { cuisines: Object.keys(recipes), dishes, pantry, quantities, extras, beverages, desserts, sides };
})();
