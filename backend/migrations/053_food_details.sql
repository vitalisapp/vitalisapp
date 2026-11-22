-- 053 — Section 6: food details (images, sugar, sodium, preparation, descriptions).
-- food_catalog gains sugar (g), sodium (mg), category, preparation method,
-- description and a cached stock photo (Pexels; filled by the server on
-- demand). food_logs gains sugar + sodium so daily totals can be monitored
-- against WHO limits. Values are approximate typical-serving estimates.

ALTER TABLE `food_catalog`
  ADD COLUMN `sugar` decimal(10,2) DEFAULT NULL AFTER `fat`;
ALTER TABLE `food_catalog`
  ADD COLUMN `sodium` decimal(10,1) DEFAULT NULL AFTER `sugar`;
ALTER TABLE `food_catalog`
  ADD COLUMN `category` varchar(30) DEFAULT NULL AFTER `sodium`;
ALTER TABLE `food_catalog`
  ADD COLUMN `prep_method` varchar(30) DEFAULT NULL AFTER `category`;
ALTER TABLE `food_catalog`
  ADD COLUMN `description` varchar(400) DEFAULT NULL AFTER `prep_method`;
ALTER TABLE `food_catalog`
  ADD COLUMN `image_url` varchar(500) DEFAULT NULL AFTER `description`;
ALTER TABLE `food_catalog`
  ADD COLUMN `image_credit` varchar(120) DEFAULT NULL AFTER `image_url`;
ALTER TABLE `food_catalog`
  ADD COLUMN `image_link` varchar(500) DEFAULT NULL AFTER `image_credit`;
ALTER TABLE `food_catalog`
  ADD COLUMN `image_checked_at` datetime DEFAULT NULL AFTER `image_link`;

ALTER TABLE `food_logs`
  ADD COLUMN `sugar` decimal(10,2) DEFAULT NULL AFTER `fat`;
ALTER TABLE `food_logs`
  ADD COLUMN `sodium` decimal(10,1) DEFAULT NULL AFTER `sugar`;

UPDATE `food_catalog`
SET `sugar` = CASE `name`
  WHEN 'Banana' THEN 14.4
  WHEN 'Apple' THEN 19
  WHEN 'Orange' THEN 12.2
  WHEN 'Strawberries' THEN 7.4
  WHEN 'Blueberries' THEN 14.7
  WHEN 'Grapes' THEN 15
  WHEN 'Mango' THEN 22.5
  WHEN 'Pineapple' THEN 16.3
  WHEN 'Watermelon' THEN 9.4
  WHEN 'Avocado' THEN 0.7
  WHEN 'Raisins' THEN 21
  WHEN 'Dates' THEN 48
  WHEN 'Boiled egg' THEN 0.6
  WHEN 'Fried egg' THEN 0.2
  WHEN 'Egg white' THEN 0.2
  WHEN 'Omelette (2 eggs)' THEN 1
  WHEN 'Chicken breast, grilled' THEN 0
  WHEN 'Chicken thigh, roasted' THEN 0
  WHEN 'Chicken wings, fried' THEN 0
  WHEN 'Beef steak, grilled' THEN 0
  WHEN 'Ground beef, 85% lean' THEN 0
  WHEN 'Pork chop, grilled' THEN 0
  WHEN 'Bacon' THEN 0
  WHEN 'Salmon, baked' THEN 0
  WHEN 'Tuna, canned in water' THEN 0
  WHEN 'Shrimp, steamed' THEN 0
  WHEN 'Tilapia, cooked' THEN 0
  WHEN 'Turkey breast, sliced' THEN 3.5
  WHEN 'Tofu, firm' THEN 0.6
  WHEN 'Tempeh' THEN 0
  WHEN 'Lentils, cooked' THEN 3.6
  WHEN 'Black beans, cooked' THEN 0.6
  WHEN 'Chickpeas, cooked' THEN 7.9
  WHEN 'Kidney beans, cooked' THEN 0.6
  WHEN 'Edamame' THEN 3.4
  WHEN 'Hummus' THEN 0.1
  WHEN 'White rice, cooked' THEN 0.1
  WHEN 'Brown rice, cooked' THEN 0.7
  WHEN 'Quinoa, cooked' THEN 1.6
  WHEN 'Pasta, cooked' THEN 0.8
  WHEN 'Spaghetti with tomato sauce' THEN 8
  WHEN 'Mac and cheese' THEN 6
  WHEN 'Ramen, instant' THEN 2
  WHEN 'Bread, white' THEN 1.4
  WHEN 'Bread, whole wheat' THEN 1.4
  WHEN 'Bagel, plain' THEN 5
  WHEN 'Croissant' THEN 6
  WHEN 'Tortilla, flour' THEN 1.5
  WHEN 'Pancakes' THEN 6
  WHEN 'French toast' THEN 10
  WHEN 'Waffles' THEN 5
  WHEN 'Oatmeal, cooked' THEN 0.6
  WHEN 'Breakfast cereal, flakes' THEN 3
  WHEN 'Granola' THEN 12
  WHEN 'Milk, whole' THEN 12.3
  WHEN 'Milk, skim' THEN 12.5
  WHEN 'Almond milk, unsweetened' THEN 0
  WHEN 'Greek yogurt, plain' THEN 8
  WHEN 'Yogurt, fruit-flavored' THEN 40
  WHEN 'Cheddar cheese' THEN 0.1
  WHEN 'Mozzarella' THEN 0.3
  WHEN 'Cottage cheese' THEN 3
  WHEN 'Cream cheese' THEN 0.5
  WHEN 'Butter' THEN 0
  WHEN 'Peanut butter' THEN 3
  WHEN 'Almonds' THEN 1.2
  WHEN 'Walnuts' THEN 0.7
  WHEN 'Cashews' THEN 1.7
  WHEN 'Mixed nuts' THEN 1.3
  WHEN 'Trail mix' THEN 12
  WHEN 'Pizza, cheese' THEN 3.8
  WHEN 'Cheeseburger' THEN 9
  WHEN 'Beef burrito' THEN 3
  WHEN 'Chicken taco' THEN 2
  WHEN 'Chicken sandwich, fried' THEN 6
  WHEN 'Hot dog' THEN 4
  WHEN 'Club sandwich' THEN 4
  WHEN 'Turkey sandwich' THEN 6
  WHEN 'Sushi roll, salmon' THEN 6
  WHEN 'Pad thai' THEN 18
  WHEN 'Fried rice' THEN 2
  WHEN 'Chicken curry with rice' THEN 6
  WHEN 'Caesar salad with chicken' THEN 3
  WHEN 'Greek salad' THEN 7
  WHEN 'French fries' THEN 0.3
  WHEN 'Potato chips' THEN 0.1
  WHEN 'Mashed potatoes' THEN 2
  WHEN 'Baked potato' THEN 2
  WHEN 'Sweet potato, baked' THEN 7.4
  WHEN 'Corn on the cob' THEN 4.5
  WHEN 'Broccoli, steamed' THEN 2.2
  WHEN 'Carrots, raw' THEN 6
  WHEN 'Mixed greens salad' THEN 2
  WHEN 'Tomato soup' THEN 12
  WHEN 'Chicken noodle soup' THEN 1
  WHEN 'Chocolate chip cookie' THEN 10
  WHEN 'Brownie' THEN 24
  WHEN 'Ice cream, vanilla' THEN 14
  WHEN 'Donut, glazed' THEN 13
  WHEN 'Muffin, blueberry' THEN 30
  WHEN 'Cake, chocolate' THEN 35
  WHEN 'Energy bar' THEN 12
  WHEN 'Protein shake, whey' THEN 1.5
  WHEN 'Protein bar' THEN 6
  WHEN 'Dark chocolate' THEN 7
  WHEN 'Honey' THEN 17.2
  WHEN 'Black coffee' THEN 0
  WHEN 'Latte' THEN 17
  WHEN 'Orange juice' THEN 21
  WHEN 'Cola' THEN 39
  WHEN 'Diet cola' THEN 0
  WHEN 'Beer' THEN 0
  WHEN 'Red wine' THEN 0.9
  WHEN 'Green smoothie' THEN 18
  ELSE `sugar`
END
WHERE `sugar` IS NULL;

UPDATE `food_catalog`
SET `sodium` = CASE `name`
  WHEN 'Banana' THEN 1
  WHEN 'Apple' THEN 2
  WHEN 'Orange' THEN 0
  WHEN 'Strawberries' THEN 2
  WHEN 'Blueberries' THEN 1
  WHEN 'Grapes' THEN 2
  WHEN 'Mango' THEN 2
  WHEN 'Pineapple' THEN 2
  WHEN 'Watermelon' THEN 2
  WHEN 'Avocado' THEN 7
  WHEN 'Raisins' THEN 4
  WHEN 'Dates' THEN 1
  WHEN 'Boiled egg' THEN 62
  WHEN 'Fried egg' THEN 95
  WHEN 'Egg white' THEN 55
  WHEN 'Omelette (2 eggs)' THEN 350
  WHEN 'Chicken breast, grilled' THEN 74
  WHEN 'Chicken thigh, roasted' THEN 95
  WHEN 'Chicken wings, fried' THEN 900
  WHEN 'Beef steak, grilled' THEN 60
  WHEN 'Ground beef, 85% lean' THEN 72
  WHEN 'Pork chop, grilled' THEN 62
  WHEN 'Bacon' THEN 370
  WHEN 'Salmon, baked' THEN 61
  WHEN 'Tuna, canned in water' THEN 250
  WHEN 'Shrimp, steamed' THEN 220
  WHEN 'Tilapia, cooked' THEN 56
  WHEN 'Turkey breast, sliced' THEN 1000
  WHEN 'Tofu, firm' THEN 14
  WHEN 'Tempeh' THEN 9
  WHEN 'Lentils, cooked' THEN 4
  WHEN 'Black beans, cooked' THEN 2
  WHEN 'Chickpeas, cooked' THEN 11
  WHEN 'Kidney beans, cooked' THEN 4
  WHEN 'Edamame' THEN 9
  WHEN 'Hummus' THEN 115
  WHEN 'White rice, cooked' THEN 2
  WHEN 'Brown rice, cooked' THEN 10
  WHEN 'Quinoa, cooked' THEN 13
  WHEN 'Pasta, cooked' THEN 1
  WHEN 'Spaghetti with tomato sauce' THEN 650
  WHEN 'Mac and cheese' THEN 800
  WHEN 'Ramen, instant' THEN 1700
  WHEN 'Bread, white' THEN 150
  WHEN 'Bread, whole wheat' THEN 140
  WHEN 'Bagel, plain' THEN 450
  WHEN 'Croissant' THEN 270
  WHEN 'Tortilla, flour' THEN 330
  WHEN 'Pancakes' THEN 400
  WHEN 'French toast' THEN 600
  WHEN 'Waffles' THEN 480
  WHEN 'Oatmeal, cooked' THEN 115
  WHEN 'Breakfast cereal, flakes' THEN 200
  WHEN 'Granola' THEN 100
  WHEN 'Milk, whole' THEN 105
  WHEN 'Milk, skim' THEN 103
  WHEN 'Almond milk, unsweetened' THEN 170
  WHEN 'Greek yogurt, plain' THEN 85
  WHEN 'Yogurt, fruit-flavored' THEN 140
  WHEN 'Cheddar cheese' THEN 180
  WHEN 'Mozzarella' THEN 175
  WHEN 'Cottage cheese' THEN 400
  WHEN 'Cream cheese' THEN 90
  WHEN 'Butter' THEN 90
  WHEN 'Peanut butter' THEN 150
  WHEN 'Almonds' THEN 0
  WHEN 'Walnuts' THEN 1
  WHEN 'Cashews' THEN 3
  WHEN 'Mixed nuts' THEN 90
  WHEN 'Trail mix' THEN 80
  WHEN 'Pizza, cheese' THEN 640
  WHEN 'Cheeseburger' THEN 1050
  WHEN 'Beef burrito' THEN 1100
  WHEN 'Chicken taco' THEN 500
  WHEN 'Chicken sandwich, fried' THEN 1200
  WHEN 'Hot dog' THEN 800
  WHEN 'Club sandwich' THEN 900
  WHEN 'Turkey sandwich' THEN 1400
  WHEN 'Sushi roll, salmon' THEN 500
  WHEN 'Pad thai' THEN 1600
  WHEN 'Fried rice' THEN 800
  WHEN 'Chicken curry with rice' THEN 1000
  WHEN 'Caesar salad with chicken' THEN 1000
  WHEN 'Greek salad' THEN 800
  WHEN 'French fries' THEN 270
  WHEN 'Potato chips' THEN 150
  WHEN 'Mashed potatoes' THEN 630
  WHEN 'Baked potato' THEN 17
  WHEN 'Sweet potato, baked' THEN 41
  WHEN 'Corn on the cob' THEN 1
  WHEN 'Broccoli, steamed' THEN 64
  WHEN 'Carrots, raw' THEN 88
  WHEN 'Mixed greens salad' THEN 30
  WHEN 'Tomato soup' THEN 700
  WHEN 'Chicken noodle soup' THEN 850
  WHEN 'Chocolate chip cookie' THEN 100
  WHEN 'Brownie' THEN 140
  WHEN 'Ice cream, vanilla' THEN 53
  WHEN 'Donut, glazed' THEN 260
  WHEN 'Muffin, blueberry' THEN 340
  WHEN 'Cake, chocolate' THEN 300
  WHEN 'Energy bar' THEN 120
  WHEN 'Protein shake, whey' THEN 100
  WHEN 'Protein bar' THEN 200
  WHEN 'Dark chocolate' THEN 6
  WHEN 'Honey' THEN 1
  WHEN 'Black coffee' THEN 5
  WHEN 'Latte' THEN 150
  WHEN 'Orange juice' THEN 2
  WHEN 'Cola' THEN 15
  WHEN 'Diet cola' THEN 40
  WHEN 'Beer' THEN 14
  WHEN 'Red wine' THEN 6
  WHEN 'Green smoothie' THEN 50
  ELSE `sodium`
END
WHERE `sodium` IS NULL;

UPDATE `food_catalog`
SET `category` = CASE `name`
  WHEN 'Banana' THEN 'fruit'
  WHEN 'Apple' THEN 'fruit'
  WHEN 'Orange' THEN 'fruit'
  WHEN 'Strawberries' THEN 'fruit'
  WHEN 'Blueberries' THEN 'fruit'
  WHEN 'Grapes' THEN 'fruit'
  WHEN 'Mango' THEN 'fruit'
  WHEN 'Pineapple' THEN 'fruit'
  WHEN 'Watermelon' THEN 'fruit'
  WHEN 'Avocado' THEN 'fruit'
  WHEN 'Raisins' THEN 'fruit'
  WHEN 'Dates' THEN 'fruit'
  WHEN 'Boiled egg' THEN 'egg'
  WHEN 'Fried egg' THEN 'egg'
  WHEN 'Egg white' THEN 'egg'
  WHEN 'Omelette (2 eggs)' THEN 'egg'
  WHEN 'Chicken breast, grilled' THEN 'poultry'
  WHEN 'Chicken thigh, roasted' THEN 'poultry'
  WHEN 'Chicken wings, fried' THEN 'poultry'
  WHEN 'Beef steak, grilled' THEN 'meat'
  WHEN 'Ground beef, 85% lean' THEN 'meat'
  WHEN 'Pork chop, grilled' THEN 'meat'
  WHEN 'Bacon' THEN 'meat'
  WHEN 'Salmon, baked' THEN 'seafood'
  WHEN 'Tuna, canned in water' THEN 'seafood'
  WHEN 'Shrimp, steamed' THEN 'seafood'
  WHEN 'Tilapia, cooked' THEN 'seafood'
  WHEN 'Turkey breast, sliced' THEN 'poultry'
  WHEN 'Tofu, firm' THEN 'plant_protein'
  WHEN 'Tempeh' THEN 'plant_protein'
  WHEN 'Lentils, cooked' THEN 'plant_protein'
  WHEN 'Black beans, cooked' THEN 'plant_protein'
  WHEN 'Chickpeas, cooked' THEN 'plant_protein'
  WHEN 'Kidney beans, cooked' THEN 'plant_protein'
  WHEN 'Edamame' THEN 'plant_protein'
  WHEN 'Hummus' THEN 'plant_protein'
  WHEN 'White rice, cooked' THEN 'grain'
  WHEN 'Brown rice, cooked' THEN 'grain'
  WHEN 'Quinoa, cooked' THEN 'grain'
  WHEN 'Pasta, cooked' THEN 'grain'
  WHEN 'Spaghetti with tomato sauce' THEN 'dish'
  WHEN 'Mac and cheese' THEN 'dish'
  WHEN 'Ramen, instant' THEN 'noodles'
  WHEN 'Bread, white' THEN 'bread'
  WHEN 'Bread, whole wheat' THEN 'bread'
  WHEN 'Bagel, plain' THEN 'bread'
  WHEN 'Croissant' THEN 'bread'
  WHEN 'Tortilla, flour' THEN 'bread'
  WHEN 'Pancakes' THEN 'breakfast'
  WHEN 'French toast' THEN 'breakfast'
  WHEN 'Waffles' THEN 'breakfast'
  WHEN 'Oatmeal, cooked' THEN 'breakfast'
  WHEN 'Breakfast cereal, flakes' THEN 'breakfast'
  WHEN 'Granola' THEN 'breakfast'
  WHEN 'Milk, whole' THEN 'dairy'
  WHEN 'Milk, skim' THEN 'dairy'
  WHEN 'Almond milk, unsweetened' THEN 'drink'
  WHEN 'Greek yogurt, plain' THEN 'dairy'
  WHEN 'Yogurt, fruit-flavored' THEN 'dairy'
  WHEN 'Cheddar cheese' THEN 'dairy'
  WHEN 'Mozzarella' THEN 'dairy'
  WHEN 'Cottage cheese' THEN 'dairy'
  WHEN 'Cream cheese' THEN 'dairy'
  WHEN 'Butter' THEN 'fat'
  WHEN 'Peanut butter' THEN 'nuts'
  WHEN 'Almonds' THEN 'nuts'
  WHEN 'Walnuts' THEN 'nuts'
  WHEN 'Cashews' THEN 'nuts'
  WHEN 'Mixed nuts' THEN 'nuts'
  WHEN 'Trail mix' THEN 'snack'
  WHEN 'Pizza, cheese' THEN 'fast_food'
  WHEN 'Cheeseburger' THEN 'fast_food'
  WHEN 'Beef burrito' THEN 'fast_food'
  WHEN 'Chicken taco' THEN 'fast_food'
  WHEN 'Chicken sandwich, fried' THEN 'fast_food'
  WHEN 'Hot dog' THEN 'fast_food'
  WHEN 'Club sandwich' THEN 'fast_food'
  WHEN 'Turkey sandwich' THEN 'fast_food'
  WHEN 'Sushi roll, salmon' THEN 'dish'
  WHEN 'Pad thai' THEN 'noodles'
  WHEN 'Fried rice' THEN 'grain'
  WHEN 'Chicken curry with rice' THEN 'dish'
  WHEN 'Caesar salad with chicken' THEN 'salad'
  WHEN 'Greek salad' THEN 'salad'
  WHEN 'French fries' THEN 'snack'
  WHEN 'Potato chips' THEN 'snack'
  WHEN 'Mashed potatoes' THEN 'vegetable'
  WHEN 'Baked potato' THEN 'vegetable'
  WHEN 'Sweet potato, baked' THEN 'vegetable'
  WHEN 'Corn on the cob' THEN 'vegetable'
  WHEN 'Broccoli, steamed' THEN 'vegetable'
  WHEN 'Carrots, raw' THEN 'vegetable'
  WHEN 'Mixed greens salad' THEN 'salad'
  WHEN 'Tomato soup' THEN 'soup'
  WHEN 'Chicken noodle soup' THEN 'soup'
  WHEN 'Chocolate chip cookie' THEN 'dessert'
  WHEN 'Brownie' THEN 'dessert'
  WHEN 'Ice cream, vanilla' THEN 'dessert'
  WHEN 'Donut, glazed' THEN 'dessert'
  WHEN 'Muffin, blueberry' THEN 'dessert'
  WHEN 'Cake, chocolate' THEN 'dessert'
  WHEN 'Energy bar' THEN 'snack'
  WHEN 'Protein shake, whey' THEN 'supplement'
  WHEN 'Protein bar' THEN 'supplement'
  WHEN 'Dark chocolate' THEN 'dessert'
  WHEN 'Honey' THEN 'sweetener'
  WHEN 'Black coffee' THEN 'drink'
  WHEN 'Latte' THEN 'drink'
  WHEN 'Orange juice' THEN 'drink'
  WHEN 'Cola' THEN 'drink'
  WHEN 'Diet cola' THEN 'drink'
  WHEN 'Beer' THEN 'drink'
  WHEN 'Red wine' THEN 'drink'
  WHEN 'Green smoothie' THEN 'drink'
  ELSE `category`
END
WHERE `category` IS NULL;

UPDATE `food_catalog`
SET `prep_method` = CASE `name`
  WHEN 'Banana' THEN 'raw'
  WHEN 'Apple' THEN 'raw'
  WHEN 'Orange' THEN 'raw'
  WHEN 'Strawberries' THEN 'raw'
  WHEN 'Blueberries' THEN 'raw'
  WHEN 'Grapes' THEN 'raw'
  WHEN 'Mango' THEN 'raw'
  WHEN 'Pineapple' THEN 'raw'
  WHEN 'Watermelon' THEN 'raw'
  WHEN 'Avocado' THEN 'raw'
  WHEN 'Raisins' THEN 'dried'
  WHEN 'Dates' THEN 'dried'
  WHEN 'Boiled egg' THEN 'boiled'
  WHEN 'Fried egg' THEN 'fried'
  WHEN 'Egg white' THEN 'boiled'
  WHEN 'Omelette (2 eggs)' THEN 'pan_fried'
  WHEN 'Chicken breast, grilled' THEN 'grilled'
  WHEN 'Chicken thigh, roasted' THEN 'roasted'
  WHEN 'Chicken wings, fried' THEN 'deep_fried'
  WHEN 'Beef steak, grilled' THEN 'grilled'
  WHEN 'Ground beef, 85% lean' THEN 'pan_fried'
  WHEN 'Pork chop, grilled' THEN 'grilled'
  WHEN 'Bacon' THEN 'fried'
  WHEN 'Salmon, baked' THEN 'baked'
  WHEN 'Tuna, canned in water' THEN 'canned'
  WHEN 'Shrimp, steamed' THEN 'steamed'
  WHEN 'Tilapia, cooked' THEN 'baked'
  WHEN 'Turkey breast, sliced' THEN 'processed'
  WHEN 'Tofu, firm' THEN 'raw'
  WHEN 'Tempeh' THEN 'fermented'
  WHEN 'Lentils, cooked' THEN 'boiled'
  WHEN 'Black beans, cooked' THEN 'boiled'
  WHEN 'Chickpeas, cooked' THEN 'boiled'
  WHEN 'Kidney beans, cooked' THEN 'boiled'
  WHEN 'Edamame' THEN 'boiled'
  WHEN 'Hummus' THEN 'blended'
  WHEN 'White rice, cooked' THEN 'boiled'
  WHEN 'Brown rice, cooked' THEN 'boiled'
  WHEN 'Quinoa, cooked' THEN 'boiled'
  WHEN 'Pasta, cooked' THEN 'boiled'
  WHEN 'Spaghetti with tomato sauce' THEN 'simmered'
  WHEN 'Mac and cheese' THEN 'baked'
  WHEN 'Ramen, instant' THEN 'boiled'
  WHEN 'Bread, white' THEN 'baked'
  WHEN 'Bread, whole wheat' THEN 'baked'
  WHEN 'Bagel, plain' THEN 'baked'
  WHEN 'Croissant' THEN 'baked'
  WHEN 'Tortilla, flour' THEN 'baked'
  WHEN 'Pancakes' THEN 'pan_fried'
  WHEN 'French toast' THEN 'pan_fried'
  WHEN 'Waffles' THEN 'baked'
  WHEN 'Oatmeal, cooked' THEN 'boiled'
  WHEN 'Breakfast cereal, flakes' THEN 'packaged'
  WHEN 'Granola' THEN 'baked'
  WHEN 'Milk, whole' THEN 'none'
  WHEN 'Milk, skim' THEN 'none'
  WHEN 'Almond milk, unsweetened' THEN 'none'
  WHEN 'Greek yogurt, plain' THEN 'none'
  WHEN 'Yogurt, fruit-flavored' THEN 'none'
  WHEN 'Cheddar cheese' THEN 'none'
  WHEN 'Mozzarella' THEN 'none'
  WHEN 'Cottage cheese' THEN 'none'
  WHEN 'Cream cheese' THEN 'none'
  WHEN 'Butter' THEN 'none'
  WHEN 'Peanut butter' THEN 'blended'
  WHEN 'Almonds' THEN 'raw'
  WHEN 'Walnuts' THEN 'raw'
  WHEN 'Cashews' THEN 'roasted'
  WHEN 'Mixed nuts' THEN 'roasted'
  WHEN 'Trail mix' THEN 'packaged'
  WHEN 'Pizza, cheese' THEN 'baked'
  WHEN 'Cheeseburger' THEN 'grilled'
  WHEN 'Beef burrito' THEN 'none'
  WHEN 'Chicken taco' THEN 'none'
  WHEN 'Chicken sandwich, fried' THEN 'deep_fried'
  WHEN 'Hot dog' THEN 'grilled'
  WHEN 'Club sandwich' THEN 'none'
  WHEN 'Turkey sandwich' THEN 'none'
  WHEN 'Sushi roll, salmon' THEN 'raw'
  WHEN 'Pad thai' THEN 'stir_fried'
  WHEN 'Fried rice' THEN 'stir_fried'
  WHEN 'Chicken curry with rice' THEN 'simmered'
  WHEN 'Caesar salad with chicken' THEN 'raw'
  WHEN 'Greek salad' THEN 'raw'
  WHEN 'French fries' THEN 'deep_fried'
  WHEN 'Potato chips' THEN 'deep_fried'
  WHEN 'Mashed potatoes' THEN 'boiled'
  WHEN 'Baked potato' THEN 'baked'
  WHEN 'Sweet potato, baked' THEN 'baked'
  WHEN 'Corn on the cob' THEN 'boiled'
  WHEN 'Broccoli, steamed' THEN 'steamed'
  WHEN 'Carrots, raw' THEN 'raw'
  WHEN 'Mixed greens salad' THEN 'raw'
  WHEN 'Tomato soup' THEN 'simmered'
  WHEN 'Chicken noodle soup' THEN 'simmered'
  WHEN 'Chocolate chip cookie' THEN 'baked'
  WHEN 'Brownie' THEN 'baked'
  WHEN 'Ice cream, vanilla' THEN 'frozen'
  WHEN 'Donut, glazed' THEN 'deep_fried'
  WHEN 'Muffin, blueberry' THEN 'baked'
  WHEN 'Cake, chocolate' THEN 'baked'
  WHEN 'Energy bar' THEN 'packaged'
  WHEN 'Protein shake, whey' THEN 'blended'
  WHEN 'Protein bar' THEN 'packaged'
  WHEN 'Dark chocolate' THEN 'packaged'
  WHEN 'Honey' THEN 'none'
  WHEN 'Black coffee' THEN 'brewed'
  WHEN 'Latte' THEN 'brewed'
  WHEN 'Orange juice' THEN 'none'
  WHEN 'Cola' THEN 'packaged'
  WHEN 'Diet cola' THEN 'packaged'
  WHEN 'Beer' THEN 'packaged'
  WHEN 'Red wine' THEN 'packaged'
  WHEN 'Green smoothie' THEN 'blended'
  ELSE `prep_method`
END
WHERE `prep_method` IS NULL;

UPDATE `food_catalog`
SET `description` = CASE `name`
  WHEN 'Banana' THEN 'Soft, sweet fruit rich in potassium. Quick energy before a workout.'
  WHEN 'Apple' THEN 'Crisp fruit with fiber in the skin that keeps you full longer.'
  WHEN 'Orange' THEN 'Juicy citrus fruit high in vitamin C.'
  WHEN 'Strawberries' THEN 'Low-calorie berries rich in vitamin C and antioxidants.'
  WHEN 'Blueberries' THEN 'Small berries packed with antioxidants.'
  WHEN 'Grapes' THEN 'Sweet, hydrating fruit. Easy to overeat, so watch the portion.'
  WHEN 'Mango' THEN 'Sweet tropical fruit (like the Philippine carabao mango) with vitamins A and C.'
  WHEN 'Pineapple' THEN 'Tangy tropical fruit with vitamin C and the enzyme bromelain.'
  WHEN 'Watermelon' THEN 'Mostly water, very light and refreshing after training.'
  WHEN 'Avocado' THEN 'Creamy fruit rich in healthy monounsaturated fat and fiber.'
  WHEN 'Raisins' THEN 'Dried grapes. Concentrated natural sugar in a small handful.'
  WHEN 'Dates' THEN 'Very sweet dried fruit. Fast carbs, best in small amounts.'
  WHEN 'Boiled egg' THEN 'Whole egg cooked in its shell with no added oil. Complete protein.'
  WHEN 'Fried egg' THEN 'Egg cooked in oil, which adds fat compared with boiled.'
  WHEN 'Egg white' THEN 'Almost pure protein with no fat.'
  WHEN 'Omelette (2 eggs)' THEN 'Beaten eggs cooked in a pan with a little oil or butter.'
  WHEN 'Chicken breast, grilled' THEN 'Lean, high-protein meat cooked without added oil.'
  WHEN 'Chicken thigh, roasted' THEN 'Juicier dark meat with more fat than breast.'
  WHEN 'Chicken wings, fried' THEN 'Breaded or battered wings fried in oil. High in fat and salt.'
  WHEN 'Beef steak, grilled' THEN 'Red meat high in protein, iron and zinc.'
  WHEN 'Ground beef, 85% lean' THEN 'Minced beef browned in a pan. Drain the fat to cut calories.'
  WHEN 'Pork chop, grilled' THEN 'Pork loin grilled without breading. Good protein.'
  WHEN 'Bacon' THEN 'Cured, salted pork belly. Small portion, lots of fat and sodium.'
  WHEN 'Salmon, baked' THEN 'Fatty fish rich in omega-3 fats and protein.'
  WHEN 'Tuna, canned in water' THEN 'Lean fish protein. Rinse it to reduce the salt.'
  WHEN 'Shrimp, steamed' THEN 'Very lean protein cooked without oil.'
  WHEN 'Tilapia, cooked' THEN 'Mild white fish, lean and high in protein.'
  WHEN 'Turkey breast, sliced' THEN 'Deli-style sliced turkey. Lean, but salty from curing.'
  WHEN 'Tofu, firm' THEN 'Soybean curd. Plant protein that takes on any flavor.'
  WHEN 'Tempeh' THEN 'Fermented soybean cake with protein and fiber.'
  WHEN 'Lentils, cooked' THEN 'Legume rich in protein, fiber and iron.'
  WHEN 'Black beans, cooked' THEN 'High-fiber beans with plant protein.'
  WHEN 'Chickpeas, cooked' THEN 'Garbanzo beans with protein and slow-digesting carbs.'
  WHEN 'Kidney beans, cooked' THEN 'Hearty beans with protein and fiber.'
  WHEN 'Edamame' THEN 'Young soybeans. One of the best plant proteins.'
  WHEN 'Hummus' THEN 'Chickpea and sesame dip with olive oil.'
  WHEN 'White rice, cooked' THEN 'Staple carbohydrate of most Filipino meals. Watch the number of cups.'
  WHEN 'Brown rice, cooked' THEN 'Whole-grain rice with more fiber than white rice.'
  WHEN 'Quinoa, cooked' THEN 'Seed-like grain with complete protein and fiber.'
  WHEN 'Pasta, cooked' THEN 'Plain boiled pasta. Calories depend mostly on the sauce.'
  WHEN 'Spaghetti with tomato sauce' THEN 'Pasta with tomato-based sauce.'
  WHEN 'Mac and cheese' THEN 'Pasta in cheese sauce. Rich in fat and sodium.'
  WHEN 'Ramen, instant' THEN 'Fried instant noodles with a seasoning packet. Very high in sodium. Use half the packet.'
  WHEN 'Bread, white' THEN 'Refined-flour bread. Digests quickly.'
  WHEN 'Bread, whole wheat' THEN 'Whole-grain bread with more fiber.'
  WHEN 'Bagel, plain' THEN 'Dense bread ring. About the carbs of 3 to 4 slices of bread.'
  WHEN 'Croissant' THEN 'Buttery, flaky pastry. High in saturated fat.'
  WHEN 'Tortilla, flour' THEN 'Flat wheat wrap used for burritos and tacos.'
  WHEN 'Pancakes' THEN 'Batter cakes cooked on a griddle. Syrup adds a lot of sugar.'
  WHEN 'French toast' THEN 'Egg-soaked bread fried in butter.'
  WHEN 'Waffles' THEN 'Crisp batter cakes. Toppings decide the sugar.'
  WHEN 'Oatmeal, cooked' THEN 'Whole oats cooked in water. Slow-release energy and fiber.'
  WHEN 'Breakfast cereal, flakes' THEN 'Ready-to-eat cereal. Check the label, many are sugary.'
  WHEN 'Granola' THEN 'Toasted oats with oil and sweetener. Calorie-dense.'
  WHEN 'Milk, whole' THEN 'Full-fat milk with protein and calcium. Sugar is natural lactose.'
  WHEN 'Milk, skim' THEN 'Fat-free milk with the same protein as whole milk.'
  WHEN 'Almond milk, unsweetened' THEN 'Low-calorie plant milk. Little protein.'
  WHEN 'Greek yogurt, plain' THEN 'Strained yogurt, very high in protein.'
  WHEN 'Yogurt, fruit-flavored' THEN 'Sweetened yogurt. Much of the carbs are added sugar.'
  WHEN 'Cheddar cheese' THEN 'Aged cheese with protein and calcium, but salty and fatty.'
  WHEN 'Mozzarella' THEN 'Mild, soft cheese.'
  WHEN 'Cottage cheese' THEN 'Soft cheese high in slow-digesting protein.'
  WHEN 'Cream cheese' THEN 'Spreadable cheese that is mostly fat.'
  WHEN 'Butter' THEN 'Dairy fat. Mostly saturated fat.'
  WHEN 'Peanut butter' THEN 'Ground peanuts. Healthy fats but calorie-dense.'
  WHEN 'Almonds' THEN 'Nuts with healthy fats, vitamin E and fiber.'
  WHEN 'Walnuts' THEN 'Nuts rich in omega-3 fats.'
  WHEN 'Cashews' THEN 'Creamy nuts with healthy fats.'
  WHEN 'Mixed nuts' THEN 'Roasted, often salted nut mix.'
  WHEN 'Trail mix' THEN 'Nuts, dried fruit and sometimes chocolate. Easy to overeat.'
  WHEN 'Pizza, cheese' THEN 'Bread base with tomato sauce and cheese. Salty.'
  WHEN 'Cheeseburger' THEN 'Beef patty, cheese and bun. High in fat and sodium.'
  WHEN 'Beef burrito' THEN 'Flour tortilla with beef, rice and beans.'
  WHEN 'Chicken taco' THEN 'Tortilla with chicken and toppings.'
  WHEN 'Chicken sandwich, fried' THEN 'Breaded fried chicken in a bun. Oily and salty.'
  WHEN 'Hot dog' THEN 'Processed sausage in a bun. High in sodium.'
  WHEN 'Club sandwich' THEN 'Layered sandwich with deli meat, bacon and mayo.'
  WHEN 'Turkey sandwich' THEN 'Deli turkey in bread. Salty from the processed meat.'
  WHEN 'Sushi roll, salmon' THEN 'Rice rolled with salmon and seaweed. Soy sauce adds sodium.'
  WHEN 'Pad thai' THEN 'Stir-fried rice noodles with a sweet-salty sauce.'
  WHEN 'Fried rice' THEN 'Rice stir-fried in oil with soy sauce.'
  WHEN 'Chicken curry with rice' THEN 'Chicken simmered in spiced curry sauce, served with rice.'
  WHEN 'Caesar salad with chicken' THEN 'Greens with chicken. The creamy dressing adds most of the fat.'
  WHEN 'Greek salad' THEN 'Vegetables with feta and olive oil.'
  WHEN 'French fries' THEN 'Potato strips deep-fried in oil. Oily and calorie-dense.'
  WHEN 'Potato chips' THEN 'Thin fried potato slices. Oily and salty.'
  WHEN 'Mashed potatoes' THEN 'Boiled potatoes mashed with butter and milk.'
  WHEN 'Baked potato' THEN 'Whole potato baked in its skin. Filling and low in fat.'
  WHEN 'Sweet potato, baked' THEN 'Kamote. Fiber, vitamin A and slow carbs.'
  WHEN 'Corn on the cob' THEN 'Boiled sweet corn. Fiber and carbs.'
  WHEN 'Broccoli, steamed' THEN 'Steamed green vegetable with fiber and vitamin C. Very low calorie.'
  WHEN 'Carrots, raw' THEN 'Crunchy vegetable rich in vitamin A.'
  WHEN 'Mixed greens salad' THEN 'Leafy greens. Almost no calories before dressing.'
  WHEN 'Tomato soup' THEN 'Smooth tomato soup. Canned versions are salty.'
  WHEN 'Chicken noodle soup' THEN 'Broth with chicken and noodles. Light but salty.'
  WHEN 'Chocolate chip cookie' THEN 'Butter cookie with chocolate chips.'
  WHEN 'Brownie' THEN 'Dense chocolate cake square. High in sugar.'
  WHEN 'Ice cream, vanilla' THEN 'Frozen dairy dessert with sugar and fat.'
  WHEN 'Donut, glazed' THEN 'Fried dough with sugar glaze. Oily and sugary.'
  WHEN 'Muffin, blueberry' THEN 'Bakery muffin. Closer to cake than bread.'
  WHEN 'Cake, chocolate' THEN 'Frosted chocolate cake. High in sugar.'
  WHEN 'Energy bar' THEN 'Packaged bar for quick energy.'
  WHEN 'Protein shake, whey' THEN 'Whey protein mixed with water. Fast protein after training.'
  WHEN 'Protein bar' THEN 'Packaged bar with added protein.'
  WHEN 'Dark chocolate' THEN 'Cocoa-rich chocolate (70%+). Less sugar than milk chocolate.'
  WHEN 'Honey' THEN 'Natural sweetener. Still counts as added sugar.'
  WHEN 'Black coffee' THEN 'Plain brewed coffee. Nearly zero calories.'
  WHEN 'Latte' THEN 'Espresso with steamed milk. Sugar comes from milk and syrups.'
  WHEN 'Orange juice' THEN 'Fruit juice without the fiber of whole fruit.'
  WHEN 'Cola' THEN 'Sugar-sweetened soft drink. About 10 teaspoons of sugar.'
  WHEN 'Diet cola' THEN 'Artificially sweetened soft drink with no calories.'
  WHEN 'Beer' THEN 'Alcoholic drink. Calories come mostly from alcohol.'
  WHEN 'Red wine' THEN 'Alcoholic drink. Calories come mostly from alcohol.'
  WHEN 'Green smoothie' THEN 'Blended fruit and greens.'
  ELSE `description`
END
WHERE `description` IS NULL;

-- Common Filipino dishes (typical home / carinderia servings).
INSERT IGNORE INTO `food_catalog`
  (`name`, `serving_label`, `serving_grams`, `calories`, `protein`, `carbs`, `fat`, `sugar`, `sodium`, `category`, `prep_method`, `description`) VALUES
('Chicken adobo', '1 cup (2 pcs)', 200, 380, 32, 4, 26, 2, 1100, 'dish', 'stewed', 'Chicken braised in soy sauce, vinegar, garlic and bay leaf. High in protein but salty from the soy sauce.'),
('Pork adobo', '1 cup', 200, 520, 28, 4, 44, 2, 1200, 'dish', 'stewed', 'Pork belly braised in soy sauce and vinegar. Rich, fatty and salty.'),
('Sinigang na baboy', '1 bowl', 400, 330, 24, 12, 20, 4, 1300, 'soup', 'simmered', 'Sour tamarind soup with pork, kangkong, radish and string beans.'),
('Sinigang na hipon', '1 bowl', 400, 180, 22, 12, 4, 4, 1200, 'soup', 'simmered', 'Sour tamarind soup with shrimp and vegetables. Light and lean.'),
('Tinolang manok', '1 bowl', 400, 260, 28, 10, 12, 3, 900, 'soup', 'simmered', 'Ginger chicken soup with green papaya and malunggay leaves. Light and protein-rich.'),
('Nilagang baka', '1 bowl', 400, 380, 30, 18, 20, 4, 900, 'soup', 'boiled', 'Boiled beef soup with potatoes, cabbage and pechay.'),
('Bulalo', '1 bowl', 400, 520, 34, 10, 38, 2, 1100, 'soup', 'boiled', 'Beef shank and bone-marrow soup with corn and cabbage. Rich and fatty.'),
('Kare-kare', '1 cup', 250, 520, 28, 14, 40, 5, 700, 'dish', 'stewed', 'Oxtail and vegetables in peanut sauce. The bagoong (shrimp paste) on the side adds a lot of sodium.'),
('Pork sisig', '1 cup', 150, 480, 22, 4, 42, 1, 900, 'dish', 'pan_fried', 'Chopped grilled pork face and ears sizzled with onion, chili and calamansi. Very oily.'),
('Lechon kawali', '100 g', 100, 430, 18, 0, 40, 0, 500, 'meat', 'deep_fried', 'Boiled then deep-fried pork belly. Crispy, oily and high in saturated fat.'),
('Lechon (roast pork)', '100 g', 100, 380, 22, 0, 32, 0, 600, 'meat', 'roasted', 'Whole spit-roasted pork with crispy skin. Festive and fatty.'),
('Crispy pata', '150 g', 150, 600, 30, 0, 53, 0, 700, 'meat', 'deep_fried', 'Deep-fried pork leg. One of the most oily Filipino dishes.'),
('Pork menudo', '1 cup', 250, 380, 22, 16, 25, 7, 1000, 'dish', 'stewed', 'Pork and liver stewed in tomato sauce with potatoes, carrots and raisins.'),
('Beef caldereta', '1 cup', 250, 420, 30, 14, 27, 6, 1000, 'dish', 'stewed', 'Beef stewed in tomato sauce with liver spread, potatoes and bell pepper.'),
('Chicken afritada', '1 cup', 250, 330, 26, 14, 18, 7, 900, 'dish', 'stewed', 'Chicken stewed in tomato sauce with potatoes, carrots and peppers.'),
('Beef mechado', '1 cup', 250, 400, 30, 12, 26, 6, 1000, 'dish', 'stewed', 'Beef braised in tomato and soy sauce.'),
('Bicol express', '1 cup', 200, 560, 18, 8, 50, 3, 900, 'dish', 'stewed', 'Pork in coconut milk with chili and shrimp paste. Very high in saturated fat.'),
('Laing', '1 cup', 180, 300, 8, 14, 25, 3, 700, 'vegetable', 'stewed', 'Dried taro leaves simmered in coconut milk with chili.'),
('Pinakbet', '1 cup', 200, 160, 8, 16, 8, 6, 800, 'vegetable', 'sauteed', 'Sauteed vegetables (squash, okra, eggplant, ampalaya) with shrimp paste.'),
('Ginisang monggo', '1 cup', 250, 260, 15, 34, 7, 3, 600, 'plant_protein', 'stewed', 'Mung bean stew with garlic and leafy greens. Good plant protein and fiber.'),
('Chopsuey', '1 cup', 200, 150, 10, 14, 6, 6, 700, 'vegetable', 'stir_fried', 'Stir-fried mixed vegetables with a little meat or quail eggs.'),
('Tortang talong', '1 piece', 150, 220, 10, 8, 16, 4, 400, 'dish', 'pan_fried', 'Grilled eggplant dipped in egg and pan-fried.'),
('Ginataang kalabasa at sitaw', '1 cup', 200, 250, 5, 18, 19, 7, 500, 'vegetable', 'stewed', 'Squash and string beans in coconut milk.'),
('Kangkong adobo', '1 cup', 150, 120, 4, 8, 8, 2, 700, 'vegetable', 'sauteed', 'Water spinach cooked adobo-style in soy and vinegar.'),
('Ginisang ampalaya with egg', '1 cup', 180, 170, 9, 8, 11, 3, 500, 'vegetable', 'sauteed', 'Bitter gourd sauteed with tomato and egg.'),
('Dinuguan', '1 cup', 250, 400, 30, 6, 28, 2, 1000, 'dish', 'stewed', 'Pork stewed in pork blood and vinegar. Rich in iron.'),
('Pancit canton', '1 cup', 200, 360, 14, 46, 13, 4, 1100, 'noodles', 'stir_fried', 'Stir-fried egg noodles with vegetables and meat.'),
('Pancit bihon', '1 cup', 200, 300, 12, 44, 8, 3, 900, 'noodles', 'stir_fried', 'Stir-fried rice noodles with vegetables and chicken.'),
('Pancit palabok', '1 plate', 300, 480, 18, 62, 18, 4, 1100, 'noodles', 'boiled', 'Rice noodles with shrimp sauce, egg, chicharon and tinapa flakes.'),
('Instant pancit canton', '1 pack', 80, 380, 7, 50, 17, 4, 1300, 'noodles', 'boiled', 'Packaged fried noodles. Very high in sodium.'),
('Pinoy spaghetti', '1 plate', 300, 520, 20, 70, 18, 18, 1000, 'noodles', 'simmered', 'Sweet-style spaghetti with banana ketchup and hotdog slices. High in sugar.'),
('Lumpiang shanghai', '5 pieces', 100, 320, 12, 22, 21, 2, 450, 'snack', 'deep_fried', 'Thin spring rolls with ground pork, deep-fried. Oily.'),
('Lumpiang sariwa', '1 roll', 200, 230, 7, 32, 8, 10, 450, 'vegetable', 'raw', 'Fresh vegetable spring roll with a sweet peanut-garlic sauce.'),
('Lumpiang gulay', '1 piece', 100, 190, 4, 22, 10, 3, 300, 'snack', 'deep_fried', 'Vegetable spring roll fried in oil.'),
('Tapsilog', '1 plate', 400, 720, 38, 72, 30, 6, 1400, 'breakfast', 'fried', 'Beef tapa, garlic fried rice (sinangag) and a fried egg.'),
('Longsilog', '1 plate', 380, 780, 26, 80, 38, 16, 1300, 'breakfast', 'fried', 'Sweet pork longganisa, garlic rice and fried egg. High in sugar and sodium.'),
('Tocilog', '1 plate', 380, 740, 28, 86, 30, 22, 1100, 'breakfast', 'fried', 'Sweet cured pork (tocino), garlic rice and fried egg.'),
('Bangsilog', '1 plate', 400, 700, 38, 70, 29, 1, 1000, 'breakfast', 'fried', 'Fried marinated milkfish (bangus), garlic rice and egg. Good omega-3 fats.'),
('Cornsilog', '1 plate', 350, 650, 25, 62, 33, 1, 1400, 'breakfast', 'fried', 'Corned beef, garlic rice and fried egg. Very salty.'),
('Garlic fried rice (sinangag)', '1 cup', 180, 300, 5, 50, 8, 0.2, 350, 'grain', 'stir_fried', 'Day-old rice fried with garlic and oil.'),
('Daing na bangus', '1/2 fish', 150, 300, 30, 2, 19, 0, 800, 'seafood', 'fried', 'Milkfish marinated in vinegar and garlic, then fried.'),
('Inihaw na bangus', '150 g', 150, 250, 32, 0, 13, 0, 150, 'seafood', 'grilled', 'Grilled milkfish stuffed with tomato and onion. Lean and rich in omega-3.'),
('Rellenong bangus', '1 slice', 150, 320, 22, 8, 22, 3, 650, 'seafood', 'fried', 'Deboned milkfish stuffed with its own flesh and vegetables, then fried.'),
('Fried tilapia', '1 whole', 200, 340, 40, 3, 18, 0, 400, 'seafood', 'fried', 'Whole tilapia fried in oil.'),
('Paksiw na isda', '1 piece', 200, 220, 30, 4, 9, 1, 900, 'seafood', 'simmered', 'Fish simmered in vinegar, garlic and ginger. No frying.'),
('Tuyo', '3 pieces', 30, 90, 18, 0, 2, 0, 1500, 'seafood', 'fried', 'Salted dried fish. Extremely high in sodium, so eat small amounts.'),
('Inihaw na liempo', '150 g', 150, 520, 26, 6, 44, 5, 700, 'meat', 'grilled', 'Grilled marinated pork belly. Grilled, but still very fatty.'),
('Chicken inasal', '1 leg quarter', 200, 400, 38, 3, 26, 2, 750, 'poultry', 'grilled', 'Bacolod-style chicken marinated in calamansi and annatto, then grilled.'),
('Pork barbecue', '2 sticks', 120, 320, 22, 14, 20, 12, 700, 'meat', 'grilled', 'Sweet soy-marinated grilled pork skewers. The glaze adds sugar.'),
('Filipino fried chicken', '1 thigh', 130, 330, 22, 10, 22, 0.5, 600, 'poultry', 'deep_fried', 'Seasoned chicken fried in oil, fast-food style.'),
('Filipino red hotdog', '1 piece', 45, 140, 5, 5, 11, 4, 500, 'meat', 'fried', 'Sweet red processed hotdog. High in sodium.'),
('Corned beef with rice', '1 plate', 350, 600, 25, 60, 28, 1, 1400, 'dish', 'sauteed', 'Canned corned beef sauteed with onion, served with rice.'),
('Arroz caldo', '1 bowl', 350, 330, 16, 46, 9, 1, 900, 'soup', 'simmered', 'Rice porridge with chicken, ginger and egg. Comforting and easy to digest.'),
('Lugaw', '1 bowl', 350, 180, 4, 38, 1, 0.3, 500, 'grain', 'boiled', 'Plain rice porridge. Light and gentle on the stomach.'),
('Goto', '1 bowl', 350, 340, 14, 40, 13, 1, 950, 'soup', 'simmered', 'Rice porridge with beef tripe and ginger.'),
('Champorado', '1 bowl', 300, 380, 7, 72, 8, 32, 150, 'dessert', 'boiled', 'Chocolate rice porridge, often topped with milk. High in sugar.'),
('Pandesal', '2 pieces', 60, 170, 5, 30, 3, 4, 280, 'bread', 'baked', 'Soft, slightly sweet breakfast bread rolls.'),
('Ensaymada', '1 piece', 80, 320, 6, 38, 16, 15, 230, 'bread', 'baked', 'Soft brioche topped with butter, sugar and cheese.'),
('Siopao asado', '1 piece', 150, 380, 14, 56, 11, 14, 650, 'snack', 'steamed', 'Steamed bun filled with sweet braised pork.'),
('Pork siomai', '4 pieces', 100, 220, 12, 14, 13, 2, 550, 'snack', 'steamed', 'Steamed pork dumplings. Soy sauce dip adds sodium.'),
('Kwek-kwek', '5 pieces', 100, 280, 9, 20, 18, 2, 300, 'snack', 'deep_fried', 'Quail eggs in orange batter, deep-fried street food.'),
('Fish balls', '10 pieces', 100, 220, 8, 22, 11, 3, 600, 'snack', 'deep_fried', 'Fried street-food fish balls, usually with sweet or spicy sauce.'),
('Chicharon', '1 oz', 28.3, 155, 17, 0, 9, 0, 520, 'snack', 'deep_fried', 'Deep-fried pork rind. Crunchy, oily and salty.'),
('Taho', '1 cup', 250, 200, 8, 38, 2, 28, 20, 'dessert', 'steamed', 'Silken tofu with arnibal (brown sugar syrup) and sago pearls.'),
('Turon', '1 piece', 90, 230, 1.5, 40, 8, 22, 10, 'dessert', 'deep_fried', 'Banana and jackfruit in a spring roll wrapper, fried with caramelized sugar.'),
('Banana cue', '1 stick', 150, 300, 1.5, 58, 8, 38, 5, 'dessert', 'deep_fried', 'Saba bananas deep-fried and coated in brown sugar.'),
('Kamote cue', '1 stick', 150, 280, 2, 50, 8, 26, 50, 'dessert', 'deep_fried', 'Sweet potato fried with brown sugar.'),
('Halo-halo', '1 glass', 350, 420, 7, 80, 9, 62, 120, 'dessert', 'frozen', 'Shaved ice with sweet beans, fruits, leche flan, ube and milk. Very high in sugar.'),
('Leche flan', '1 slice', 100, 280, 6, 40, 10, 38, 80, 'dessert', 'steamed', 'Steamed egg-and-milk custard with caramel.'),
('Bibingka', '1 piece', 120, 330, 7, 50, 12, 20, 300, 'dessert', 'baked', 'Rice cake baked in banana leaves, topped with salted egg and cheese.'),
('Puto', '3 pieces', 90, 200, 4, 42, 2, 14, 200, 'dessert', 'steamed', 'Steamed rice cakes. Low in fat.'),
('Kutsinta', '3 pieces', 90, 180, 1, 42, 0.5, 18, 60, 'dessert', 'steamed', 'Steamed brown rice cakes with grated coconut.'),
('Biko', '1 slice', 100, 290, 3, 52, 8, 26, 30, 'dessert', 'simmered', 'Sticky rice cooked in coconut milk and brown sugar.'),
('Buko juice', '1 glass', 240, 45, 1.7, 9, 0.5, 6, 250, 'drink', 'none', 'Fresh coconut water. Natural electrolytes for after training.'),
('Calamansi juice', '1 glass', 240, 90, 0.2, 24, 0, 21, 5, 'drink', 'none', 'Sweetened Philippine lime juice with vitamin C.'),
('Sago''t gulaman', '1 glass', 350, 190, 0, 48, 0, 40, 20, 'drink', 'none', 'Brown sugar drink with tapioca pearls and gelatin. Mostly sugar.');
