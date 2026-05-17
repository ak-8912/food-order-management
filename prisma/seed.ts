import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();

  await prisma.menuItem.createMany({
    data: [
      {
        name: "Margherita Pizza",
        description: "Classic cheese pizza",
        price: 299,
        image: "/food/pizza.jpg",
      },
      {
        name: "Veg Burger",
        description: "Loaded veg burger",
        price: 199,
        image: "/food/burger.jpg",
      },
      // --- STARTERS & APPETIZERS ---
      {
        name: "Garlic Bread sticks",
        description: "Baked dough sticks brushed with garlic butter and herbs",
        price: 129,
        image: "/food/garlic_bread.jpg",
      },
      {
        name: "French Fries",
        description: "Crispy golden potato fries lightly salted",
        price: 99,
        image: "/food/fries.jpg",
      },
      {
        name: "Mozzarella Sticks",
        description: "Deep-fried cheesy goodness served with marinara sauce",
        price: 179,
        image: "/food/mozzarella_sticks.jpg",
      },
      {
        name: "Bruschetta",
        description:
          "Toasted bread topped with tomatoes, garlic, and olive oil",
        price: 149,
        image: "/food/bruschetta.jpg",
      },
      {
        name: "Spring Rolls",
        description: "Crispy pastry sheets filled with spiced vegetables",
        price: 139,
        image: "/food/spring_rolls.jpg",
      },
      {
        name: "Paneer Tikka",
        description: "Marinated cottage cheese cubes grilled in a tandoor",
        price: 229,
        image: "/food/paneer_tikka.jpg",
      },
      {
        name: "Onion Rings",
        description: "Batter-fried crispy onion rings served with dip",
        price: 119,
        image: "/food/onion_rings.jpg",
      },

      // --- MAIN COURSES ---
      {
        name: "Pepperoni Pizza",
        description: "Classic pizza topped with spicy pepperoni and mozzarella",
        price: 399,
        image: "/food/pepperoni_pizza.jpg",
      },
      {
        name: "Pasta Alfredo",
        description: "Fettuccine tossed in rich, creamy parmesan cheese sauce",
        price: 289,
        image: "/food/pasta_alfredo.jpg",
      },
      {
        name: "Pasta Arrabbiata",
        description: "Spicy tomato sauce pasta with garlic and chili flakes",
        price: 269,
        image: "/food/pasta_arrabbiata.jpg",
      },
      {
        name: "Paneer Butter Masala",
        description: "Cottage cheese cubes in a rich and creamy tomato gravy",
        price: 279,
        image: "/food/paneer_butter_masala.jpg",
      },
      {
        name: "Dal Makhani",
        description: "Slow-cooked black lentils with cream and butter",
        price: 219,
        image: "/food/dal_makhani.jpg",
      },
      {
        name: "Vegetable Lasagna",
        description: "Layered pasta with roasted veggies, sauce, and cheese",
        price: 319,
        image: "/food/veg_lasagna.jpg",
      },
      // --- SALADS & SOUPS ---
      {
        name: "Caesar Salad",
        description: "Crisp romaine lettuce, croutons, and parmesan dressing",
        price: 189,
        image: "/food/caesar_salad.jpg",
      },
      {
        name: "Greek Salad",
        description:
          "Cucumbers, tomatoes, olives, and feta cheese in olive oil",
        price: 199,
        image: "/food/greek_salad.jpg",
      },
      {
        name: "Tomato Basil Soup",
        description: "Creamy roasted tomato soup garnished with fresh basil",
        price: 129,
        image: "/food/tomato_soup.jpg",
      },

      // --- DESSERTS ---
      {
        name: "Chocolate Brownie",
        description: "Rich, fudgy chocolate brownie served warm",
        price: 149,
        image: "/food/brownie.jpg",
      },
      {
        name: "New York Cheesecake",
        description: "Classic creamy cheesecake with a graham cracker crust",
        price: 199,
        image: "/food/cheesecake.jpg",
      },
      {
        name: "Tiramisu",
        description: "Coffee-flavoured Italian dessert layered with mascarpone",
        price: 219,
        image: "/food/tiramisu.jpg",
      },
      {
        name: "Apple Pie",
        description: "Warm pie crust filled with spiced apples",
        price: 159,
        image: "/food/apple_pie.jpg",
      },
      {
        name: "Churros",
        description:
          "Fried dough pastries dusted in cinnamon sugar with chocolate dip",
        price: 139,
        image: "/food/churros.jpg",
      },
      {
        name: "Molten Lava Cake",
        description: "Decadent chocolate cake with a liquid chocolate center",
        price: 179,
        image: "/food/lava_cake.jpg",
      },

      // --- BEVERAGES ---
      {
        name: "Iced Latte",
        description: "Chilled espresso blended with milk and ice",
        price: 149,
        image: "/food/iced_latte.jpg",
      },
      {
        name: "Mango Smoothie",
        description: "Creamy blend of fresh mangoes and yogurt",
        price: 169,
        image: "/food/mango_smoothie.jpg",
      },
      {
        name: "Virgin Mojito",
        description: "Refreshing mix of lime, mint, sugar, and club soda",
        price: 129,
        image: "/food/mojito.jpg",
      },
      {
        name: "Chocolate Milkshake",
        description:
          "Thick and creamy shake made with rich chocolate ice cream",
        price: 159,
        image: "/food/chocolate_shake.jpg",
      },
      {
        name: "Lemon Iced Tea",
        description: "Brewed black tea infused with lemon and served chilled",
        price: 119,
        image: "/food/iced_tea.jpg",
      },
      {
        name: "Hot Cappuccino",
        description: "Classic espresso shot topped with steamed milk foam",
        price: 139,
        image: "/food/cappuccino.jpg",
      },
      {
        name: "Berry Blast Mocktail",
        description:
          "A fizzy medley of strawberries, blueberries, and cranberries",
        price: 159,
        image: "/food/berry_mocktail.jpg",
      },
      {
        name: "Fresh Orange Juice",
        description: "100% pure squeezed oranges with no added sugar",
        price: 139,
        image: "/food/orange_juice.jpg",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
