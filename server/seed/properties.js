/**
 * 15 realistic listings across Delhi, Noida, Gurugram, Pune and Bangalore.
 * ownerIndex maps to the owner accounts created in seed.js (0, 1 or 2).
 */
const image = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const GALLERIES = [
  [image('1522708323590-d24dbb6b0267'), image('1560448204-e02f11c3d0e2'), image('1560185007-5f0bb1866cab')],
  [image('1502672260266-1c1ef2d93688'), image('1493809842364-78817add7ffb'), image('1505691938895-1758d7feb511')],
  [image('1484154218962-a197022b5858'), image('1556911220-bff31c812dba'), image('1513694203232-719a280e022f')],
  [image('1522771739844-6a9f6d5f14af'), image('1586023492125-27b2c045efd7'), image('1567767292278-a4f21aa2d36e')],
  [image('1512917774080-9991f1c4c750'), image('1540518614846-7eded433c457'), image('1598928506311-c55ded91a20c')]
];

const gallery = (i) => GALLERIES[i % GALLERIES.length];

const properties = [
  {
    ownerIndex: 0,
    title: 'Premium Student PG Near GTB Nagar',
    description:
      'A well maintained PG a five minute walk from GTB Nagar metro and ten minutes from North Campus. Single occupancy rooms with study table, high speed WiFi and three home style meals a day. Ideal for DU students who want a quiet place to study.',
    propertyType: 'PG', roomType: 'Single', rent: 9500, securityDeposit: 15000,
    city: 'Delhi', locality: 'GTB Nagar', address: 'Block C, Outram Lines, GTB Nagar, Delhi 110009',
    latitude: 28.6989, longitude: 77.2066,
    amenities: ['WiFi', 'AC', 'Food', 'Laundry', 'CCTV', 'Study Table', 'Power Backup'],
    furnishing: 'Fully Furnished', foodAvailable: true, genderPreference: 'Male', images: gallery(0)
  },
  {
    ownerIndex: 0,
    title: 'Furnished Single Room Near Noida Sector 62',
    description:
      'Bright single room in a gated society opposite the Sector 62 IT park. Comes with a cot, wardrobe, study desk and an attached washroom. Perfect for working professionals at HCL, Adobe or TCS.',
    propertyType: 'Room', roomType: 'Single', rent: 11000, securityDeposit: 20000,
    city: 'Noida', locality: 'Sector 62', address: 'C-52, Sector 62, Noida, Uttar Pradesh 201309',
    latitude: 28.6274, longitude: 77.3716,
    amenities: ['WiFi', 'AC', 'Parking', 'Power Backup', 'Attached Washroom', 'Lift', 'Security Guard'],
    furnishing: 'Fully Furnished', foodAvailable: false, genderPreference: 'Any', images: gallery(1)
  },
  {
    ownerIndex: 1,
    title: 'Girls PG With Meals in Laxmi Nagar',
    description:
      'Safe and secure girls-only PG close to Laxmi Nagar metro station. Double sharing rooms, biometric entry, CCTV on every floor and a warden on site. Breakfast, lunch and dinner are included in the rent.',
    propertyType: 'PG', roomType: 'Double', rent: 8000, securityDeposit: 12000,
    city: 'Delhi', locality: 'Laxmi Nagar', address: 'Gali No 4, Laxmi Nagar, Delhi 110092',
    latitude: 28.6304, longitude: 77.2773,
    amenities: ['WiFi', 'Food', 'CCTV', 'Laundry', 'Housekeeping', 'Water Purifier', 'Security Guard'],
    furnishing: 'Semi Furnished', foodAvailable: true, genderPreference: 'Female', images: gallery(2)
  },
  {
    ownerIndex: 1,
    title: '2BHK Flat for Sharing in Gurugram Sector 45',
    description:
      'Spacious two bedroom flat available on a sharing basis in a family society near Huda City Centre. Modular kitchen, balcony with a park view, covered parking and 24x7 power backup.',
    propertyType: 'Flat', roomType: 'Shared', rent: 16500, securityDeposit: 30000,
    city: 'Gurugram', locality: 'Sector 45', address: 'Tower B, Sector 45, Gurugram, Haryana 122003',
    latitude: 28.4460, longitude: 77.0641,
    amenities: ['WiFi', 'AC', 'Parking', 'Lift', 'Power Backup', 'Gym', 'Security Guard'],
    furnishing: 'Semi Furnished', foodAvailable: false, genderPreference: 'Any', images: gallery(3)
  },
  {
    ownerIndex: 2,
    title: 'Budget Boys PG Near Kothrud Depot',
    description:
      'Affordable triple sharing PG for students of MIT and Cummins College. Walking distance from Kothrud bus depot, with WiFi, RO water, daily cleaning and a common study room.',
    propertyType: 'PG', roomType: 'Triple', rent: 6500, securityDeposit: 8000,
    city: 'Pune', locality: 'Kothrud', address: 'Near Kothrud Depot, Paud Road, Pune 411038',
    latitude: 18.5074, longitude: 73.8077,
    amenities: ['WiFi', 'Food', 'Laundry', 'Water Purifier', 'Housekeeping', 'Study Table'],
    furnishing: 'Semi Furnished', foodAvailable: true, genderPreference: 'Male', images: gallery(4)
  },
  {
    ownerIndex: 2,
    title: 'Modern Studio Apartment in Koramangala',
    description:
      'Fully furnished studio in the heart of Koramangala 5th Block. Air conditioned, with a kitchenette, washing machine and fibre broadband. Startups, cafes and the metro are all within a kilometre.',
    propertyType: 'Apartment', roomType: 'Single', rent: 19000, securityDeposit: 38000,
    city: 'Bangalore', locality: 'Koramangala', address: '5th Block, Koramangala, Bengaluru 560095',
    latitude: 12.9352, longitude: 77.6245,
    amenities: ['WiFi', 'AC', 'Parking', 'Lift', 'Power Backup', 'Refrigerator', 'Attached Washroom'],
    furnishing: 'Fully Furnished', foodAvailable: false, genderPreference: 'Any', images: gallery(0)
  },
  {
    ownerIndex: 0,
    title: 'Co-living PG Near Hauz Khas Metro',
    description:
      'Contemporary co-living space with private rooms and shared lounges. Weekly housekeeping, community dinners on Sundays and a rooftop workspace. Five minutes from Hauz Khas metro.',
    propertyType: 'PG', roomType: 'Single', rent: 14000, securityDeposit: 25000,
    city: 'Delhi', locality: 'Hauz Khas', address: 'Aurobindo Marg, Hauz Khas, New Delhi 110016',
    latitude: 28.5494, longitude: 77.2001,
    amenities: ['WiFi', 'AC', 'Food', 'Housekeeping', 'CCTV', 'Gym', 'Laundry'],
    furnishing: 'Fully Furnished', foodAvailable: true, genderPreference: 'Any', images: gallery(1)
  },
  {
    ownerIndex: 1,
    title: 'Double Sharing PG in Noida Sector 18',
    description:
      'Centrally located PG next to the Atta Market and DLF Mall of India. Double sharing rooms with AC, hot water, lift access and unlimited WiFi. Metro is a four minute walk.',
    propertyType: 'PG', roomType: 'Double', rent: 10500, securityDeposit: 15000,
    city: 'Noida', locality: 'Sector 18', address: 'A-11, Sector 18, Noida, Uttar Pradesh 201301',
    latitude: 28.5706, longitude: 77.3261,
    amenities: ['WiFi', 'AC', 'Food', 'Lift', 'CCTV', 'Laundry', 'Power Backup'],
    furnishing: 'Fully Furnished', foodAvailable: true, genderPreference: 'Female', images: gallery(2)
  },
  {
    ownerIndex: 1,
    title: '1RK Near Cyber City Gurugram',
    description:
      'Compact one room kitchen suited to a single working professional. Ten minutes from Cyber City on the rapid metro, with a dedicated parking slot and a small balcony.',
    propertyType: 'Room', roomType: 'Single', rent: 13500, securityDeposit: 27000,
    city: 'Gurugram', locality: 'DLF Phase 3', address: 'U Block, DLF Phase 3, Gurugram, Haryana 122010',
    latitude: 28.4949, longitude: 77.0926,
    amenities: ['WiFi', 'AC', 'Parking', 'Power Backup', 'Attached Washroom', 'Security Guard'],
    furnishing: 'Semi Furnished', foodAvailable: false, genderPreference: 'Any', images: gallery(3)
  },
  {
    ownerIndex: 2,
    title: 'Student PG Near Viman Nagar Pune',
    description:
      'Clean and quiet PG close to Symbiosis and Phoenix Marketcity. Single rooms with attached washroom, home cooked vegetarian meals and a 24 hour security guard.',
    propertyType: 'PG', roomType: 'Single', rent: 9000, securityDeposit: 14000,
    city: 'Pune', locality: 'Viman Nagar', address: 'Lane 6, Viman Nagar, Pune 411014',
    latitude: 18.5679, longitude: 73.9143,
    amenities: ['WiFi', 'Food', 'CCTV', 'Housekeeping', 'Attached Washroom', 'Study Table'],
    furnishing: 'Fully Furnished', foodAvailable: true, genderPreference: 'Female', images: gallery(4)
  },
  {
    ownerIndex: 2,
    title: 'Shared Flat for Techies in Whitefield',
    description:
      'Three bedroom flat shared by working professionals, one room currently free. Located in a gated community with a pool and gym, five minutes from ITPL and the Whitefield metro line.',
    propertyType: 'Flat', roomType: 'Shared', rent: 12500, securityDeposit: 25000,
    city: 'Bangalore', locality: 'Whitefield', address: 'Hope Farm Junction, Whitefield, Bengaluru 560066',
    latitude: 12.9698, longitude: 77.7500,
    amenities: ['WiFi', 'AC', 'Parking', 'Gym', 'Lift', 'Power Backup', 'Housekeeping'],
    furnishing: 'Semi Furnished', foodAvailable: false, genderPreference: 'Male', images: gallery(0)
  },
  {
    ownerIndex: 0,
    title: 'Affordable Room Near Mukherjee Nagar',
    description:
      'Budget friendly room in the heart of the UPSC coaching hub. Quiet building, study table and chair provided, RO water on every floor and libraries within walking distance.',
    propertyType: 'Room', roomType: 'Double', rent: 7000, securityDeposit: 10000,
    city: 'Delhi', locality: 'Mukherjee Nagar', address: 'Batra Cinema Road, Mukherjee Nagar, Delhi 110009',
    latitude: 28.7041, longitude: 77.2100,
    amenities: ['WiFi', 'Study Table', 'Water Purifier', 'Power Backup', 'CCTV'],
    furnishing: 'Semi Furnished', foodAvailable: false, genderPreference: 'Male', images: gallery(1)
  },
  {
    ownerIndex: 1,
    title: 'Executive PG in Noida Sector 137',
    description:
      'Premium PG for working professionals on the Noida Expressway. Single AC rooms, buffet meals, in-house gym and a shuttle to the nearest metro station every morning.',
    propertyType: 'PG', roomType: 'Single', rent: 15500, securityDeposit: 20000,
    city: 'Noida', locality: 'Sector 137', address: 'Expressway, Sector 137, Noida, Uttar Pradesh 201305',
    latitude: 28.5013, longitude: 77.4079,
    amenities: ['WiFi', 'AC', 'Food', 'Gym', 'Laundry', 'Lift', 'Power Backup', 'CCTV'],
    furnishing: 'Fully Furnished', foodAvailable: true, genderPreference: 'Any', images: gallery(2)
  },
  {
    ownerIndex: 2,
    title: 'Girls Hostel Near Baner Pune',
    description:
      'Girls hostel with triple sharing rooms, mess facility and a strict 10pm entry policy. Close to the IT parks in Baner and Balewadi, with a bus stop right outside the gate.',
    propertyType: 'PG', roomType: 'Triple', rent: 7500, securityDeposit: 10000,
    city: 'Pune', locality: 'Baner', address: 'Baner Road, Pune 411045',
    latitude: 18.5590, longitude: 73.7868,
    amenities: ['WiFi', 'Food', 'CCTV', 'Laundry', 'Water Purifier', 'Security Guard', 'Housekeeping'],
    furnishing: 'Semi Furnished', foodAvailable: true, genderPreference: 'Female', images: gallery(3)
  },
  {
    ownerIndex: 0,
    title: 'Unfurnished 1BHK Near HSR Layout',
    description:
      'Independent one bedroom flat on the first floor of a quiet residential building. Unfurnished, so you can bring your own setup. Water supply is round the clock and the owner lives on site.',
    propertyType: 'Flat', roomType: 'Single', rent: 17000, securityDeposit: 34000,
    city: 'Bangalore', locality: 'HSR Layout', address: 'Sector 2, HSR Layout, Bengaluru 560102',
    latitude: 12.9121, longitude: 77.6446,
    amenities: ['Parking', 'Power Backup', 'Water Purifier', 'Security Guard'],
    furnishing: 'Unfurnished', foodAvailable: false, genderPreference: 'Any', images: gallery(4)
  }
];

module.exports = properties;
