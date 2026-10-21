import type { Beverage, BeverageSize, Dessert, Dish, Ingredient, Order } from '../domain/model'

export const cuisines = [
  'American', 'Mexican', 'Italian', 'Japanese', 'Chinese', 'Korean',
  'Indian', 'Thai', 'Mediterranean', 'Honduran / Central American', 'French', 'Middle Eastern',
]

const quantities = [0, 0.5, 1, 1.5, 2, 3]
const ingredient = (
  id: string, name: string, price: number, calories: number, allergens: string[] = [],
): Ingredient => ({ id, name, price, calories, allergens, quantities: [...quantities] })

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
  chorizo: ingredient('protein-chorizo', 'Chorizo', 3, 200),
}

type PantryKey = keyof typeof pantry
type Recipe = readonly [name: string, description: string, price: number, calories: number, ingredients: readonly PantryKey[]]

const recipes: Record<string, readonly Recipe[]> = {
  American: [
    ['Classic Cheeseburger', 'Griddled beef, melted cheese and crisp greens in a toasted brioche bun.', 13.5, 720, ['beef', 'bun', 'cheese', 'greens', 'tomato']],
    ['Southern Fried Chicken', 'Buttermilk-style crispy chicken with creamy potatoes and cabbage slaw.', 15, 810, ['chicken', 'flour', 'potato', 'cabbage', 'cream']],
    ['Smoky Pulled Pork Sandwich', 'Slow-cooked pork, tangy slaw and smoky barbecue glaze.', 13, 690, ['pork', 'bun', 'cabbage', 'onion']],
    ['New England Fish Chowder', 'White fish and potatoes in a gently simmered cream broth.', 14, 540, ['whitefish', 'potato', 'cream', 'onion']],
    ['Cajun Shrimp Rice', 'Spiced shrimp over pepper-and-onion rice.', 16, 610, ['shrimp', 'rice', 'pepper', 'onion']],
    ['Macaroni and Cheese', 'Elbow pasta baked in a rich cheese and cream sauce.', 11.5, 780, ['pasta', 'cheese', 'cream']],
    ['California Chicken Club', 'Toasted chicken sandwich with avocado, tomatoes and fresh greens.', 14, 650, ['chicken', 'bread', 'avocado', 'tomato', 'greens']],
    ['Mushroom Veggie Burger', 'A hearty bean-and-mushroom patty with greens and tomato.', 12.5, 570, ['beans', 'mushroom', 'bread', 'greens', 'tomato']],
    ['Texas Beef Chili', 'Slow-simmered beef and beans with tomatoes and sweet peppers.', 13, 590, ['beef', 'beans', 'tomato', 'pepper']],
    ['Pacific Salmon Plate', 'Roasted salmon with herbed potatoes and garden greens.', 19, 620, ['salmon', 'potato', 'greens', 'herbs']],
  ],
  Italian: [
    ['Pizza Margherita', 'Stone-baked pizza with tomatoes, mozzarella and fragrant basil.', 13, 760, ['dough', 'tomato', 'cheese', 'basil']],
    ['Spaghetti Bolognese', 'Slow-cooked beef and tomato ragù over spaghetti.', 15, 740, ['beef', 'pasta', 'tomato', 'onion', 'cheese']],
    ['Penne Arrabbiata', 'Penne in a lively tomato sauce finished with fresh herbs.', 12, 560, ['pasta', 'tomato', 'herbs']],
    ['Mushroom Risotto', 'Creamy arborio rice with sautéed mushrooms and Parmesan.', 15, 660, ['rice', 'mushroom', 'cheese', 'onion']],
    ['Chicken Parmigiana', 'Golden chicken baked with tomato and melted cheese, served with pasta.', 17, 820, ['chicken', 'breadcrumbs', 'egg', 'pasta', 'tomato', 'cheese']],
    ['Eggplant Parmigiana', 'Layers of roasted eggplant, tomato and melting cheese.', 14, 580, ['eggplant', 'tomato', 'cheese', 'basil']],
    ['Seafood Linguine', 'Linguine tossed with shrimp, mussels and a light tomato sauce.', 20, 680, ['shrimp', 'mussels', 'pasta', 'tomato']],
    ['Lasagne al Forno', 'Baked pasta layered with beef ragù and creamy cheese sauce.', 16, 850, ['beef', 'pasta', 'tomato', 'cheese', 'cream']],
    ['Tuscan White Bean Stew', 'White beans, tomatoes and greens slowly simmered with herbs.', 12, 430, ['beans', 'tomato', 'greens', 'herbs']],
    ['Pesto Chicken Pasta', 'Chicken and pasta with fresh basil, cream and Parmesan.', 16, 770, ['chicken', 'pasta', 'basil', 'cream', 'cheese']],
  ],
  Mexican: [
    ['Carne Asada Tacos', 'Chargrilled beef tacos with onion and fresh herbs.', 14, 610, ['beef', 'tortilla', 'onion', 'herbs']],
    ['Chicken Enchiladas', 'Rolled corn tortillas baked with chicken, tomato sauce and cheese.', 15, 740, ['chicken', 'tortilla', 'tomato', 'cheese']],
    ['Bean and Rice Burrito', 'A hearty flour tortilla filled with beans, rice, peppers and avocado.', 12, 690, ['beans', 'flourTortilla', 'rice', 'pepper', 'avocado']],
    ['Pork Carnitas Bowl', 'Slow-roasted pork with rice, beans and fresh tomato.', 15, 730, ['pork', 'rice', 'beans', 'tomato']],
    ['Shrimp Tostadas', 'Crisp corn tortillas with shrimp, avocado and shredded cabbage.', 16, 560, ['shrimp', 'tortilla', 'avocado', 'cabbage']],
    ['Cheese Quesadilla', 'Toasted corn tortillas folded around melted cheese and peppers.', 10.5, 590, ['tortilla', 'cheese', 'pepper']],
    ['Chicken Fajitas', 'Sizzling chicken and sweet peppers with warm corn tortillas.', 16, 660, ['chicken', 'tortilla', 'pepper', 'onion']],
    ['Chilaquiles Rojos', 'Crisp tortilla pieces in red sauce with egg and cheese.', 12, 620, ['tortilla', 'tomato', 'egg', 'cheese']],
    ['Vegetable Pozole', 'A warming hominy-and-bean stew with cabbage and herbs.', 12, 470, ['hominy', 'beans', 'cabbage', 'herbs']],
    ['Tacos al Pastor', 'Spiced roasted pork tacos with pineapple, onion and bright herbs.', 14, 630, ['pork', 'tortilla', 'pineapple', 'onion', 'herbs']],
  ],
  Japanese: [
    ['Chicken Teriyaki Don', 'Glazed chicken over steamed rice with crisp cucumber.', 14.5, 650, ['chicken', 'rice', 'soy', 'cucumber']],
    ['Salmon Sushi Bowl', 'Salmon, avocado and cucumber over seasoned rice.', 18, 610, ['salmon', 'rice', 'avocado', 'cucumber', 'sesame']],
    ['Tonkatsu Curry', 'Crisp pork cutlet with warming curry, potatoes and rice.', 17, 840, ['pork', 'breadcrumbs', 'egg', 'rice', 'potato', 'carrot']],
    ['Miso Tofu Ramen', 'Tofu and mushrooms in a soy-seasoned noodle broth.', 14, 570, ['tofu', 'noodles', 'mushroom', 'soy']],
    ['Beef Gyudon', 'Thin-sliced beef and sweet onion simmered over rice.', 15, 680, ['beef', 'rice', 'onion', 'soy']],
    ['Shrimp Tempura Udon', 'Crisp shrimp over thick noodles in a light broth.', 17, 720, ['shrimp', 'flour', 'egg', 'noodles', 'soy', 'onion']],
    ['Vegetable Yakisoba', 'Wok-tossed noodles with cabbage, carrots and mushrooms.', 12.5, 550, ['noodles', 'cabbage', 'carrot', 'mushroom', 'soy']],
    ['Chicken Katsu Sando', 'Crisp chicken sandwich with finely shredded cabbage.', 13, 690, ['chicken', 'breadcrumbs', 'egg', 'bread', 'cabbage']],
    ['Tuna Poke Don', 'Tuna and sesame over rice with avocado and cucumber.', 19, 630, ['tuna', 'rice', 'sesame', 'avocado', 'cucumber']],
    ['Okonomiyaki', 'A savory cabbage pancake with egg and a soy glaze.', 13, 580, ['cabbage', 'egg', 'flour', 'soy']],
  ],
  Chinese: [
    ['Kung Pao Chicken', 'Chicken, peppers and roasted peanuts in a savory wok sauce.', 15, 690, ['chicken', 'rice', 'pepper', 'peanut', 'soy']],
    ['Mapo Tofu', 'Silken tofu and minced pork in a fragrant Sichuan-style sauce.', 14, 620, ['tofu', 'pork', 'rice', 'soy']],
    ['Beef and Broccoli Rice', 'Tender beef and broccoli in a glossy soy sauce over rice.', 16, 670, ['beef', 'rice', 'broccoli', 'soy']],
    ['Sweet and Sour Pork', 'Crisp pork with peppers and a tangy tomato glaze.', 15, 780, ['pork', 'flour', 'rice', 'pepper', 'tomato']],
    ['Yangzhou Fried Rice', 'Wok-fried rice with shrimp, pork, egg and vegetables.', 14, 710, ['shrimp', 'pork', 'rice', 'egg', 'carrot']],
    ['Dan Dan Noodles', 'Wheat noodles with pork, sesame and a deeply savory sauce.', 14.5, 730, ['pork', 'noodles', 'sesame', 'soy']],
    ['Mushroom Chow Mein', 'Stir-fried noodles with mushrooms, cabbage and soy.', 12.5, 570, ['noodles', 'mushroom', 'cabbage', 'soy']],
    ['Ginger Scallion Fish', 'Steamed white fish with herbs, ginger-style aromatics and rice.', 18, 510, ['whitefish', 'rice', 'herbs', 'soy']],
    ['Peking Duck Wraps', 'Roast duck, crisp cucumber and savory sauce in thin wraps.', 21, 760, ['duck', 'bread', 'cucumber', 'soy']],
    ['Sichuan Eggplant', 'Silky eggplant with peppers and a fragrant soy sauce over rice.', 13, 560, ['eggplant', 'rice', 'pepper', 'soy']],
  ],
  Indian: [
    ['Butter Chicken', 'Tandoori-style chicken in a velvety tomato and cream sauce with rice.', 16, 780, ['chicken', 'rice', 'tomato', 'cream']],
    ['Chana Masala', 'Chickpeas simmered in a spiced tomato sauce with rice.', 12, 560, ['chickpeas', 'rice', 'tomato', 'onion']],
    ['Palak Paneer', 'Soft paneer-style cheese in a spinach sauce with rice.', 14, 650, ['cheese', 'greens', 'rice', 'cream']],
    ['Lamb Rogan Josh', 'Slow-braised lamb in a warming tomato and yogurt gravy.', 19, 750, ['lamb', 'rice', 'tomato', 'yogurt']],
    ['Vegetable Biryani', 'Fragrant rice layered with potatoes, carrots and fresh herbs.', 13, 590, ['rice', 'potato', 'carrot', 'herbs']],
    ['Chicken Tikka Masala', 'Roasted chicken in spiced tomato cream, served with rice.', 16.5, 760, ['chicken', 'rice', 'tomato', 'cream']],
    ['Dal Tadka', 'Yellow lentils with toasted spices, onion and steamed rice.', 11.5, 520, ['lentils', 'rice', 'onion', 'tomato']],
    ['Goan Fish Curry', 'White fish in a tangy coconut and tomato curry.', 18, 640, ['whitefish', 'rice', 'coconut', 'tomato']],
    ['Aloo Gobi', 'Potatoes and cauliflower with tomato and aromatic herbs.', 12, 530, ['potato', 'cauliflower', 'tomato', 'rice']],
    ['Keema Naan Plate', 'Spiced minced beef with warm bread and cooling yogurt.', 15, 710, ['beef', 'bread', 'onion', 'yogurt']],
  ],
  Thai: [
    ['Chicken Pad Thai', 'Rice noodles with chicken, egg and peanuts in a tangy sauce.', 15, 740, ['chicken', 'riceNoodles', 'egg', 'peanut', 'fishSauce']],
    ['Green Tofu Curry', 'Tofu, eggplant and basil in fragrant green coconut curry.', 14, 680, ['tofu', 'rice', 'eggplant', 'coconut', 'basil']],
    ['Red Shrimp Curry', 'Shrimp and sweet peppers in rich red coconut curry.', 17, 710, ['shrimp', 'rice', 'pepper', 'coconut', 'fishSauce']],
    ['Pad Kra Pao Beef', 'Basil-fried beef with rice and a golden egg.', 16, 730, ['beef', 'rice', 'basil', 'egg', 'soy']],
    ['Tom Kha Chicken', 'Coconut chicken soup with mushrooms and fresh herbs.', 14, 520, ['chicken', 'coconut', 'mushroom', 'herbs', 'fishSauce']],
    ['Pineapple Fried Rice', 'Sweet-savory pineapple fried rice with shrimp, egg and roasted peanuts.', 16, 700, ['shrimp', 'rice', 'pineapple', 'egg', 'peanut']],
    ['Pad See Ew', 'Wide rice noodles stir-fried with chicken, greens and soy.', 15, 710, ['chicken', 'riceNoodles', 'greens', 'soy']],
    ['Massaman Beef Curry', 'Slow-cooked beef, potatoes and peanuts in mellow coconut curry.', 18, 820, ['beef', 'potato', 'rice', 'coconut', 'peanut']],
    ['Larb Chicken Salad', 'Bright minced chicken salad with herbs, cabbage and rice.', 14, 490, ['chicken', 'cabbage', 'herbs', 'rice', 'fishSauce']],
    ['Thai Basil Eggplant', 'Wok-seared eggplant and tofu with basil and soy.', 13, 540, ['tofu', 'eggplant', 'rice', 'basil', 'soy']],
  ],
  French: [
    ['Coq au Vin', 'Wine-style braised chicken with mushrooms, onions and potatoes.', 19, 720, ['chicken', 'mushroom', 'onion', 'potato']],
    ['Beef Bourguignon', 'Slow-braised beef with mushrooms, carrots and buttery potatoes.', 22, 790, ['beef', 'mushroom', 'carrot', 'potato']],
    ['Ratatouille', 'Slow-roasted eggplant, zucchini, peppers and tomatoes with herbs.', 13, 350, ['eggplant', 'zucchini', 'pepper', 'tomato', 'herbs']],
    ['Croque Monsieur', 'A golden toasted ham-style pork and cheese sandwich with cream sauce.', 14, 750, ['pork', 'bread', 'cheese', 'cream']],
    ['Quiche Lorraine', 'Buttery pastry filled with egg, pork and a delicate cream custard.', 13.5, 680, ['pastry', 'egg', 'pork', 'cream']],
    ['Salmon en Papillote', 'Gently baked salmon with zucchini, tomatoes and fresh herbs.', 21, 570, ['salmon', 'zucchini', 'tomato', 'herbs']],
    ['French Onion Soup', 'Slow-caramelized onion broth with a cheese-topped bread raft.', 11, 460, ['onion', 'bread', 'cheese']],
    ['Moules Marinières', 'Mussels steamed with onion, cream and fragrant herbs.', 20, 590, ['mussels', 'onion', 'cream', 'bread', 'herbs']],
    ['Duck Confit', 'Tender slow-cooked duck with crisp potatoes and greens.', 24, 860, ['duck', 'potato', 'greens']],
    ['Niçoise Salad', 'Tuna, egg, olives and potatoes over crisp garden greens.', 17, 560, ['tuna', 'egg', 'olive', 'potato', 'greens']],
  ],
  Mediterranean: [
    ['Chicken Souvlaki', 'Grilled chicken skewers with pita, tomato and yogurt sauce.', 15, 640, ['chicken', 'pita', 'tomato', 'yogurt']],
    ['Lamb Gyro', 'Warm pita with seasoned lamb, onion, tomato and yogurt.', 16, 760, ['lamb', 'pita', 'onion', 'tomato', 'yogurt']],
    ['Moussaka', 'Baked layers of lamb, eggplant, potato and creamy cheese sauce.', 18, 830, ['lamb', 'eggplant', 'potato', 'cheese', 'cream']],
    ['Spanakopita', 'Flaky pastry with leafy greens, feta and fresh herbs.', 12, 590, ['pastry', 'greens', 'feta', 'herbs']],
    ['Horiatiki Salad', 'Tomatoes, cucumber, olives and feta in a rustic Greek salad.', 12, 390, ['tomato', 'cucumber', 'olive', 'feta', 'onion']],
    ['Shrimp Saganaki', 'Shrimp baked in tomato sauce with feta and herbs.', 18, 510, ['shrimp', 'tomato', 'feta', 'herbs']],
    ['Gemista', 'Sweet peppers stuffed with herbed rice and tomatoes.', 13, 470, ['pepper', 'rice', 'tomato', 'herbs']],
    ['Pastitsio', 'Baked pasta with beef, tomato and a creamy cheese topping.', 17, 820, ['beef', 'pasta', 'tomato', 'cream', 'cheese']],
    ['Fasolada', 'Traditional white bean soup with carrots, tomatoes and herbs.', 11, 410, ['beans', 'carrot', 'tomato', 'herbs']],
    ['Lemon Chicken Rice', 'Roasted chicken with lemon-style herb rice and cool cucumber.', 15.5, 620, ['chicken', 'rice', 'cucumber', 'herbs']],
  ],
  'Honduran / Central American': [
    ['Baleada Sencilla', 'A warm flour tortilla folded around refried red beans, cheese and crema.', 9, 580, ['flourTortilla', 'beans', 'cheese', 'cream']],
    ['Baleada con Huevo', 'Honduran flour tortilla with refried beans, scrambled egg, cheese and avocado.', 11, 710, ['flourTortilla', 'beans', 'egg', 'cheese', 'avocado']],
    ['Pollo con Tajadas', 'Crisp Honduran chicken with fried green plantain slices and cabbage slaw.', 16, 810, ['chicken', 'flour', 'plantain', 'cabbage', 'tomato']],
    ['Carne Asada Catracha', 'Grilled beef with red beans, rice, corn tortillas and fresh cabbage.', 18, 790, ['beef', 'beans', 'rice', 'tortilla', 'cabbage']],
    ['Sopa de Caracol', 'Caribbean Honduran conch soup with coconut milk, cassava and plantain.', 20, 670, ['conch', 'coconut', 'cassava', 'plantain', 'herbs']],
    ['Yuca con Chicharrón', 'Tender cassava with crisp pork, tangy cabbage and tomato salsa.', 15, 740, ['pork', 'cassava', 'cabbage', 'tomato']],
    ['Honduran Enchiladas', 'Crisp corn tostadas layered with ground beef, cabbage, tomato and egg.', 13, 680, ['beef', 'tortilla', 'cabbage', 'tomato', 'egg']],
    ['Pupusas Revueltas', 'Thick Salvadoran corn cakes stuffed with pork, beans and cheese, with curtido.', 12, 690, ['cornMasa', 'pork', 'beans', 'cheese', 'cabbage']],
    ['Gallo Pinto Plate', 'Costa Rican rice and beans with sweet peppers, egg and ripe plantain.', 12, 650, ['rice', 'beans', 'pepper', 'egg', 'plantain']],
    ['Nacatamal Hondureño', 'Banana-leaf steamed corn masa with pork, rice, potato and tomato.', 14, 760, ['cornMasa', 'pork', 'rice', 'potato', 'tomato']],
  ],
  Korean: [
    ['Beef Bibimbap', 'Rice topped with beef, vegetables, sesame and a golden egg.', 16, 730, ['beef', 'rice', 'carrot', 'greens', 'egg', 'sesame']],
    ['Bulgogi Bowl', 'Sweet-savory grilled beef with rice, onion and sesame.', 17, 720, ['beef', 'rice', 'onion', 'soy', 'sesame']],
    ['Kimchi Fried Rice', 'Tangy kimchi fried rice with egg and sesame.', 13, 610, ['kimchi', 'rice', 'egg', 'sesame']],
    ['Tofu Japchae', 'Sweet potato glass noodles with tofu, mushrooms and vegetables.', 14, 570, ['tofu', 'glassNoodles', 'mushroom', 'carrot', 'soy']],
    ['Dakgalbi Chicken', 'Spicy skillet chicken with cabbage, potatoes and rice.', 16, 760, ['chicken', 'cabbage', 'potato', 'rice']],
    ['Pork Bossam Wraps', 'Slow-cooked pork wrapped in crisp cabbage with kimchi.', 18, 640, ['pork', 'cabbage', 'kimchi', 'rice']],
    ['Sundubu Jjigae', 'Soft tofu and shrimp stew with egg and steamed rice.', 15, 580, ['tofu', 'shrimp', 'egg', 'rice']],
    ['Korean Fried Chicken', 'Crisp chicken with a glossy soy glaze and cabbage slaw.', 17, 830, ['chicken', 'flour', 'soy', 'cabbage', 'rice']],
    ['Doenjang Tofu Stew', 'Savory soybean-style broth with tofu, zucchini and mushrooms.', 13, 490, ['tofu', 'zucchini', 'mushroom', 'rice', 'soy']],
    ['Spicy Pork Rice Bowl', 'Chili-style pork with onions, sweet peppers and rice.', 16, 750, ['pork', 'rice', 'onion', 'pepper', 'sesame']],
  ],
  'Middle Eastern': [
    ['Chicken Shawarma Plate', 'Spiced roasted chicken with pita, tomato, cucumber and tahini.', 16, 720, ['chicken', 'pita', 'tomato', 'cucumber', 'sesame']],
    ['Beef Kofta Kebab', 'Grilled beef and herb skewers with rice, tomato and yogurt sauce.', 17, 730, ['beef', 'herbs', 'rice', 'tomato', 'yogurt']],
    ['Falafel Pita', 'Crisp chickpea and herb falafel in pita with cucumber, tomato and tahini.', 12, 610, ['chickpeas', 'pita', 'herbs', 'cucumber', 'tomato', 'sesame']],
    ['Hummus with Warm Pita', 'Creamy chickpeas blended with tahini, served with warm pita and vegetables.', 11, 570, ['chickpeas', 'sesame', 'pita', 'cucumber', 'tomato']],
    ['Mujadara', 'Lentils and rice topped with deeply caramelized onions and fresh herbs.', 12, 530, ['lentils', 'rice', 'onion', 'herbs']],
    ['Shakshuka', 'Eggs gently poached in spiced tomato and pepper sauce, served with bread.', 13, 560, ['egg', 'tomato', 'pepper', 'onion', 'bread']],
    ['Lamb Kabsa', 'Arabian spiced rice with tender lamb, tomatoes and toasted almonds.', 20, 810, ['lamb', 'rice', 'tomato', 'almond', 'onion']],
    ['Fattoush Salad', 'Crisp toasted pita with tomato, cucumber, leafy greens and fresh herbs.', 11, 390, ['pita', 'tomato', 'cucumber', 'greens', 'herbs']],
    ['Baked Kibbeh', 'A golden bulgur shell layered with spiced beef, onions and toasted pine nuts.', 16, 690, ['bulgur', 'beef', 'onion', 'pineNut', 'herbs']],
    ['Musakhan Chicken', 'Sumac-spiced roasted chicken over flatbread with caramelized onions and pine nuts.', 18, 790, ['chicken', 'bread', 'onion', 'pineNut', 'herbs']],
  ],
}

const slug = (name: string): string => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const meatIds = new Set(['protein-chicken', 'protein-beef', 'protein-pork', 'protein-lamb', 'protein-duck', 'protein-chorizo'])
const seafoodIds = new Set(['protein-salmon', 'protein-tuna', 'protein-whitefish', 'protein-shrimp', 'protein-mussels', 'protein-conch', 'fish-sauce', 'kimchi'])

function categoryFor(name: string): string {
  if (/salad|horiatiki|fattoush/i.test(name)) return 'Salads'
  if (/burger|sandwich|club|tacos?|burrito|quesadilla|wraps?|sando|gyro|baleada|pupusas|falafel pita/i.test(name)) return 'Handhelds'
  if (/noodle|pasta|spaghetti|penne|linguine|lasagne|macaroni|udon|ramen|yakisoba|pad thai|pad see ew|japchae|pastitsio/i.test(name)) return 'Noodles & pasta'
  if (/soup|stew|chowder|chili|pozole|curry|tom kha|jjigae|dal tadka|chana masala|sopa|rogan josh/i.test(name)) return 'Soups & stews'
  if (/bowl|rice|biryani|risotto|bibimbap|gyudon|\bdon\b|gallo pinto|mujadara|kabsa/i.test(name)) return 'Bowls & rice'
  if (/pizza|quiche|spanakopita|hummus|okonomiyaki|kibbeh/i.test(name)) return 'Baked & shareable'
  return 'Plates'
}

export const dishes: Dish[] = cuisines.flatMap((cuisine) => (recipes[cuisine] ?? []).map(([name, description, basePrice, baseCalories, keys]) => {
  const ingredients = keys.map((key) => ({ ...pantry[key], allergens: [...pantry[key].allergens], quantities: [...quantities] }))
  const allergens = [...new Set(ingredients.flatMap((item) => item.allergens))]
  const vegetarian = !ingredients.some((item) => meatIds.has(item.id) || seafoodIds.has(item.id))
  const vegan = vegetarian && !ingredients.some((item) => item.allergens.includes('Milk') || item.allergens.includes('Egg'))
  const protein = ingredients.find((item) => item.id.startsWith('protein-'))
  return {
    id: slug(name), name, description, cuisine, category: categoryFor(name), basePrice, baseCalories,
    ingredients,
    substitutions: protein ? [
      { ...pantry.tofu, id: 'sub-tofu', name: 'Tofu instead of primary protein', quantities: [1] },
      { ...pantry.chicken, id: 'sub-chicken', name: 'Chicken instead of primary protein', quantities: [1] },
    ].filter((item) => item.id !== `sub-${protein.id.replace('protein-', '')}`) : [],
    extras: [
      ingredient('extra-avocado', 'Avocado', 1.8, 120),
      ingredient('extra-cheese', 'Extra cheese', 1.2, 110, ['Milk']),
      ingredient('extra-chicken', 'Extra chicken', 3.5, 185),
      ingredient('extra-tofu', 'Extra tofu', 2.5, 120, ['Soy']),
    ],
    portions: [
      { id: 'regular', name: 'Regular', multiplier: 1 },
      { id: 'small', name: 'Small', multiplier: 0.75 },
      { id: 'large', name: 'Large', multiplier: 1.5 },
    ],
    restrictions: ['Illustrative nutrition; ask staff about cross-contact.'],
    dietary: [...(vegetarian ? ['Vegetarian'] : []), ...(vegan ? ['Vegan'] : []), ...(!allergens.includes('Wheat') ? ['No wheat ingredients'] : [])],
    allergens,
  }
}))

const sizes: BeverageSize[] = ['Small', 'Medium', 'Large', 'XL']
const drink = (
  id: string, name: string, category: string, price: number, calories: number, options: Beverage['options'],
): Beverage => ({
  id, name, category,
  sizes: Object.fromEntries(sizes.map((size, index) => [
    size, { price: Number((price + index * 0.65).toFixed(2)), calories: calories === 0 ? index : Math.round(calories * (1 + index * 0.4)) },
  ])) as Beverage['sizes'],
  options,
})
const cold = { ice: ['Regular', 'Less', 'No ice'], lemon: ['None', 'Slice'] }
const sweet = { ...cold, sweetness: ['Standard', 'Unsweetened', 'Extra sweet'] }
const coffee = {
  temperature: ['Hot', 'Iced'], milk: ['None', 'Whole milk', 'Oat milk'],
  syrup: ['None', 'Vanilla', 'Caramel'], sweetness: ['Standard', 'Unsweetened', 'Extra sweet'],
}

// Zero-calorie drinks use illustrative 0/1/2/3 kcal rounding across sizes, not laboratory nutrition.
export const beverages: Beverage[] = [
  drink('still-water', 'Still Water', 'Water', 1.5, 0, cold),
  drink('sparkling-water', 'Sparkling Water', 'Water', 2, 0, cold),
  drink('cola', 'Classic Cola', 'Soda', 2.5, 105, cold),
  drink('diet-cola', 'Zero Sugar Cola', 'Soda', 2.5, 0, cold),
  drink('ginger-ale', 'Ginger Ale', 'Soda', 2.75, 95, cold),
  drink('lemonade', 'House Lemonade', 'Juice', 3.25, 110, sweet),
  drink('orange-juice', 'Fresh Orange Juice', 'Juice', 3.5, 115, cold),
  drink('apple-juice', 'Cloudy Apple Juice', 'Juice', 3.25, 112, cold),
  drink('mango-lassi', 'Mango Lassi', 'Yogurt drink', 4.5, 185, { sweetness: sweet.sweetness, ice: cold.ice }),
  drink('thai-iced-tea', 'Thai Iced Tea', 'Tea', 4, 160, { ...sweet, milk: ['None', 'Whole milk', 'Oat milk'] }),
  drink('black-tea', 'Black Tea', 'Tea', 2.5, 0, { ...coffee, lemon: cold.lemon }),
  drink('green-tea', 'Jasmine Green Tea', 'Tea', 2.75, 0, { temperature: ['Hot', 'Iced'], lemon: cold.lemon, sweetness: sweet.sweetness }),
  drink('iced-peach-tea', 'Peach Iced Tea', 'Tea', 3.5, 75, sweet),
  drink('americano', 'Americano', 'Coffee', 3, 5, coffee),
  drink('latte', 'Caffè Latte', 'Coffee', 4, 120, coffee),
  drink('cappuccino', 'Cappuccino', 'Coffee', 4, 95, coffee),
  drink('cold-brew', 'Cold Brew', 'Coffee', 3.75, 5, { ...coffee, ice: cold.ice }),
  drink('matcha-latte', 'Matcha Latte', 'Tea', 4.75, 140, coffee),
  drink('taro-boba', 'Taro Bubble Tea', 'Bubble tea', 5, 210, { ...sweet, milk: ['None', 'Whole milk', 'Oat milk'], toppings: ['None', 'Tapioca pearls', 'Coconut jelly'] }),
  drink('berry-smoothie', 'Mixed Berry Smoothie', 'Smoothie', 5.5, 170, { sweetness: sweet.sweetness, toppings: ['None', 'Chia seeds'] }),
]

export const desserts: Dessert[] = [
  { id: 'tiramisu', name: 'Tiramisu', category: 'Cake', price: 7, calories: 360, allergens: ['Milk', 'Egg', 'Wheat'] },
  { id: 'cheesecake', name: 'New York Cheesecake', category: 'Cake', price: 7.5, calories: 420, allergens: ['Milk', 'Egg', 'Wheat'] },
  { id: 'chocolate-brownie', name: 'Chocolate Brownie', category: 'Baked', price: 5, calories: 330, allergens: ['Milk', 'Egg', 'Wheat'] },
  { id: 'apple-pie', name: 'Warm Apple Pie', category: 'Pie', price: 6, calories: 340, allergens: ['Milk', 'Wheat'] },
  { id: 'creme-brulee', name: 'Crème Brûlée', category: 'Custard', price: 7, calories: 310, allergens: ['Milk', 'Egg'] },
  { id: 'panna-cotta', name: 'Vanilla Panna Cotta', category: 'Custard', price: 6.5, calories: 280, allergens: ['Milk'] },
  { id: 'gelato', name: 'Pistachio Gelato', category: 'Frozen', price: 5.5, calories: 240, allergens: ['Milk', 'Tree nuts'] },
  { id: 'mango-sorbet', name: 'Mango Sorbet', category: 'Frozen', price: 5, calories: 150, allergens: [] },
  { id: 'churros', name: 'Cinnamon Churros', category: 'Fried', price: 6, calories: 370, allergens: ['Wheat'] },
  { id: 'flan', name: 'Caramel Flan', category: 'Custard', price: 6, calories: 290, allergens: ['Milk', 'Egg'] },
  { id: 'mochi', name: 'Strawberry Mochi', category: 'Rice sweets', price: 5.5, calories: 190, allergens: [] },
  { id: 'matcha-roll', name: 'Matcha Swiss Roll', category: 'Cake', price: 6.5, calories: 270, allergens: ['Milk', 'Egg', 'Wheat'] },
  { id: 'gulab-jamun', name: 'Gulab Jamun', category: 'Syrup sweets', price: 5.5, calories: 320, allergens: ['Milk', 'Wheat'] },
  { id: 'mango-sticky-rice', name: 'Mango Sticky Rice', category: 'Rice sweets', price: 7, calories: 390, allergens: [] },
  { id: 'baklava', name: 'Walnut Baklava', category: 'Pastry', price: 6, calories: 340, allergens: ['Milk', 'Wheat', 'Tree nuts'] },
  { id: 'lemon-tart', name: 'Lemon Tart', category: 'Tart', price: 6.5, calories: 310, allergens: ['Milk', 'Egg', 'Wheat'] },
  { id: 'chocolate-mousse', name: 'Dark Chocolate Mousse', category: 'Mousse', price: 6.5, calories: 300, allergens: ['Milk', 'Egg'] },
  { id: 'coconut-pudding', name: 'Coconut Rice Pudding', category: 'Pudding', price: 5, calories: 250, allergens: [] },
  { id: 'strawberry-shortcake', name: 'Strawberry Shortcake', category: 'Cake', price: 7, calories: 350, allergens: ['Milk', 'Egg', 'Wheat'] },
  { id: 'sesame-balls', name: 'Red Bean Sesame Balls', category: 'Fried', price: 5.5, calories: 260, allergens: ['Sesame'] },
]

export const sides = [
  { id: 'fries', name: 'Sea Salt Fries', price: 3.5, calories: 320 },
  { id: 'salad', name: 'Garden Salad', price: 3, calories: 80 },
  { id: 'rice', name: 'Steamed Rice', price: 2.5, calories: 200 },
  { id: 'slaw', name: 'Crunchy Slaw', price: 3, calories: 130 },
  { id: 'vegetables', name: 'Roasted Vegetables', price: 4, calories: 150 },
  { id: 'combo', name: 'Combo Fries (included side)', price: 3.5, calories: 320 },
]

export const dessertToppings = [
  { id: 'berries', name: 'Fresh Berries', price: 1, calories: 25 },
  { id: 'cream', name: 'Whipped Cream', price: 0.75, calories: 70 },
  { id: 'nuts', name: 'Toasted Almonds (tree nuts)', price: 1.25, calories: 85 },
  { id: 'sprinkles', name: 'Rainbow Sprinkles', price: 0.5, calories: 40 },
]
export const dessertSauces = [
  { id: 'chocolate', name: 'Chocolate Sauce', price: 0.75, calories: 55 },
  { id: 'caramel', name: 'Caramel Sauce', price: 0.75, calories: 60 },
  { id: 'berry', name: 'Berry Coulis', price: 0.75, calories: 30 },
]
export const dessertPortions = [0.5, 1, 1.5, 2]
export const dessertSauceQuantities = [0.5, 1, 2, 3]

export function createOrder(dish: Dish): Order {
  return {
    dishId: dish.id, portionId: 'regular',
    quantities: Object.fromEntries(dish.ingredients.map((item) => [item.id, 1])),
    extraIds: [], substitutionId: '', bread: 'Standard', cheese: 'Standard',
    cooking: 'Chef recommended', side: '', combo: false,
    beverageId: '', beverageSize: 'Medium', beverageOptions: {},
    dessertId: '', dessertPortion: 1, dessertTopping: '', dessertSauce: '',
    dessertSauceQuantity: 1, dessertOffer: false,
  }
}
