const initialMenuItems = [
  {
    name: 'Crispy Masala Dosa',
    category: 'Breakfast',
    price: 60,
    description: 'Golden roasted crepe stuffed with seasoned potato masala, served with coconut chutney & sambar.',
    isAvailable: true,
    preparationTime: 10,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    ratingCount: 42,
    isPopular: true,
    tags: ['Bestseller', 'Campus Favorite']
  },
  {
    name: 'Steamed Idli Sambar (2 Pcs)',
    category: 'Breakfast',
    price: 45,
    description: 'Fluffy steamed rice and lentil cakes served with freshly ground chutney and hot vegetable sambar.',
    isAvailable: true,
    preparationTime: 5,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    ratingCount: 28,
    isPopular: false,
    tags: ['Quick Bite', 'Healthy']
  },
  {
    name: 'Chole Bhature Platter',
    category: 'Breakfast',
    price: 80,
    description: 'Two fluffy golden bhature served with spicy chickpea curry, pickled onions, and green chilies.',
    isAvailable: true,
    preparationTime: 12,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    ratingCount: 65,
    isPopular: true,
    tags: ['Bestseller', 'Heavy Bite']
  },
  {
    name: 'Veg Dum Biryani with Raita',
    category: 'Lunch',
    price: 110,
    description: 'Aromatic basmati rice cooked with fresh seasonal vegetables and saffron, served with cool cucumber raita.',
    isAvailable: true,
    preparationTime: 15,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    ratingCount: 51,
    isPopular: true,
    tags: ['Chef Special', 'Filling']
  },
  {
    name: 'Paneer Butter Masala Combo',
    category: 'Lunch',
    price: 120,
    description: 'Tender cottage cheese cubes simmered in a silky tomato makhani sauce, served with 2 warm naans.',
    isAvailable: true,
    preparationTime: 15,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    ratingCount: 38,
    isPopular: true,
    tags: ['Popular', 'North Indian']
  },
  {
    name: 'South Indian Mini Thali',
    category: 'Lunch',
    price: 90,
    description: 'Wholesome balanced meal: Rice, Sambar, Rasam, Veg Kootu, Curd, Appalam, and Kesari sweet.',
    isAvailable: true,
    preparationTime: 8,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    ratingCount: 30,
    isPopular: false,
    tags: ['Healthy', 'Traditional']
  },
  {
    name: 'Crispy Aloo Samosa (2 Pcs)',
    category: 'Snacks',
    price: 30,
    description: 'Flaky golden pastry cones filled with spicy potato and green peas, served with tangy tamarind chutney.',
    isAvailable: true,
    preparationTime: 5,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    ratingCount: 89,
    isPopular: true,
    tags: ['Budget Friendly', 'Quick Bite']
  },
  {
    name: 'Schezwan Veg Hakka Noodles',
    category: 'Snacks',
    price: 85,
    description: 'Wok-tossed noodles with shredded cabbage, bell peppers, carrots, and spicy fiery schezwan sauce.',
    isAvailable: true,
    preparationTime: 12,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    ratingCount: 44,
    isPopular: false,
    tags: ['Chinese', 'Spicy']
  },
  {
    name: 'Grilled Cheese Corn Sandwich',
    category: 'Snacks',
    price: 70,
    description: 'Golden toasted bread stuffed with sweet corn kernels, melted cheese, and fresh oregano seasonings.',
    isAvailable: true,
    preparationTime: 10,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    ratingCount: 23,
    isPopular: false,
    tags: ['Cafe Special']
  },
  {
    name: 'Chilled Cold Coffee with Ice Cream',
    category: 'Beverages',
    price: 55,
    description: 'Thick blended iced coffee topped with a creamy scoop of vanilla ice cream and chocolate drizzle.',
    isAvailable: true,
    preparationTime: 5,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    ratingCount: 110,
    isPopular: true,
    tags: ['Campus Favorite', 'Bestseller']
  },
  {
    name: 'Cardamom Cutting Chai',
    category: 'Beverages',
    price: 15,
    description: 'Strong hot milk tea boiled with crushed green cardamom pods and fresh grated ginger.',
    isAvailable: true,
    preparationTime: 3,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    ratingCount: 140,
    isPopular: true,
    tags: ['Essential', 'All Day']
  },
  {
    name: 'Fresh Mint Lime Cooler',
    category: 'Beverages',
    price: 35,
    description: 'Sparkling citrus refresher made with freshly squeezed lemons, mint leaves, and a dash of rock salt.',
    isAvailable: true,
    preparationTime: 4,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    ratingCount: 31,
    isPopular: false,
    tags: ['Refreshing']
  },
  {
    name: 'Warm Gulab Jamun (2 Pcs)',
    category: 'Dessert',
    price: 40,
    description: 'Melt-in-mouth golden milk dumplings soaked in cardamom and rose infused warm sugar syrup.',
    isAvailable: true,
    preparationTime: 3,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    ratingCount: 34,
    isPopular: false,
    tags: ['Sweet Tooth']
  },
  {
    name: 'Paneer Tikka Kathi Roll',
    category: 'Specials',
    price: 95,
    description: 'Tandoori-spiced char-grilled paneer, sliced peppers, and mint chutney wrapped in a flaky paratha.',
    isAvailable: true,
    preparationTime: 12,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    ratingCount: 56,
    isPopular: true,
    tags: ['Chef Choice', 'Today Special']
  }
];

const initialCrowdFeedback = [
  {
    crowdLevel: 'Moderate',
    comment: 'Lunch rush is picking up. Main meal counter has ~6 people.',
    estimatedWait: '5-10 mins',
    studentName: 'Rahul S. (CSE 3rd Yr)',
    studentIdentifier: '21BCSE045',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    crowdLevel: 'Quiet',
    comment: 'Quick service at breakfast. Dosa ready in 4 mins.',
    estimatedWait: '< 5 mins',
    studentName: 'Priya M. (ECE 2nd Yr)',
    studentIdentifier: '22BECE012',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    crowdLevel: 'Moderate',
    comment: 'Beverage & chai counter has a small line, tables available.',
    estimatedWait: '5-10 mins',
    studentName: 'Aditya K. (Mech 4th Yr)',
    studentIdentifier: '20BME088',
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString()
  }
];

const initialReviews = [
  {
    dishName: 'Crispy Masala Dosa',
    studentName: 'Ananya Verma',
    rating: 5,
    comment: 'Best breakfast on campus! Sambar is hot and chutney is made fresh daily.',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    dishName: 'Chilled Cold Coffee with Ice Cream',
    studentName: 'Karthik Raja',
    rating: 5,
    comment: 'Perfect thick coffee after long afternoon lectures. 10/10.',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    dishName: 'Veg Dum Biryani with Raita',
    studentName: 'Sneha Patel',
    rating: 4,
    comment: 'Super filling lunch portion. Saffron aroma was fantastic.',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

const initialOrders = [
  {
    orderNumber: 'CP-101',
    student: {
      name: 'Rohan Sharma',
      studentId: '22BCSE104',
      phone: '9876543210'
    },
    items: [
      {
        menuItemId: 'sample-1',
        name: 'Crispy Masala Dosa',
        price: 60,
        quantity: 1,
        specialInstructions: 'Extra sambar please'
      },
      {
        menuItemId: 'sample-2',
        name: 'Cardamom Cutting Chai',
        price: 15,
        quantity: 1,
        specialInstructions: ''
      }
    ],
    subtotal: 75,
    total: 75,
    pickupTime: '1:00 PM - 1:15 PM',
    pickupCounter: 'Counter #1 (Express Pickup)',
    status: 'Ready for Pickup',
    paymentMethod: 'UPI / Online',
    paymentStatus: 'Paid',
    notes: 'Hot and ready at counter',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    orderNumber: 'CP-102',
    student: {
      name: 'Meera Iyer',
      studentId: '23BIT045',
      phone: '9845123456'
    },
    items: [
      {
        menuItemId: 'sample-3',
        name: 'Schezwan Veg Hakka Noodles',
        price: 85,
        quantity: 1,
        specialInstructions: 'Medium spicy'
      },
      {
        menuItemId: 'sample-4',
        name: 'Fresh Mint Lime Cooler',
        price: 35,
        quantity: 1,
        specialInstructions: 'Less sweet'
      }
    ],
    subtotal: 120,
    total: 120,
    pickupTime: '1:15 PM - 1:30 PM',
    pickupCounter: 'Counter #2 (Snack & Chinese)',
    status: 'Preparing',
    paymentMethod: 'Pay at Counter',
    paymentStatus: 'Pending',
    notes: 'In wok now',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

module.exports = {
  initialMenuItems,
  initialCrowdFeedback,
  initialReviews,
  initialOrders
};

