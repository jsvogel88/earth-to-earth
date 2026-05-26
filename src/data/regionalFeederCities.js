// Regional Hyperloop Feeder Network V1.5

export const regionalFeederCitiesByHub = {
  'New York': {
    'Northeast Corridor': [
      { name: 'Boston', country: 'USA', lat: 42.3601, lon: -71.0589, population: 692600, corridor: 'Northeast Corridor' },
      { name: 'Providence', country: 'USA', lat: 41.8240, lon: -71.4128, population: 190934, corridor: 'Northeast Corridor' },
      { name: 'Hartford', country: 'USA', lat: 41.7658, lon: -72.6734, population: 125017, corridor: 'Northeast Corridor' },
      { name: 'New Haven', country: 'USA', lat: 41.3083, lon: -72.9279, population: 135305, corridor: 'Northeast Corridor' },
      { name: 'Stamford', country: 'USA', lat: 41.0534, lon: -73.5387, population: 135117, corridor: 'Northeast Corridor' },
      { name: 'Philadelphia', country: 'USA', lat: 39.9526, lon: -75.1652, population: 1603797, corridor: 'Northeast Corridor' },
      { name: 'Baltimore', country: 'USA', lat: 39.2904, lon: -76.6122, population: 593490, corridor: 'Northeast Corridor' },
      { name: 'Washington, DC', country: 'USA', lat: 38.9072, lon: -77.0369, population: 705749, corridor: 'Northeast Corridor' },
    ],
    'Upstate / Great Lakes': [
      { name: 'Albany', country: 'USA', lat: 42.6526, lon: -73.7562, population: 97856, corridor: 'Upstate / Great Lakes' },
      { name: 'Syracuse', country: 'USA', lat: 43.0481, lon: -76.1474, population: 145170, corridor: 'Upstate / Great Lakes' },
      { name: 'Rochester', country: 'USA', lat: 43.1629, lon: -77.6100, population: 205356, corridor: 'Upstate / Great Lakes' },
      { name: 'Buffalo', country: 'USA', lat: 42.8864, lon: -78.8784, population: 250604, corridor: 'Upstate / Great Lakes' },
      { name: 'Pittsburgh', country: 'USA', lat: 40.4406, lon: -79.9959, population: 303382, corridor: 'Upstate / Great Lakes' },
      { name: 'Cleveland', country: 'USA', lat: 41.4993, lon: -81.6944, population: 372624, corridor: 'Upstate / Great Lakes' },
      { name: 'Detroit', country: 'USA', lat: 42.3314, lon: -83.0458, population: 672662, corridor: 'Upstate / Great Lakes' },
      { name: 'Columbus', country: 'USA', lat: 39.9612, lon: -82.9988, population: 898553, corridor: 'Upstate / Great Lakes' },
    ],
    'Canada Corridor': [
      { name: 'Toronto', country: 'Canada', lat: 43.6629, lon: -79.3957, population: 2930000, corridor: 'Canada Corridor' },
      { name: 'Ottawa', country: 'Canada', lat: 45.4215, lon: -75.6972, population: 1017449, corridor: 'Canada Corridor' },
      { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673, population: 4275000, corridor: 'Canada Corridor' },
      { name: 'Quebec City', country: 'Canada', lat: 46.8139, lon: -71.2080, population: 542889, corridor: 'Canada Corridor' },
    ],
    'Southeast Reach': [
      { name: 'Richmond', country: 'USA', lat: 37.5407, lon: -77.4360, population: 226610, corridor: 'Southeast Reach' },
      { name: 'Norfolk', country: 'USA', lat: 36.8507, lon: -76.2859, population: 245782, corridor: 'Southeast Reach' },
      { name: 'Raleigh', country: 'USA', lat: 35.7796, lon: -78.6382, population: 467665, corridor: 'Southeast Reach' },
      { name: 'Charlotte', country: 'USA', lat: 35.2271, lon: -80.8431, population: 885708, corridor: 'Southeast Reach' },
    ],
  },

  'Los Angeles': {
    'Southern California': [
      { name: 'San Diego', country: 'USA', lat: 32.7157, lon: -117.1611, population: 1423851, corridor: 'Southern California' },
      { name: 'Irvine', country: 'USA', lat: 33.6846, lon: -117.7289, population: 307670, corridor: 'Southern California' },
      { name: 'Anaheim', country: 'USA', lat: 33.8346, lon: -117.9145, population: 346824, corridor: 'Southern California' },
      { name: 'Long Beach', country: 'USA', lat: 33.7701, lon: -118.1937, population: 466742, corridor: 'Southern California' },
      { name: 'Riverside', country: 'USA', lat: 33.9826, lon: -117.2965, population: 319341, corridor: 'Southern California' },
      { name: 'San Bernardino', country: 'USA', lat: 34.1083, lon: -117.2898, population: 230197, corridor: 'Southern California' },
      { name: 'Palm Springs', country: 'USA', lat: 33.8303, lon: -116.5453, population: 44552, corridor: 'Southern California' },
    ],
    'California Corridor': [
      { name: 'Bakersfield', country: 'USA', lat: 35.3733, lon: -119.0187, population: 403455, corridor: 'California Corridor' },
      { name: 'Fresno', country: 'USA', lat: 36.7469, lon: -119.7726, population: 535007, corridor: 'California Corridor' },
      { name: 'San Jose', country: 'USA', lat: 37.3382, lon: -121.8863, population: 1021795, corridor: 'California Corridor' },
      { name: 'San Francisco', country: 'USA', lat: 37.7749, lon: -122.4194, population: 883305, corridor: 'California Corridor' },
      { name: 'Oakland', country: 'USA', lat: 37.8044, lon: -122.2712, population: 433031, corridor: 'California Corridor' },
      { name: 'Sacramento', country: 'USA', lat: 38.5816, lon: -121.4944, population: 525121, corridor: 'California Corridor' },
    ],
    'Southwest Corridor': [
      { name: 'Las Vegas', country: 'USA', lat: 36.1699, lon: -115.1398, population: 644014, corridor: 'Southwest Corridor' },
      { name: 'Phoenix', country: 'USA', lat: 33.4484, lon: -112.0742, population: 1624569, corridor: 'Southwest Corridor' },
      { name: 'Tucson', country: 'USA', lat: 32.2226, lon: -110.9747, population: 526143, corridor: 'Southwest Corridor' },
      { name: 'Reno', country: 'USA', lat: 39.5296, lon: -119.8138, population: 303527, corridor: 'Southwest Corridor' },
      { name: 'Salt Lake City', country: 'USA', lat: 40.7608, lon: -111.8910, population: 199723, corridor: 'Southwest Corridor' },
    ],
    'Mexico / Baja': [
      { name: 'Tijuana', country: 'Mexico', lat: 32.5149, lon: -117.0382, population: 1810000, corridor: 'Mexico / Baja' },
      { name: 'Mexicali', country: 'Mexico', lat: 32.6267, lon: -115.4521, population: 936826, corridor: 'Mexico / Baja' },
      { name: 'Ensenada', country: 'Mexico', lat: 31.8661, lon: -116.6169, population: 505000, corridor: 'Mexico / Baja' },
    ],
  },

  'San Francisco': {
    'Bay Area': [
      { name: 'Oakland', country: 'USA', lat: 37.8044, lon: -122.2712, population: 433031, corridor: 'Bay Area' },
      { name: 'San Jose', country: 'USA', lat: 37.3382, lon: -121.8863, population: 1021795, corridor: 'Bay Area' },
      { name: 'Palo Alto', country: 'USA', lat: 37.4419, lon: -122.1430, population: 66642, corridor: 'Bay Area' },
      { name: 'Santa Clara', country: 'USA', lat: 37.3549, lon: -121.9525, population: 129178, corridor: 'Bay Area' },
      { name: 'Berkeley', country: 'USA', lat: 37.8716, lon: -122.2727, population: 121780, corridor: 'Bay Area' },
    ],
    'California Corridor': [
      { name: 'Sacramento', country: 'USA', lat: 38.5816, lon: -121.4944, population: 525121, corridor: 'California Corridor' },
      { name: 'Fresno', country: 'USA', lat: 36.7469, lon: -119.7726, population: 535007, corridor: 'California Corridor' },
      { name: 'Bakersfield', country: 'USA', lat: 35.3733, lon: -119.0187, population: 403455, corridor: 'California Corridor' },
      { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437, population: 3990456, corridor: 'California Corridor' },
      { name: 'Long Beach', country: 'USA', lat: 33.7701, lon: -118.1937, population: 466742, corridor: 'California Corridor' },
      { name: 'San Diego', country: 'USA', lat: 32.7157, lon: -117.1611, population: 1423851, corridor: 'California Corridor' },
    ],
    'Pacific Northwest / Interior': [
      { name: 'Portland', country: 'USA', lat: 45.5152, lon: -122.6784, population: 652503, corridor: 'Pacific Northwest / Interior' },
      { name: 'Seattle', country: 'USA', lat: 47.6062, lon: -122.3321, population: 753675, corridor: 'Pacific Northwest / Interior' },
      { name: 'Reno', country: 'USA', lat: 39.5296, lon: -119.8138, population: 303527, corridor: 'Pacific Northwest / Interior' },
      { name: 'Las Vegas', country: 'USA', lat: 36.1699, lon: -115.1398, population: 644014, corridor: 'Pacific Northwest / Interior' },
      { name: 'Salt Lake City', country: 'USA', lat: 40.7608, lon: -111.8910, population: 199723, corridor: 'Pacific Northwest / Interior' },
    ],
    'Cross-Border Reach': [
      { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, population: 661010, corridor: 'Cross-Border Reach' },
      { name: 'Tijuana', country: 'Mexico', lat: 32.5149, lon: -117.0382, population: 1810000, corridor: 'Cross-Border Reach' },
    ],
  },

  'London': {
    'United Kingdom': [
      { name: 'Birmingham', country: 'UK', lat: 52.5086, lon: -1.8755, population: 1141816, corridor: 'United Kingdom' },
      { name: 'Manchester', country: 'UK', lat: 53.4808, lon: -2.2426, population: 547627, corridor: 'United Kingdom' },
      { name: 'Liverpool', country: 'UK', lat: 53.4084, lon: -2.9916, population: 494814, corridor: 'United Kingdom' },
      { name: 'Leeds', country: 'UK', lat: 53.8008, lon: -1.5491, population: 793139, corridor: 'United Kingdom' },
      { name: 'Sheffield', country: 'UK', lat: 53.3811, lon: -1.4701, population: 584853, corridor: 'United Kingdom' },
      { name: 'Bristol', country: 'UK', lat: 51.4545, lon: -2.5879, population: 465377, corridor: 'United Kingdom' },
      { name: 'Cardiff', country: 'UK', lat: 51.4816, lon: -3.1791, population: 362310, corridor: 'United Kingdom' },
      { name: 'Edinburgh', country: 'UK', lat: 55.9533, lon: -3.1883, population: 525990, corridor: 'United Kingdom' },
      { name: 'Glasgow', country: 'UK', lat: 55.8642, lon: -4.2518, population: 633120, corridor: 'United Kingdom' },
    ],
    'Ireland': [
      { name: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603, population: 1256128, corridor: 'Ireland' },
      { name: 'Cork', country: 'Ireland', lat: 51.8973, lon: -8.4863, population: 210772, corridor: 'Ireland' },
      { name: 'Belfast', country: 'UK', lat: 54.5973, lon: -5.9301, population: 337121, corridor: 'Ireland' },
    ],
    'France / Benelux': [
      { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, population: 2161000, corridor: 'France / Benelux' },
      { name: 'Lille', country: 'France', lat: 50.6292, lon: 3.0573, population: 232157, corridor: 'France / Benelux' },
      { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517, population: 1210000, corridor: 'France / Benelux' },
      { name: 'Antwerp', country: 'Belgium', lat: 51.2194, lon: 4.4024, population: 529757, corridor: 'France / Benelux' },
      { name: 'Rotterdam', country: 'Netherlands', lat: 51.9225, lon: 4.4792, population: 638000, corridor: 'France / Benelux' },
      { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, population: 873000, corridor: 'France / Benelux' },
    ],
    'Western Europe Reach': [
      { name: 'Cologne', country: 'Germany', lat: 50.9375, lon: 6.9603, population: 1087863, corridor: 'Western Europe Reach' },
      { name: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821, population: 753056, corridor: 'Western Europe Reach' },
      { name: 'Luxembourg', country: 'Luxembourg', lat: 49.6116, lon: 6.1319, population: 128373, corridor: 'Western Europe Reach' },
      { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5472, population: 415367, corridor: 'Western Europe Reach' },
    ],
  },

  'Tokyo': {
    'Greater Tokyo / Kanto': [
      { name: 'Yokohama', country: 'Japan', lat: 35.4437, lon: 139.6380, population: 3747000, corridor: 'Greater Tokyo / Kanto' },
      { name: 'Kawasaki', country: 'Japan', lat: 35.5308, lon: 139.7029, population: 1540000, corridor: 'Greater Tokyo / Kanto' },
      { name: 'Saitama', country: 'Japan', lat: 35.8617, lon: 139.6455, population: 1264000, corridor: 'Greater Tokyo / Kanto' },
      { name: 'Chiba', country: 'Japan', lat: 35.6073, lon: 140.1062, population: 971000, corridor: 'Greater Tokyo / Kanto' },
      { name: 'Tsukuba', country: 'Japan', lat: 36.2148, lon: 140.1129, population: 235000, corridor: 'Greater Tokyo / Kanto' },
    ],
    'Japanese Megalopolis': [
      { name: 'Nagoya', country: 'Japan', lat: 35.1815, lon: 136.9066, population: 2314000, corridor: 'Japanese Megalopolis' },
      { name: 'Kyoto', country: 'Japan', lat: 35.0116, lon: 135.7681, population: 1463723, corridor: 'Japanese Megalopolis' },
      { name: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023, population: 19222000, corridor: 'Japanese Megalopolis' },
      { name: 'Kobe', country: 'Japan', lat: 34.6901, lon: 135.1955, population: 1544000, corridor: 'Japanese Megalopolis' },
      { name: 'Hiroshima', country: 'Japan', lat: 34.3853, lon: 132.4553, population: 1199391, corridor: 'Japanese Megalopolis' },
      { name: 'Fukuoka', country: 'Japan', lat: 33.5904, lon: 130.4017, population: 1594824, corridor: 'Japanese Megalopolis' },
    ],
    'Northern Japan': [
      { name: 'Sendai', country: 'Japan', lat: 38.2682, lon: 140.8694, population: 1082159, corridor: 'Northern Japan' },
      { name: 'Niigata', country: 'Japan', lat: 37.9250, lon: 139.0365, population: 812000, corridor: 'Northern Japan' },
      { name: 'Sapporo', country: 'Japan', lat: 43.0642, lon: 141.3469, population: 1973395, corridor: 'Northern Japan' },
      { name: 'Hakodate', country: 'Japan', lat: 41.7687, lon: 140.7274, population: 279231, corridor: 'Northern Japan' },
    ],
    'Regional International Reach': [
      { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, population: 9776000, corridor: 'Regional International Reach' },
      { name: 'Busan', country: 'South Korea', lat: 35.1796, lon: 129.0756, population: 3440000, corridor: 'Regional International Reach' },
      { name: 'Taipei', country: 'Taiwan', lat: 25.0330, lon: 121.5654, population: 2704810, corridor: 'Regional International Reach' },
    ],
  },

  'Singapore': {
    'Malaysia': [
      { name: 'Johor Bahru', country: 'Malaysia', lat: 1.4854, lon: 103.7618, population: 500000, corridor: 'Malaysia' },
      { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869, population: 1684000, corridor: 'Malaysia' },
      { name: 'Penang', country: 'Malaysia', lat: 5.4164, lon: 100.3327, population: 763137, corridor: 'Malaysia' },
      { name: 'Malacca', country: 'Malaysia', lat: 2.1896, lon: 102.2501, population: 334000, corridor: 'Malaysia' },
      { name: 'Ipoh', country: 'Malaysia', lat: 4.5921, lon: 101.5901, population: 657892, corridor: 'Malaysia' },
    ],
    'Indonesia': [
      { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456, population: 10770000, corridor: 'Indonesia' },
      { name: 'Bandung', country: 'Indonesia', lat: -6.9175, lon: 107.6062, population: 2393000, corridor: 'Indonesia' },
      { name: 'Surabaya', country: 'Indonesia', lat: -7.2575, lon: 112.7521, population: 2787000, corridor: 'Indonesia' },
      { name: 'Batam', country: 'Indonesia', lat: 1.1449, lon: 104.0087, population: 1270000, corridor: 'Indonesia' },
      { name: 'Medan', country: 'Indonesia', lat: 3.5952, lon: 98.6722, population: 2134400, corridor: 'Indonesia' },
    ],
    'Thailand / Mainland Southeast Asia': [
      { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, population: 8305000, corridor: 'Thailand / Mainland Southeast Asia' },
      { name: 'Phuket', country: 'Thailand', lat: 7.8804, lon: 98.3923, population: 412600, corridor: 'Thailand / Mainland Southeast Asia' },
      { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.7769, lon: 106.7009, population: 9113000, corridor: 'Thailand / Mainland Southeast Asia' },
    ],
    'Regional Island Network': [
      { name: 'Palembang', country: 'Indonesia', lat: -2.9264, lon: 104.7520, population: 1661000, corridor: 'Regional Island Network' },
      { name: 'Pekanbaru', country: 'Indonesia', lat: 0.5404, lon: 101.4477, population: 1000000, corridor: 'Regional Island Network' },
      { name: 'George Town', country: 'Malaysia', lat: 5.3521, lon: 100.3329, population: 745859, corridor: 'Regional Island Network' },
    ],
  },

  'Dubai': {
    'UAE / Gulf Core': [
      { name: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lon: 54.3773, population: 1800000, corridor: 'UAE / Gulf Core' },
      { name: 'Sharjah', country: 'UAE', lat: 25.3548, lon: 55.3888, population: 1500000, corridor: 'UAE / Gulf Core' },
      { name: 'Ajman', country: 'UAE', lat: 25.4090, lon: 55.4361, population: 500000, corridor: 'UAE / Gulf Core' },
      { name: 'Ras Al Khaimah', country: 'UAE', lat: 25.7482, lon: 55.9442, population: 340000, corridor: 'UAE / Gulf Core' },
      { name: 'Al Ain', country: 'UAE', lat: 24.2004, lon: 55.7590, population: 950000, corridor: 'UAE / Gulf Core' },
    ],
    'Saudi / Gulf Corridor': [
      { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, population: 5376000, corridor: 'Saudi / Gulf Corridor' },
      { name: 'Dammam', country: 'Saudi Arabia', lat: 26.4124, lon: 50.0825, population: 640000, corridor: 'Saudi / Gulf Corridor' },
      { name: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.5310, population: 956000, corridor: 'Saudi / Gulf Corridor' },
      { name: 'Manama', country: 'Bahrain', lat: 26.1667, lon: 50.5667, population: 430000, corridor: 'Saudi / Gulf Corridor' },
      { name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lon: 47.9774, population: 3107000, corridor: 'Saudi / Gulf Corridor' },
    ],
    'Oman / Arabian Peninsula': [
      { name: 'Muscat', country: 'Oman', lat: 23.6100, lon: 58.5400, population: 1700000, corridor: 'Oman / Arabian Peninsula' },
      { name: 'Salalah', country: 'Oman', lat: 17.0151, lon: 54.0924, population: 200000, corridor: 'Oman / Arabian Peninsula' },
    ],
    'Regional Reach': [
      { name: 'Tehran', country: 'Iran', lat: 35.6892, lon: 51.3898, population: 8896000, corridor: 'Regional Reach' },
      { name: 'Shiraz', country: 'Iran', lat: 29.5832, lon: 52.5836, population: 1900000, corridor: 'Regional Reach' },
      { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011, population: 15400000, corridor: 'Regional Reach' },
      { name: 'Baghdad', country: 'Iraq', lat: 33.3157, lon: 44.3661, population: 7000000, corridor: 'Regional Reach' },
    ],
  },

  'Hong Kong': {
    'Pearl River Delta': [
      { name: 'Shenzhen', country: 'China', lat: 22.5431, lon: 114.0579, population: 12352000, corridor: 'Pearl River Delta' },
      { name: 'Guangzhou', country: 'China', lat: 23.1291, lon: 113.2644, population: 15301000, corridor: 'Pearl River Delta' },
      { name: 'Dongguan', country: 'China', lat: 23.0431, lon: 113.7633, population: 8000000, corridor: 'Pearl River Delta' },
      { name: 'Foshan', country: 'China', lat: 23.0210, lon: 113.1208, population: 8000000, corridor: 'Pearl River Delta' },
      { name: 'Zhuhai', country: 'China', lat: 22.2833, lon: 113.5667, population: 1702000, corridor: 'Pearl River Delta' },
      { name: 'Macau', country: 'Macau', lat: 22.1982, lon: 113.5439, population: 640000, corridor: 'Pearl River Delta' },
    ],
    'Southern China': [
      { name: 'Xiamen', country: 'China', lat: 24.4798, lon: 118.0894, population: 4200000, corridor: 'Southern China' },
      { name: 'Fuzhou', country: 'China', lat: 26.0745, lon: 119.2965, population: 7200000, corridor: 'Southern China' },
      { name: 'Nanning', country: 'China', lat: 22.8170, lon: 108.3665, population: 6500000, corridor: 'Southern China' },
      { name: 'Changsha', country: 'China', lat: 28.2282, lon: 112.9388, population: 8100000, corridor: 'Southern China' },
    ],
    'East Asia Reach': [
      { name: 'Taipei', country: 'Taiwan', lat: 25.0330, lon: 121.5654, population: 2704810, corridor: 'East Asia Reach' },
      { name: 'Kaohsiung', country: 'Taiwan', lat: 22.6047, lon: 120.2787, population: 1939000, corridor: 'East Asia Reach' },
      { name: 'Hanoi', country: 'Vietnam', lat: 21.0285, lon: 105.8542, population: 8053000, corridor: 'East Asia Reach' },
    ],
    'Mainland Corridor': [
      { name: 'Wuhan', country: 'China', lat: 30.5928, lon: 114.3055, population: 8900000, corridor: 'Mainland Corridor' },
      { name: 'Chongqing', country: 'China', lat: 29.4316, lon: 106.9123, population: 32189000, corridor: 'Mainland Corridor' },
      { name: 'Chengdu', country: 'China', lat: 30.5728, lon: 104.0668, population: 10765000, corridor: 'Mainland Corridor' },
    ],
  },

  'Shanghai': {
    'Yangtze River Delta': [
      { name: 'Suzhou', country: 'China', lat: 31.2989, lon: 120.5954, population: 10600000, corridor: 'Yangtze River Delta' },
      { name: 'Hangzhou', country: 'China', lat: 30.2741, lon: 120.1551, population: 10200000, corridor: 'Yangtze River Delta' },
      { name: 'Nanjing', country: 'China', lat: 32.0603, lon: 118.7969, population: 8300000, corridor: 'Yangtze River Delta' },
      { name: 'Wuxi', country: 'China', lat: 31.5901, lon: 120.3037, population: 7600000, corridor: 'Yangtze River Delta' },
      { name: 'Ningbo', country: 'China', lat: 29.8683, lon: 121.5578, population: 8200000, corridor: 'Yangtze River Delta' },
      { name: 'Hefei', country: 'China', lat: 31.8206, lon: 117.2272, population: 8000000, corridor: 'Yangtze River Delta' },
    ],
    'Eastern China Corridor': [
      { name: 'Qingdao', country: 'China', lat: 36.0671, lon: 120.3826, population: 9400000, corridor: 'Eastern China Corridor' },
      { name: 'Jinan', country: 'China', lat: 36.6519, lon: 117.1205, population: 7360000, corridor: 'Eastern China Corridor' },
      { name: 'Fuzhou', country: 'China', lat: 26.0745, lon: 119.2965, population: 7200000, corridor: 'Eastern China Corridor' },
      { name: 'Xiamen', country: 'China', lat: 24.4798, lon: 118.0894, population: 4200000, corridor: 'Eastern China Corridor' },
    ],
    'China Megacity Reach': [
      { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, population: 21540000, corridor: 'China Megacity Reach' },
      { name: 'Tianjin', country: 'China', lat: 39.0842, lon: 117.2010, population: 15700000, corridor: 'China Megacity Reach' },
      { name: 'Wuhan', country: 'China', lat: 30.5928, lon: 114.3055, population: 8900000, corridor: 'China Megacity Reach' },
      { name: 'Zhengzhou', country: 'China', lat: 34.7466, lon: 113.6253, population: 10000000, corridor: 'China Megacity Reach' },
    ],
    'International Reach': [
      { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, population: 9776000, corridor: 'International Reach' },
      { name: 'Busan', country: 'South Korea', lat: 35.1796, lon: 129.0756, population: 3440000, corridor: 'International Reach' },
      { name: 'Taipei', country: 'Taiwan', lat: 25.0330, lon: 121.5654, population: 2704810, corridor: 'International Reach' },
      { name: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023, population: 19222000, corridor: 'International Reach' },
    ],
  },

  'Paris': {
    'France': [
      { name: 'Lyon', country: 'France', lat: 45.7640, lon: 4.8357, population: 513275, corridor: 'France' },
      { name: 'Marseille', country: 'France', lat: 43.2965, lon: 5.3698, population: 869815, corridor: 'France' },
      { name: 'Toulouse', country: 'France', lat: 43.6047, lon: 1.4442, population: 479553, corridor: 'France' },
      { name: 'Bordeaux', country: 'France', lat: 44.8378, lon: -0.5792, population: 254436, corridor: 'France' },
      { name: 'Lille', country: 'France', lat: 50.6292, lon: 3.0573, population: 232157, corridor: 'France' },
      { name: 'Nantes', country: 'France', lat: 47.2184, lon: -1.5536, population: 309346, corridor: 'France' },
      { name: 'Strasbourg', country: 'France', lat: 48.5734, lon: 7.7521, population: 283205, corridor: 'France' },
      { name: 'Nice', country: 'France', lat: 43.7102, lon: 7.2620, population: 340007, corridor: 'France' },
    ],
    'Benelux / Germany': [
      { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517, population: 1210000, corridor: 'Benelux / Germany' },
      { name: 'Antwerp', country: 'Belgium', lat: 51.2194, lon: 4.4024, population: 529757, corridor: 'Benelux / Germany' },
      { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, population: 873000, corridor: 'Benelux / Germany' },
      { name: 'Rotterdam', country: 'Netherlands', lat: 51.9225, lon: 4.4792, population: 638000, corridor: 'Benelux / Germany' },
      { name: 'Cologne', country: 'Germany', lat: 50.9375, lon: 6.9603, population: 1087863, corridor: 'Benelux / Germany' },
      { name: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821, population: 753056, corridor: 'Benelux / Germany' },
    ],
    'UK / Switzerland': [
      { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, population: 8982000, corridor: 'UK / Switzerland' },
      { name: 'Geneva', country: 'Switzerland', lat: 46.2022, lon: 6.1432, population: 203856, corridor: 'UK / Switzerland' },
      { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5472, population: 415367, corridor: 'UK / Switzerland' },
    ],
    'Southern Europe': [
      { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734, population: 1620343, corridor: 'Southern Europe' },
      { name: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.1900, population: 1352000, corridor: 'Southern Europe' },
      { name: 'Turin', country: 'Italy', lat: 45.0705, lon: 7.6868, population: 870456, corridor: 'Southern Europe' },
    ],
  },

  'Frankfurt': {
    'Germany': [
      { name: 'Cologne', country: 'Germany', lat: 50.9375, lon: 6.9603, population: 1087863, corridor: 'Germany' },
      { name: 'Düsseldorf', country: 'Germany', lat: 51.2277, lon: 6.7735, population: 621877, corridor: 'Germany' },
      { name: 'Stuttgart', country: 'Germany', lat: 48.7758, lon: 9.1829, population: 623738, corridor: 'Germany' },
      { name: 'Munich', country: 'Germany', lat: 48.1351, lon: 11.5820, population: 1484543, corridor: 'Germany' },
      { name: 'Hamburg', country: 'Germany', lat: 53.5511, lon: 9.9937, population: 1852000, corridor: 'Germany' },
      { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, population: 3644000, corridor: 'Germany' },
      { name: 'Leipzig', country: 'Germany', lat: 51.3397, lon: 12.3731, population: 612506, corridor: 'Germany' },
      { name: 'Nuremberg', country: 'Germany', lat: 49.4521, lon: 11.0767, population: 518365, corridor: 'Germany' },
    ],
    'Benelux / France': [
      { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, population: 873000, corridor: 'Benelux / France' },
      { name: 'Rotterdam', country: 'Netherlands', lat: 51.9225, lon: 4.4792, population: 638000, corridor: 'Benelux / France' },
      { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517, population: 1210000, corridor: 'Benelux / France' },
      { name: 'Luxembourg', country: 'Luxembourg', lat: 49.6116, lon: 6.1319, population: 128373, corridor: 'Benelux / France' },
      { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, population: 2161000, corridor: 'Benelux / France' },
      { name: 'Strasbourg', country: 'France', lat: 48.5734, lon: 7.7521, population: 283205, corridor: 'Benelux / France' },
    ],
    'Switzerland / Austria': [
      { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5472, population: 415367, corridor: 'Switzerland / Austria' },
      { name: 'Basel', country: 'Switzerland', lat: 47.5596, lon: 7.5886, population: 175066, corridor: 'Switzerland / Austria' },
      { name: 'Geneva', country: 'Switzerland', lat: 46.2022, lon: 6.1432, population: 203856, corridor: 'Switzerland / Austria' },
      { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738, population: 1920000, corridor: 'Switzerland / Austria' },
      { name: 'Salzburg', country: 'Austria', lat: 47.8095, lon: 13.0550, population: 161995, corridor: 'Switzerland / Austria' },
    ],
    'Central Europe': [
      { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378, population: 1320000, corridor: 'Central Europe' },
      { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122, population: 1863000, corridor: 'Central Europe' },
      { name: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.1900, population: 1352000, corridor: 'Central Europe' },
    ],
  },

  'Amsterdam': {
    'Netherlands / Belgium': [
      { name: 'Rotterdam', country: 'Netherlands', lat: 51.9225, lon: 4.4792, population: 638000, corridor: 'Netherlands / Belgium' },
      { name: 'The Hague', country: 'Netherlands', lat: 52.0705, lon: 4.3007, population: 537387, corridor: 'Netherlands / Belgium' },
      { name: 'Utrecht', country: 'Netherlands', lat: 52.0908, lon: 5.1022, population: 359516, corridor: 'Netherlands / Belgium' },
      { name: 'Eindhoven', country: 'Netherlands', lat: 51.4416, lon: 5.4697, population: 238357, corridor: 'Netherlands / Belgium' },
      { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517, population: 1210000, corridor: 'Netherlands / Belgium' },
      { name: 'Antwerp', country: 'Belgium', lat: 51.2194, lon: 4.4024, population: 529757, corridor: 'Netherlands / Belgium' },
    ],
    'UK / France': [
      { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, population: 8982000, corridor: 'UK / France' },
      { name: 'Manchester', country: 'UK', lat: 53.4808, lon: -2.2426, population: 547627, corridor: 'UK / France' },
      { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, population: 2161000, corridor: 'UK / France' },
      { name: 'Lille', country: 'France', lat: 50.6292, lon: 3.0573, population: 232157, corridor: 'UK / France' },
    ],
    'Germany': [
      { name: 'Cologne', country: 'Germany', lat: 50.9375, lon: 6.9603, population: 1087863, corridor: 'Germany' },
      { name: 'Düsseldorf', country: 'Germany', lat: 51.2277, lon: 6.7735, population: 621877, corridor: 'Germany' },
      { name: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821, population: 753056, corridor: 'Germany' },
      { name: 'Hamburg', country: 'Germany', lat: 53.5511, lon: 9.9937, population: 1852000, corridor: 'Germany' },
      { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, population: 3644000, corridor: 'Germany' },
    ],
    'Northern Europe': [
      { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683, population: 1349000, corridor: 'Northern Europe' },
      { name: 'Luxembourg', country: 'Luxembourg', lat: 49.6116, lon: 6.1319, population: 128373, corridor: 'Northern Europe' },
    ],
  },

  'Toronto': {
    'Canada': [
      { name: 'Hamilton', country: 'Canada', lat: 43.2557, lon: -79.8711, population: 571000, corridor: 'Canada' },
      { name: 'Ottawa', country: 'Canada', lat: 45.4215, lon: -75.6972, population: 1017449, corridor: 'Canada' },
      { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673, population: 4275000, corridor: 'Canada' },
      { name: 'Quebec City', country: 'Canada', lat: 46.8139, lon: -71.2080, population: 542889, corridor: 'Canada' },
      { name: 'London, Ontario', country: 'Canada', lat: 42.9849, lon: -81.2453, population: 402562, corridor: 'Canada' },
      { name: 'Windsor', country: 'Canada', lat: 42.3149, lon: -83.0364, population: 217188, corridor: 'Canada' },
    ],
    'Great Lakes USA': [
      { name: 'Detroit', country: 'USA', lat: 42.3314, lon: -83.0458, population: 672662, corridor: 'Great Lakes USA' },
      { name: 'Cleveland', country: 'USA', lat: 41.4993, lon: -81.6944, population: 372624, corridor: 'Great Lakes USA' },
      { name: 'Columbus', country: 'USA', lat: 39.9612, lon: -82.9988, population: 898553, corridor: 'Great Lakes USA' },
      { name: 'Pittsburgh', country: 'USA', lat: 40.4406, lon: -79.9959, population: 303382, corridor: 'Great Lakes USA' },
      { name: 'Buffalo', country: 'USA', lat: 42.8864, lon: -78.8784, population: 250604, corridor: 'Great Lakes USA' },
      { name: 'Rochester', country: 'USA', lat: 43.1629, lon: -77.6100, population: 205356, corridor: 'Great Lakes USA' },
    ],
    'Northeast USA': [
      { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, population: 8335897, corridor: 'Northeast USA' },
      { name: 'Boston', country: 'USA', lat: 42.3601, lon: -71.0589, population: 692600, corridor: 'Northeast USA' },
      { name: 'Philadelphia', country: 'USA', lat: 39.9526, lon: -75.1652, population: 1603797, corridor: 'Northeast USA' },
      { name: 'Washington, DC', country: 'USA', lat: 38.9072, lon: -77.0369, population: 705749, corridor: 'Northeast USA' },
    ],
    'Midwest Reach': [
      { name: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298, population: 2693976, corridor: 'Midwest Reach' },
      { name: 'Indianapolis', country: 'USA', lat: 39.7684, lon: -86.1581, population: 876384, corridor: 'Midwest Reach' },
      { name: 'Milwaukee', country: 'USA', lat: 43.0389, lon: -87.9065, population: 594833, corridor: 'Midwest Reach' },
    ],
  },

  'Chicago': {
    'Midwest Core': [
      { name: 'Milwaukee', country: 'USA', lat: 43.0389, lon: -87.9065, population: 594833, corridor: 'Midwest Core' },
      { name: 'Madison', country: 'USA', lat: 43.0731, lon: -89.4012, population: 269840, corridor: 'Midwest Core' },
      { name: 'Indianapolis', country: 'USA', lat: 39.7684, lon: -86.1581, population: 876384, corridor: 'Midwest Core' },
      { name: 'Detroit', country: 'USA', lat: 42.3314, lon: -83.0458, population: 672662, corridor: 'Midwest Core' },
      { name: 'Cleveland', country: 'USA', lat: 41.4993, lon: -81.6944, population: 372624, corridor: 'Midwest Core' },
      { name: 'Columbus', country: 'USA', lat: 39.9612, lon: -82.9988, population: 898553, corridor: 'Midwest Core' },
      { name: 'Cincinnati', country: 'USA', lat: 39.1582, lon: -84.4555, population: 309317, corridor: 'Midwest Core' },
      { name: 'St. Louis', country: 'USA', lat: 38.6270, lon: -90.1994, population: 302838, corridor: 'Midwest Core' },
    ],
    'Great Lakes / Canada': [
      { name: 'Toronto', country: 'Canada', lat: 43.6629, lon: -79.3957, population: 2930000, corridor: 'Great Lakes / Canada' },
      { name: 'Windsor', country: 'Canada', lat: 42.3149, lon: -83.0364, population: 217188, corridor: 'Great Lakes / Canada' },
      { name: 'Buffalo', country: 'USA', lat: 42.8864, lon: -78.8784, population: 250604, corridor: 'Great Lakes / Canada' },
    ],
    'Plains / Upper Midwest': [
      { name: 'Minneapolis', country: 'USA', lat: 44.9778, lon: -93.2650, population: 429954, corridor: 'Plains / Upper Midwest' },
      { name: 'Kansas City', country: 'USA', lat: 39.0997, lon: -94.5786, population: 508090, corridor: 'Plains / Upper Midwest' },
      { name: 'Omaha', country: 'USA', lat: 41.2565, lon: -95.9345, population: 468062, corridor: 'Plains / Upper Midwest' },
      { name: 'Des Moines', country: 'USA', lat: 41.5868, lon: -93.6250, population: 215346, corridor: 'Plains / Upper Midwest' },
    ],
    'Eastern Reach': [
      { name: 'Pittsburgh', country: 'USA', lat: 40.4406, lon: -79.9959, population: 303382, corridor: 'Eastern Reach' },
      { name: 'Nashville', country: 'USA', lat: 36.1627, lon: -86.7816, population: 666034, corridor: 'Eastern Reach' },
      { name: 'Louisville', country: 'USA', lat: 38.2527, lon: -85.7585, population: 612780, corridor: 'Eastern Reach' },
    ],
  },

  'Miami': {
    'Florida': [
      { name: 'Fort Lauderdale', country: 'USA', lat: 26.1224, lon: -80.1373, population: 182437, corridor: 'Florida' },
      { name: 'West Palm Beach', country: 'USA', lat: 26.7153, lon: -80.0534, population: 111955, corridor: 'Florida' },
      { name: 'Naples', country: 'USA', lat: 26.1393, lon: -81.7949, population: 19537, corridor: 'Florida' },
      { name: 'Fort Myers', country: 'USA', lat: 26.6406, lon: -81.8723, population: 62298, corridor: 'Florida' },
      { name: 'Orlando', country: 'USA', lat: 28.5421, lon: -81.3723, population: 307573, corridor: 'Florida' },
      { name: 'Tampa', country: 'USA', lat: 27.9506, lon: -82.4572, population: 399700, corridor: 'Florida' },
      { name: 'Jacksonville', country: 'USA', lat: 30.3322, lon: -81.6557, population: 928112, corridor: 'Florida' },
    ],
    'Southeast USA': [
      { name: 'Atlanta', country: 'USA', lat: 33.7490, lon: -84.3880, population: 498044, corridor: 'Southeast USA' },
      { name: 'Savannah', country: 'USA', lat: 32.0809, lon: -81.0912, population: 145674, corridor: 'Southeast USA' },
      { name: 'Charleston', country: 'USA', lat: 32.7765, lon: -79.9318, population: 136208, corridor: 'Southeast USA' },
      { name: 'Charlotte', country: 'USA', lat: 35.2271, lon: -80.8431, population: 885708, corridor: 'Southeast USA' },
      { name: 'Raleigh', country: 'USA', lat: 35.7796, lon: -78.6382, population: 467665, corridor: 'Southeast USA' },
    ],
    'Caribbean': [
      { name: 'Nassau', country: 'Bahamas', lat: 25.0657, lon: -77.3434, population: 227000, corridor: 'Caribbean' },
      { name: 'Havana', country: 'Cuba', lat: 23.1136, lon: -82.3666, population: 2100000, corridor: 'Caribbean' },
      { name: 'Kingston', country: 'Jamaica', lat: 17.9757, lon: -76.7766, population: 937700, corridor: 'Caribbean' },
      { name: 'Santo Domingo', country: 'Dominican Republic', lat: 18.4861, lon: -69.9312, population: 2959000, corridor: 'Caribbean' },
    ],
    'Gulf / Regional Reach': [
      { name: 'New Orleans', country: 'USA', lat: 29.9511, lon: -90.2623, population: 390144, corridor: 'Gulf / Regional Reach' },
      { name: 'San Juan', country: 'Puerto Rico', lat: 18.4655, lon: -66.1057, population: 424600, corridor: 'Gulf / Regional Reach' },
    ],
  },

  'Dallas': {
    'Texas Triangle': [
      { name: 'Fort Worth', country: 'USA', lat: 32.7555, lon: -97.3308, population: 909585, corridor: 'Texas Triangle' },
      { name: 'Austin', country: 'USA', lat: 30.2672, lon: -97.7431, population: 978908, corridor: 'Texas Triangle' },
      { name: 'San Antonio', country: 'USA', lat: 29.4241, lon: -98.4936, population: 1547253, corridor: 'Texas Triangle' },
      { name: 'Houston', country: 'USA', lat: 29.7604, lon: -95.3698, population: 2320268, corridor: 'Texas Triangle' },
      { name: 'Waco', country: 'USA', lat: 31.5494, lon: -97.1467, population: 139636, corridor: 'Texas Triangle' },
    ],
    'Southern Plains': [
      { name: 'Oklahoma City', country: 'USA', lat: 35.4676, lon: -97.5164, population: 681053, corridor: 'Southern Plains' },
      { name: 'Tulsa', country: 'USA', lat: 36.1539, lon: -95.9925, population: 413066, corridor: 'Southern Plains' },
      { name: 'Kansas City', country: 'USA', lat: 39.0997, lon: -94.5786, population: 508090, corridor: 'Southern Plains' },
      { name: 'Wichita', country: 'USA', lat: 37.6872, lon: -97.3301, population: 389255, corridor: 'Southern Plains' },
      { name: 'Little Rock', country: 'USA', lat: 34.7465, lon: -92.2896, population: 202591, corridor: 'Southern Plains' },
    ],
    'Southwest / Gulf': [
      { name: 'New Orleans', country: 'USA', lat: 29.9511, lon: -90.2623, population: 390144, corridor: 'Southwest / Gulf' },
      { name: 'Memphis', country: 'USA', lat: 35.1495, lon: -90.0490, population: 628434, corridor: 'Southwest / Gulf' },
      { name: 'Baton Rouge', country: 'USA', lat: 30.4515, lon: -91.1871, population: 227818, corridor: 'Southwest / Gulf' },
      { name: 'Monterrey', country: 'Mexico', lat: 25.6866, lon: -100.3161, population: 4380000, corridor: 'Southwest / Gulf' },
    ],
    'Mountain / Desert Reach': [
      { name: 'Albuquerque', country: 'USA', lat: 35.0844, lon: -106.6504, population: 564559, corridor: 'Mountain / Desert Reach' },
      { name: 'Denver', country: 'USA', lat: 39.7392, lon: -104.9903, population: 727211, corridor: 'Mountain / Desert Reach' },
    ],
  },

  'Houston': {
    'Texas': [
      { name: 'Dallas', country: 'USA', lat: 32.7767, lon: -96.9970, population: 1343573, corridor: 'Texas' },
      { name: 'Fort Worth', country: 'USA', lat: 32.7555, lon: -97.3308, population: 909585, corridor: 'Texas' },
      { name: 'Austin', country: 'USA', lat: 30.2672, lon: -97.7431, population: 978908, corridor: 'Texas' },
      { name: 'San Antonio', country: 'USA', lat: 29.4241, lon: -98.4936, population: 1547253, corridor: 'Texas' },
      { name: 'Corpus Christi', country: 'USA', lat: 27.5705, lon: -97.3964, population: 317863, corridor: 'Texas' },
      { name: 'Beaumont', country: 'USA', lat: 30.0656, lon: -94.1278, population: 115121, corridor: 'Texas' },
    ],
    'Gulf Coast': [
      { name: 'New Orleans', country: 'USA', lat: 29.9511, lon: -90.2623, population: 390144, corridor: 'Gulf Coast' },
      { name: 'Baton Rouge', country: 'USA', lat: 30.4515, lon: -91.1871, population: 227818, corridor: 'Gulf Coast' },
      { name: 'Mobile', country: 'USA', lat: 30.6954, lon: -88.0399, population: 187041, corridor: 'Gulf Coast' },
      { name: 'Pensacola', country: 'USA', lat: 30.4215, lon: -87.2169, population: 52975, corridor: 'Gulf Coast' },
    ],
    'Mexico Corridor': [
      { name: 'Monterrey', country: 'Mexico', lat: 25.6866, lon: -100.3161, population: 4380000, corridor: 'Mexico Corridor' },
      { name: 'Saltillo', country: 'Mexico', lat: 25.4267, lon: -101.0036, population: 814000, corridor: 'Mexico Corridor' },
      { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, population: 8918000, corridor: 'Mexico Corridor' },
    ],
    'Interior Reach': [
      { name: 'Oklahoma City', country: 'USA', lat: 35.4676, lon: -97.5164, population: 681053, corridor: 'Interior Reach' },
      { name: 'Tulsa', country: 'USA', lat: 36.1539, lon: -95.9925, population: 413066, corridor: 'Interior Reach' },
      { name: 'Memphis', country: 'USA', lat: 35.1495, lon: -90.0490, population: 628434, corridor: 'Interior Reach' },
    ],
  },

  'Mexico City': {
    'Central Mexico': [
      { name: 'Puebla', country: 'Mexico', lat: 19.0327, lon: -98.2356, population: 1600000, corridor: 'Central Mexico' },
      { name: 'Toluca', country: 'Mexico', lat: 19.2826, lon: -99.6558, population: 873536, corridor: 'Central Mexico' },
      { name: 'Querétaro', country: 'Mexico', lat: 20.5888, lon: -100.3899, population: 844161, corridor: 'Central Mexico' },
      { name: 'León', country: 'Mexico', lat: 21.1343, lon: -101.6827, population: 1660000, corridor: 'Central Mexico' },
      { name: 'San Luis Potosí', country: 'Mexico', lat: 22.1505, lon: -100.9789, population: 825000, corridor: 'Central Mexico' },
      { name: 'Aguascalientes', country: 'Mexico', lat: 21.8853, lon: -102.2930, population: 860000, corridor: 'Central Mexico' },
    ],
    'Western / Northern Mexico': [
      { name: 'Guadalajara', country: 'Mexico', lat: 20.6596, lon: -103.2494, population: 5268000, corridor: 'Western / Northern Mexico' },
      { name: 'Monterrey', country: 'Mexico', lat: 25.6866, lon: -100.3161, population: 4380000, corridor: 'Western / Northern Mexico' },
      { name: 'Saltillo', country: 'Mexico', lat: 25.4267, lon: -101.0036, population: 814000, corridor: 'Western / Northern Mexico' },
      { name: 'Torreón', country: 'Mexico', lat: 25.5428, lon: -103.4578, population: 650000, corridor: 'Western / Northern Mexico' },
      { name: 'Zacatecas', country: 'Mexico', lat: 22.7709, lon: -102.5832, population: 200000, corridor: 'Western / Northern Mexico' },
    ],
    'Coastal / Southern Mexico': [
      { name: 'Veracruz', country: 'Mexico', lat: 19.1943, lon: -96.1844, population: 557069, corridor: 'Coastal / Southern Mexico' },
      { name: 'Acapulco', country: 'Mexico', lat: 16.8634, lon: -99.8901, population: 810979, corridor: 'Coastal / Southern Mexico' },
      { name: 'Oaxaca', country: 'Mexico', lat: 17.0732, lon: -96.7265, population: 265173, corridor: 'Coastal / Southern Mexico' },
      { name: 'Mérida', country: 'Mexico', lat: 20.9674, lon: -89.6164, population: 923069, corridor: 'Coastal / Southern Mexico' },
    ],
    'Cross-Border Reach': [
      { name: 'Houston', country: 'USA', lat: 29.7604, lon: -95.3698, population: 2320268, corridor: 'Cross-Border Reach' },
      { name: 'San Antonio', country: 'USA', lat: 29.4241, lon: -98.4936, population: 1547253, corridor: 'Cross-Border Reach' },
      { name: 'Dallas', country: 'USA', lat: 32.7767, lon: -96.9970, population: 1343573, corridor: 'Cross-Border Reach' },
    ],
  },

  'São Paulo': {
    'Brazil Core': [
      { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, population: 6747000, corridor: 'Brazil Core' },
      { name: 'Campinas', country: 'Brazil', lat: -22.8897, lon: -47.0619, population: 1213972, corridor: 'Brazil Core' },
      { name: 'Santos', country: 'Brazil', lat: -23.9608, lon: -46.3334, population: 433656, corridor: 'Brazil Core' },
      { name: 'Curitiba', country: 'Brazil', lat: -25.4284, lon: -49.2733, population: 1879355, corridor: 'Brazil Core' },
      { name: 'Belo Horizonte', country: 'Brazil', lat: -19.8267, lon: -43.9945, population: 2397566, corridor: 'Brazil Core' },
      { name: 'Brasília', country: 'Brazil', lat: -15.8267, lon: -47.8822, population: 2977000, corridor: 'Brazil Core' },
    ],
    'South Brazil': [
      { name: 'Florianópolis', country: 'Brazil', lat: -27.5954, lon: -48.5480, population: 461524, corridor: 'South Brazil' },
      { name: 'Porto Alegre', country: 'Brazil', lat: -30.0331, lon: -51.2304, population: 1409351, corridor: 'South Brazil' },
      { name: 'Joinville', country: 'Brazil', lat: -26.3045, lon: -48.8487, population: 612000, corridor: 'South Brazil' },
    ],
    'Regional Interior': [
      { name: 'Ribeirão Preto', country: 'Brazil', lat: -21.1758, lon: -47.8102, population: 726223, corridor: 'Regional Interior' },
      { name: 'Goiânia', country: 'Brazil', lat: -15.7942, lon: -48.0194, population: 1516113, corridor: 'Regional Interior' },
      { name: 'Vitória', country: 'Brazil', lat: -20.3155, lon: -40.3128, population: 365855, corridor: 'Regional Interior' },
    ],
    'Northeast Brazil Reach': [
      { name: 'Recife', country: 'Brazil', lat: -8.0476, lon: -34.8770, population: 1653461, corridor: 'Northeast Brazil Reach' },
      { name: 'Fortaleza', country: 'Brazil', lat: -3.7172, lon: -38.5433, population: 2669000, corridor: 'Northeast Brazil Reach' },
      { name: 'Salvador', country: 'Brazil', lat: -12.9777, lon: -38.5016, population: 2886698, corridor: 'Northeast Brazil Reach' },
      { name: 'Manaus', country: 'Brazil', lat: -3.1190, lon: -60.0217, population: 2219580, corridor: 'Northeast Brazil Reach' },
    ],
    'International Reach': [
      { name: 'Asunción', country: 'Paraguay', lat: -25.2637, lon: -57.5759, population: 512112, corridor: 'International Reach' },
      { name: 'Montevideo', country: 'Uruguay', lat: -34.9011, lon: -56.1645, population: 1319000, corridor: 'International Reach' },
      { name: 'La Paz', country: 'Bolivia', lat: -16.4897, lon: -68.1193, population: 816044, corridor: 'International Reach' },
    ],
  },

  'Buenos Aires': {
    'Argentina': [
      { name: 'Rosario', country: 'Argentina', lat: -32.9387, lon: -60.6893, population: 1330023, corridor: 'Argentina' },
      { name: 'Córdoba', country: 'Argentina', lat: -31.4135, lon: -64.1811, population: 1428000, corridor: 'Argentina' },
      { name: 'Mendoza', country: 'Argentina', lat: -32.8897, lon: -68.8452, population: 963000, corridor: 'Argentina' },
      { name: 'Mar del Plata', country: 'Argentina', lat: -38.0055, lon: -57.5431, population: 644286, corridor: 'Argentina' },
      { name: 'La Plata', country: 'Argentina', lat: -34.9215, lon: -57.9545, population: 645209, corridor: 'Argentina' },
      { name: 'Santa Fe', country: 'Argentina', lat: -31.6109, lon: -60.7088, population: 510233, corridor: 'Argentina' },
      { name: 'Salta', country: 'Argentina', lat: -24.7821, lon: -65.4232, population: 535303, corridor: 'Argentina' },
      { name: 'Tucumán', country: 'Argentina', lat: -26.8083, lon: -65.2176, population: 548866, corridor: 'Argentina' },
      { name: 'Neuquén', country: 'Argentina', lat: -38.9516, lon: -68.0591, population: 231000, corridor: 'Argentina' },
    ],
    'Uruguay': [
      { name: 'Montevideo', country: 'Uruguay', lat: -34.9011, lon: -56.1645, population: 1319000, corridor: 'Uruguay' },
      { name: 'Punta del Este', country: 'Uruguay', lat: -34.2589, lon: -54.7396, population: 9316, corridor: 'Uruguay' },
      { name: 'Colonia', country: 'Uruguay', lat: -34.4757, lon: -57.8411, population: 21714, corridor: 'Uruguay' },
    ],
    'Chile / Paraguay': [
      { name: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693, population: 6269000, corridor: 'Chile / Paraguay' },
      { name: 'Valparaíso', country: 'Chile', lat: -33.0379, lon: -71.6278, population: 296828, corridor: 'Chile / Paraguay' },
      { name: 'Asunción', country: 'Paraguay', lat: -25.2637, lon: -57.5759, population: 512112, corridor: 'Chile / Paraguay' },
    ],
    'Southern Brazil Reach': [
      { name: 'Porto Alegre', country: 'Brazil', lat: -30.0331, lon: -51.2304, population: 1409351, corridor: 'Southern Brazil Reach' },
      { name: 'Curitiba', country: 'Brazil', lat: -25.4284, lon: -49.2733, population: 1879355, corridor: 'Southern Brazil Reach' },
    ],
  },

  'Sydney': {
    'Eastern Australia': [
      { name: 'Canberra', country: 'Australia', lat: -35.2809, lon: 149.1300, population: 460000, corridor: 'Eastern Australia' },
      { name: 'Newcastle', country: 'Australia', lat: -32.9267, lon: 151.7816, population: 308000, corridor: 'Eastern Australia' },
      { name: 'Wollongong', country: 'Australia', lat: -34.4212, lon: 150.8929, population: 284500, corridor: 'Eastern Australia' },
      { name: 'Brisbane', country: 'Australia', lat: -27.4705, lon: 153.0260, population: 2366000, corridor: 'Eastern Australia' },
      { name: 'Gold Coast', country: 'Australia', lat: -28.0028, lon: 153.4314, population: 627000, corridor: 'Eastern Australia' },
      { name: 'Sunshine Coast', country: 'Australia', lat: -26.8041, lon: 153.0935, population: 400000, corridor: 'Eastern Australia' },
    ],
    'Southern Australia': [
      { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, population: 5078193, corridor: 'Southern Australia' },
      { name: 'Geelong', country: 'Australia', lat: -38.1499, lon: 144.3617, population: 251418, corridor: 'Southern Australia' },
      { name: 'Adelaide', country: 'Australia', lat: -34.9285, lon: 138.6007, population: 1419700, corridor: 'Southern Australia' },
      { name: 'Hobart', country: 'Australia', lat: -42.8821, lon: 147.3272, population: 226000, corridor: 'Southern Australia' },
    ],
    'Interior Reach': [
      { name: 'Albury', country: 'Australia', lat: -36.0755, lon: 146.9139, population: 51884, corridor: 'Interior Reach' },
      { name: 'Wagga Wagga', country: 'Australia', lat: -35.1244, lon: 147.3598, population: 58906, corridor: 'Interior Reach' },
      { name: 'Dubbo', country: 'Australia', lat: -32.2401, lon: 148.6047, population: 42500, corridor: 'Interior Reach' },
    ],
    'New Zealand Reach': [
      { name: 'Auckland', country: 'New Zealand', lat: -37.0882, lon: 174.7765, population: 1378100, corridor: 'New Zealand Reach' },
      { name: 'Wellington', country: 'New Zealand', lat: -41.2865, lon: 174.7762, population: 418000, corridor: 'New Zealand Reach' },
    ],
  },

  'Melbourne': {
    'Victoria / South Australia': [
      { name: 'Geelong', country: 'Australia', lat: -38.1499, lon: 144.3617, population: 251418, corridor: 'Victoria / South Australia' },
      { name: 'Ballarat', country: 'Australia', lat: -37.5567, lon: 143.8510, population: 107836, corridor: 'Victoria / South Australia' },
      { name: 'Bendigo', country: 'Australia', lat: -36.7597, lon: 144.2807, population: 101481, corridor: 'Victoria / South Australia' },
      { name: 'Adelaide', country: 'Australia', lat: -34.9285, lon: 138.6007, population: 1419700, corridor: 'Victoria / South Australia' },
      { name: 'Hobart', country: 'Australia', lat: -42.8821, lon: 147.3272, population: 226000, corridor: 'Victoria / South Australia' },
    ],
    'Eastern Australia': [
      { name: 'Canberra', country: 'Australia', lat: -35.2809, lon: 149.1300, population: 460000, corridor: 'Eastern Australia' },
      { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, population: 5312000, corridor: 'Eastern Australia' },
      { name: 'Newcastle', country: 'Australia', lat: -32.9267, lon: 151.7816, population: 308000, corridor: 'Eastern Australia' },
      { name: 'Wollongong', country: 'Australia', lat: -34.4212, lon: 150.8929, population: 284500, corridor: 'Eastern Australia' },
    ],
    'Interior Reach': [
      { name: 'Albury', country: 'Australia', lat: -36.0755, lon: 146.9139, population: 51884, corridor: 'Interior Reach' },
      { name: 'Wagga Wagga', country: 'Australia', lat: -35.1244, lon: 147.3598, population: 58906, corridor: 'Interior Reach' },
      { name: 'Mildura', country: 'Australia', lat: -34.1860, lon: 142.1663, population: 30400, corridor: 'Interior Reach' },
    ],
    'Regional Long Reach': [
      { name: 'Brisbane', country: 'Australia', lat: -27.4705, lon: 153.0260, population: 2366000, corridor: 'Regional Long Reach' },
      { name: 'Gold Coast', country: 'Australia', lat: -28.0028, lon: 153.4314, population: 627000, corridor: 'Regional Long Reach' },
    ],
  },

  'Seoul': {
    'South Korea': [
      { name: 'Incheon', country: 'South Korea', lat: 37.2756, lon: 126.6333, population: 2900000, corridor: 'South Korea' },
      { name: 'Suwon', country: 'South Korea', lat: 37.2636, lon: 127.0078, population: 1230000, corridor: 'South Korea' },
      { name: 'Daejeon', country: 'South Korea', lat: 36.3504, lon: 127.3845, population: 1538000, corridor: 'South Korea' },
      { name: 'Daegu', country: 'South Korea', lat: 35.8714, lon: 128.5954, population: 2426000, corridor: 'South Korea' },
      { name: 'Gwangju', country: 'South Korea', lat: 35.1595, lon: 126.8526, population: 1460000, corridor: 'South Korea' },
      { name: 'Ulsan', country: 'South Korea', lat: 35.5384, lon: 129.3118, population: 1177000, corridor: 'South Korea' },
      { name: 'Busan', country: 'South Korea', lat: 35.1796, lon: 129.0756, population: 3440000, corridor: 'South Korea' },
    ],
    'Japan Reach': [
      { name: 'Fukuoka', country: 'Japan', lat: 33.5904, lon: 130.4017, population: 1594824, corridor: 'Japan Reach' },
      { name: 'Hiroshima', country: 'Japan', lat: 34.3853, lon: 132.4553, population: 1199391, corridor: 'Japan Reach' },
      { name: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023, population: 19222000, corridor: 'Japan Reach' },
      { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, population: 13960000, corridor: 'Japan Reach' },
    ],
    'China Northeast': [
      { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, population: 21540000, corridor: 'China Northeast' },
      { name: 'Tianjin', country: 'China', lat: 39.0842, lon: 117.2010, population: 15700000, corridor: 'China Northeast' },
      { name: 'Qingdao', country: 'China', lat: 36.0671, lon: 120.3826, population: 9400000, corridor: 'China Northeast' },
      { name: 'Dalian', country: 'China', lat: 38.9140, lon: 121.6147, population: 6700000, corridor: 'China Northeast' },
    ],
    'Regional Reach': [
      { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, population: 27058000, corridor: 'Regional Reach' },
      { name: 'Taipei', country: 'Taiwan', lat: 25.0330, lon: 121.5654, population: 2704810, corridor: 'Regional Reach' },
    ],
  },

  'Mumbai': {
    'Western India': [
      { name: 'Pune', country: 'India', lat: 18.5204, lon: 73.8567, population: 6430000, corridor: 'Western India' },
      { name: 'Nashik', country: 'India', lat: 19.9975, lon: 73.7898, population: 1568000, corridor: 'Western India' },
      { name: 'Surat', country: 'India', lat: 21.1702, lon: 72.8311, population: 6081000, corridor: 'Western India' },
      { name: 'Ahmedabad', country: 'India', lat: 23.0225, lon: 72.5714, population: 8506000, corridor: 'Western India' },
      { name: 'Vadodara', country: 'India', lat: 22.3072, lon: 73.1812, population: 1810000, corridor: 'Western India' },
      { name: 'Rajkot', country: 'India', lat: 22.3039, lon: 70.8022, population: 1379000, corridor: 'Western India' },
    ],
    'Central / Southern India': [
      { name: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867, population: 6809000, corridor: 'Central / Southern India' },
      { name: 'Bangalore', country: 'India', lat: 12.9716, lon: 77.5946, population: 8436000, corridor: 'Central / Southern India' },
      { name: 'Goa', country: 'India', lat: 15.2993, lon: 73.8243, population: 1458000, corridor: 'Central / Southern India' },
      { name: 'Nagpur', country: 'India', lat: 21.1458, lon: 79.0882, population: 2406000, corridor: 'Central / Southern India' },
      { name: 'Indore', country: 'India', lat: 22.7196, lon: 75.8577, population: 2168000, corridor: 'Central / Southern India' },
    ],
    'Northern Reach': [
      { name: 'Jaipur', country: 'India', lat: 26.9048, lon: 75.7713, population: 3046000, corridor: 'Northern Reach' },
      { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025, population: 32940000, corridor: 'Northern Reach' },
    ],
    'International Reach': [
      { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011, population: 15400000, corridor: 'International Reach' },
      { name: 'Muscat', country: 'Oman', lat: 23.6100, lon: 58.5400, population: 1700000, corridor: 'International Reach' },
    ],
  },

  'Delhi': {
    'North India': [
      { name: 'Gurgaon', country: 'India', lat: 28.4595, lon: 77.0266, population: 2700000, corridor: 'North India' },
      { name: 'Noida', country: 'India', lat: 28.5355, lon: 77.3910, population: 3600000, corridor: 'North India' },
      { name: 'Jaipur', country: 'India', lat: 26.9048, lon: 75.7713, population: 3046000, corridor: 'North India' },
      { name: 'Chandigarh', country: 'India', lat: 30.7333, lon: 76.7794, population: 1025000, corridor: 'North India' },
      { name: 'Ludhiana', country: 'India', lat: 30.9010, lon: 75.8573, population: 1618000, corridor: 'North India' },
      { name: 'Lucknow', country: 'India', lat: 26.8467, lon: 80.9462, population: 2870000, corridor: 'North India' },
      { name: 'Kanpur', country: 'India', lat: 26.4499, lon: 80.3319, population: 3051000, corridor: 'North India' },
    ],
    'West / Central India': [
      { name: 'Ahmedabad', country: 'India', lat: 23.0225, lon: 72.5714, population: 8506000, corridor: 'West / Central India' },
      { name: 'Indore', country: 'India', lat: 22.7196, lon: 75.8577, population: 2168000, corridor: 'West / Central India' },
      { name: 'Bhopal', country: 'India', lat: 23.1815, lon: 79.9864, population: 1944000, corridor: 'West / Central India' },
      { name: 'Mumbai', country: 'India', lat: 19.0876, lon: 72.8691, population: 20411000, corridor: 'West / Central India' },
    ],
    'South Asia': [
      { name: 'Lahore', country: 'Pakistan', lat: 31.5497, lon: 74.3436, population: 11126000, corridor: 'South Asia' },
      { name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lon: 73.0479, population: 1014000, corridor: 'South Asia' },
      { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lon: 85.3240, population: 1442000, corridor: 'South Asia' },
      { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125, population: 21006000, corridor: 'South Asia' },
    ],
    'Eastern Reach': [
      { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639, population: 14681000, corridor: 'Eastern Reach' },
      { name: 'Patna', country: 'India', lat: 25.5941, lon: 85.1376, population: 1700000, corridor: 'Eastern Reach' },
    ],
  },

  'Bangkok': {
    'Thailand': [
      { name: 'Chiang Mai', country: 'Thailand', lat: 18.7883, lon: 98.9853, population: 1193000, corridor: 'Thailand' },
      { name: 'Pattaya', country: 'Thailand', lat: 12.9271, lon: 100.8765, population: 104863, corridor: 'Thailand' },
      { name: 'Phuket', country: 'Thailand', lat: 7.8804, lon: 98.3923, population: 412600, corridor: 'Thailand' },
      { name: 'Nakhon Ratchasima', country: 'Thailand', lat: 14.9681, lon: 102.1348, population: 1283000, corridor: 'Thailand' },
      { name: 'Hat Yai', country: 'Thailand', lat: 7.0102, lon: 100.4661, population: 210000, corridor: 'Thailand' },
    ],
    'Mainland Southeast Asia': [
      { name: 'Phnom Penh', country: 'Cambodia', lat: 11.5564, lon: 104.8282, population: 2009000, corridor: 'Mainland Southeast Asia' },
      { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.7769, lon: 106.7009, population: 9113000, corridor: 'Mainland Southeast Asia' },
      { name: 'Hanoi', country: 'Vietnam', lat: 21.0285, lon: 105.8542, population: 8053000, corridor: 'Mainland Southeast Asia' },
      { name: 'Vientiane', country: 'Laos', lat: 17.9757, lon: 102.6331, population: 868000, corridor: 'Mainland Southeast Asia' },
      { name: 'Yangon', country: 'Myanmar', lat: 16.8661, lon: 96.1951, population: 5209541, corridor: 'Mainland Southeast Asia' },
    ],
    'Malaysia / Singapore': [
      { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869, population: 1684000, corridor: 'Malaysia / Singapore' },
      { name: 'Penang', country: 'Malaysia', lat: 5.4164, lon: 100.3327, population: 763137, corridor: 'Malaysia / Singapore' },
      { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, population: 5686000, corridor: 'Malaysia / Singapore' },
    ],
    'Regional Reach': [
      { name: 'Kunming', country: 'China', lat: 25.0420, lon: 102.7103, population: 6931600, corridor: 'Regional Reach' },
      { name: 'Nanning', country: 'China', lat: 22.8170, lon: 108.3665, population: 6500000, corridor: 'Regional Reach' },
    ],
  },

  'Istanbul': {
    'Turkey': [
      { name: 'Ankara', country: 'Turkey', lat: 39.9334, lon: 32.8597, population: 5445000, corridor: 'Turkey' },
      { name: 'Izmir', country: 'Turkey', lat: 38.4161, lon: 27.1415, population: 4500000, corridor: 'Turkey' },
      { name: 'Bursa', country: 'Turkey', lat: 40.1955, lon: 29.0678, population: 3056000, corridor: 'Turkey' },
      { name: 'Antalya', country: 'Turkey', lat: 36.9271, lon: 30.7133, population: 1326000, corridor: 'Turkey' },
      { name: 'Konya', country: 'Turkey', lat: 38.7469, lon: 33.5006, population: 1101000, corridor: 'Turkey' },
      { name: 'Adana', country: 'Turkey', lat: 37.0057, lon: 35.3287, population: 2291000, corridor: 'Turkey' },
    ],
    'Balkans': [
      { name: 'Sofia', country: 'Bulgaria', lat: 42.6977, lon: 23.3219, population: 1242000, corridor: 'Balkans' },
      { name: 'Bucharest', country: 'Romania', lat: 44.4268, lon: 26.1025, population: 1830000, corridor: 'Balkans' },
      { name: 'Belgrade', country: 'Serbia', lat: 44.8176, lon: 20.4568, population: 1484000, corridor: 'Balkans' },
      { name: 'Thessaloniki', country: 'Greece', lat: 40.6401, lon: 22.9444, population: 1006000, corridor: 'Balkans' },
      { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275, population: 3154000, corridor: 'Balkans' },
    ],
    'Caucasus / Black Sea': [
      { name: 'Tbilisi', country: 'Georgia', lat: 41.7151, lon: 44.8271, population: 1160000, corridor: 'Caucasus / Black Sea' },
      { name: 'Yerevan', country: 'Armenia', lat: 40.1792, lon: 44.5044, population: 1093000, corridor: 'Caucasus / Black Sea' },
      { name: 'Baku', country: 'Azerbaijan', lat: 40.3856, lon: 49.8671, population: 3145000, corridor: 'Caucasus / Black Sea' },
    ],
    'Middle East Reach': [
      { name: 'Beirut', country: 'Lebanon', lat: 33.3157, lon: 35.4764, population: 2500000, corridor: 'Middle East Reach' },
      { name: 'Damascus', country: 'Syria', lat: 33.5138, lon: 36.2765, population: 2000000, corridor: 'Middle East Reach' },
      { name: 'Baghdad', country: 'Iraq', lat: 33.3157, lon: 44.3661, population: 7000000, corridor: 'Middle East Reach' },
    ],
  },

  'Riyadh': {
    'Saudi Arabia': [
      { name: 'Jeddah', country: 'Saudi Arabia', lat: 21.5433, lon: 39.1727, population: 4700000, corridor: 'Saudi Arabia' },
      { name: 'Mecca', country: 'Saudi Arabia', lat: 21.4225, lon: 39.8265, population: 2000000, corridor: 'Saudi Arabia' },
      { name: 'Medina', country: 'Saudi Arabia', lat: 24.4672, lon: 39.5890, population: 1500000, corridor: 'Saudi Arabia' },
      { name: 'Dammam', country: 'Saudi Arabia', lat: 26.4124, lon: 50.0825, population: 640000, corridor: 'Saudi Arabia' },
      { name: 'Khobar', country: 'Saudi Arabia', lat: 26.1429, lon: 50.2069, population: 300000, corridor: 'Saudi Arabia' },
    ],
    'Gulf': [
      { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, population: 3137000, corridor: 'Gulf' },
      { name: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lon: 54.3773, population: 1800000, corridor: 'Gulf' },
      { name: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.5310, population: 956000, corridor: 'Gulf' },
      { name: 'Manama', country: 'Bahrain', lat: 26.1667, lon: 50.5667, population: 430000, corridor: 'Gulf' },
      { name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lon: 47.9774, population: 3107000, corridor: 'Gulf' },
    ],
    'Levant / Red Sea': [
      { name: 'Amman', country: 'Jordan', lat: 31.9454, lon: 35.9284, population: 2000000, corridor: 'Levant / Red Sea' },
      { name: 'Aqaba', country: 'Jordan', lat: 29.5300, lon: 34.9467, population: 155000, corridor: 'Levant / Red Sea' },
      { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, population: 20076000, corridor: 'Levant / Red Sea' },
    ],
    'Regional Reach': [
      { name: 'Muscat', country: 'Oman', lat: 23.6100, lon: 58.5400, population: 1700000, corridor: 'Regional Reach' },
      { name: 'Baghdad', country: 'Iraq', lat: 33.3157, lon: 44.3661, population: 7000000, corridor: 'Regional Reach' },
    ],
  },

  'Johannesburg': {
    'South Africa': [
      { name: 'Pretoria', country: 'South Africa', lat: -25.7482, lon: 28.2293, population: 1400000, corridor: 'South Africa' },
      { name: 'Durban', country: 'South Africa', lat: -29.8587, lon: 31.0218, population: 3441000, corridor: 'South Africa' },
      { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, population: 4430000, corridor: 'South Africa' },
      { name: 'Bloemfontein', country: 'South Africa', lat: -29.1167, lon: 25.5167, population: 645000, corridor: 'South Africa' },
      { name: 'Port Elizabeth', country: 'South Africa', lat: -33.9581, lon: 25.6097, population: 1005000, corridor: 'South Africa' },
      { name: 'East London', country: 'South Africa', lat: -33.0154, lon: 27.9116, population: 268000, corridor: 'South Africa' },
    ],
    'Southern Africa': [
      { name: 'Gaborone', country: 'Botswana', lat: -24.6282, lon: 25.9244, population: 300000, corridor: 'Southern Africa' },
      { name: 'Maseru', country: 'Lesotho', lat: -29.6100, lon: 27.4833, population: 333000, corridor: 'Southern Africa' },
      { name: 'Mbabane', country: 'Eswatini', lat: -26.4054, lon: 31.1567, population: 90000, corridor: 'Southern Africa' },
      { name: 'Maputo', country: 'Mozambique', lat: -23.8645, lon: 35.3297, population: 1100000, corridor: 'Southern Africa' },
      { name: 'Windhoek', country: 'Namibia', lat: -22.5618, lon: 17.0832, population: 325000, corridor: 'Southern Africa' },
    ],
    'Regional Reach': [
      { name: 'Harare', country: 'Zimbabwe', lat: -17.8252, lon: 31.0335, population: 1485000, corridor: 'Regional Reach' },
      { name: 'Lusaka', country: 'Zambia', lat: -15.3875, lon: 28.3228, population: 1500000, corridor: 'Regional Reach' },
      { name: 'Bulawayo', country: 'Zimbabwe', lat: -20.1500, lon: 28.5833, population: 653000, corridor: 'Regional Reach' },
      { name: 'Blantyre', country: 'Malawi', lat: -15.7861, lon: 35.0058, population: 1000000, corridor: 'Regional Reach' },
    ],
    'East Africa Reach': [
      { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, population: 4397000, corridor: 'East Africa Reach' },
      { name: 'Dar es Salaam', country: 'Tanzania', lat: -6.7924, lon: 39.2083, population: 4366000, corridor: 'East Africa Reach' },
      { name: 'Luanda', country: 'Angola', lat: -8.8390, lon: 13.2894, population: 2576000, corridor: 'East Africa Reach' },
      { name: 'Rustenburg', country: 'South Africa', lat: -25.6544, lon: 27.2420, population: 549000, corridor: 'East Africa Reach' },
      { name: 'Kimberley', country: 'South Africa', lat: -28.7282, lon: 24.7499, population: 225000, corridor: 'East Africa Reach' },
    ],
  },

  'Tel Aviv': {
    'Israel Core / Jerusalem Corridor': [
      { name: 'Jerusalem', country: 'Israel', lat: 31.7683, lon: 35.2137, population: 970000, corridor: 'Israel Core / Jerusalem Corridor', distanceFromOriginMiles: 34 },
    ],
    'Israel Coastal / Northern Corridor': [
      { name: 'Haifa', country: 'Israel', lat: 32.7940, lon: 34.9896, population: 285000, corridor: 'Israel Coastal / Northern Corridor', distanceFromOriginMiles: 53 },
      { name: 'Netanya', country: 'Israel', lat: 32.3215, lon: 34.8532, population: 225000, corridor: 'Israel Coastal / Northern Corridor', distanceFromOriginMiles: 17 },
    ],
    'Israel Coastal / Southern Corridor': [
      { name: 'Ashdod', country: 'Israel', lat: 31.8014, lon: 34.6435, population: 225000, corridor: 'Israel Coastal / Southern Corridor', distanceFromOriginMiles: 22 },
    ],
    'Negev / Southern Inland Corridor': [
      { name: 'Beersheba', country: 'Israel', lat: 31.2518, lon: 34.7913, population: 210000, corridor: 'Negev / Southern Inland Corridor', distanceFromOriginMiles: 58 },
    ],
    'Red Sea / Gulf of Aqaba Corridor': [
      { name: 'Eilat', country: 'Israel', lat: 29.5577, lon: 34.9519, population: 52000, corridor: 'Red Sea / Gulf of Aqaba Corridor', distanceFromOriginMiles: 175 },
      { name: 'Aqaba', country: 'Jordan', lat: 29.5319, lon: 35.0061, population: 190000, corridor: 'Red Sea / Gulf of Aqaba Corridor', distanceFromOriginMiles: 178 },
    ],
    'Central Mountain / Cross-Border Corridor': [
      { name: 'Ramallah', country: 'Palestinian Territories', lat: 31.9038, lon: 35.2034, population: null, corridor: 'Central Mountain / Cross-Border Corridor', distanceFromOriginMiles: 28 },
      { name: 'Nablus', country: 'Palestinian Territories', lat: 32.2211, lon: 35.2544, population: null, corridor: 'Central Mountain / Cross-Border Corridor', distanceFromOriginMiles: 31 },
    ],
    'Southern Coastal / Cross-Border Corridor': [
      { name: 'Gaza City', country: 'Palestinian Territories', lat: 31.5017, lon: 34.4668, population: null, corridor: 'Southern Coastal / Cross-Border Corridor', distanceFromOriginMiles: 47 },
    ],
    'Jordan / Inland Business Corridor': [
      { name: 'Amman', country: 'Jordan', lat: 31.9539, lon: 35.9106, population: 4000000, corridor: 'Jordan / Inland Business Corridor', distanceFromOriginMiles: 68 },
      { name: 'Zarqa', country: 'Jordan', lat: 32.0728, lon: 36.0870, population: 1360000, corridor: 'Jordan / Inland Business Corridor', distanceFromOriginMiles: 76 },
    ],
    'Jordan / Northern Corridor': [
      { name: 'Irbid', country: 'Jordan', lat: 32.5568, lon: 35.8469, population: 570000, corridor: 'Jordan / Northern Corridor', distanceFromOriginMiles: 72 },
    ],
    'Eastern Mediterranean Coastal Corridor': [
      { name: 'Beirut', country: 'Lebanon', lat: 33.8938, lon: 35.5018, population: 2400000, corridor: 'Eastern Mediterranean Coastal Corridor', distanceFromOriginMiles: 132 },
      { name: 'Tripoli', country: 'Lebanon', lat: 34.4367, lon: 35.8497, population: 530000, corridor: 'Eastern Mediterranean Coastal Corridor', distanceFromOriginMiles: 174 },
      { name: 'Sidon', country: 'Lebanon', lat: 33.5571, lon: 35.3715, population: 80000, corridor: 'Eastern Mediterranean Coastal Corridor', distanceFromOriginMiles: 105 },
      { name: 'Latakia', country: 'Syria', lat: 35.5317, lon: 35.7901, population: 700000, corridor: 'Eastern Mediterranean Coastal Corridor', distanceFromOriginMiles: 245 },
    ],
    'Levant Inland Corridor': [
      { name: 'Damascus', country: 'Syria', lat: 33.5138, lon: 36.2765, population: 2500000, corridor: 'Levant Inland Corridor', distanceFromOriginMiles: 134 },
      { name: 'Homs', country: 'Syria', lat: 34.7324, lon: 36.7137, population: 775000, corridor: 'Levant Inland Corridor', distanceFromOriginMiles: 229 },
    ],
    'Northern Levant / Turkey Corridor': [
      { name: 'Aleppo', country: 'Syria', lat: 36.2021, lon: 37.1343, population: 2000000, corridor: 'Northern Levant / Turkey Corridor', distanceFromOriginMiles: 318 },
    ],
    'Cyprus / Eastern Mediterranean Corridor': [
      { name: 'Nicosia', country: 'Cyprus', lat: 35.1856, lon: 33.3823, population: 330000, corridor: 'Cyprus / Eastern Mediterranean Corridor', distanceFromOriginMiles: 217 },
    ],
    'Cyprus / Port Corridor': [
      { name: 'Limassol', country: 'Cyprus', lat: 34.7071, lon: 33.0226, population: 185000, corridor: 'Cyprus / Port Corridor', distanceFromOriginMiles: 210 },
    ],
    'Cyprus / Aviation Corridor': [
      { name: 'Larnaca', country: 'Cyprus', lat: 34.9229, lon: 33.6233, population: 145000, corridor: 'Cyprus / Aviation Corridor', distanceFromOriginMiles: 197 },
    ],
    'Egypt / Nile Megacity Corridor': [
      { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, population: 10000000, corridor: 'Egypt / Nile Megacity Corridor', distanceFromOriginMiles: 250 },
    ],
    'Egypt / Mediterranean Port Corridor': [
      { name: 'Alexandria', country: 'Egypt', lat: 31.2001, lon: 29.9187, population: 5400000, corridor: 'Egypt / Mediterranean Port Corridor', distanceFromOriginMiles: 300 },
    ],
    'Suez / Port Cargo Corridor': [
      { name: 'Port Said', country: 'Egypt', lat: 31.2653, lon: 32.3019, population: 750000, corridor: 'Suez / Port Cargo Corridor', distanceFromOriginMiles: 166 },
      { name: 'Suez', country: 'Egypt', lat: 29.9668, lon: 32.5498, population: 740000, corridor: 'Suez / Port Cargo Corridor', distanceFromOriginMiles: 204 },
    ],
    'Red Sea / Tourism Corridor': [
      { name: 'Sharm el-Sheikh', country: 'Egypt', lat: 27.9158, lon: 34.3299, population: null, corridor: 'Red Sea / Tourism Corridor', distanceFromOriginMiles: 291 },
      { name: 'Hurghada', country: 'Egypt', lat: 27.2579, lon: 33.8116, population: 260000, corridor: 'Red Sea / Tourism Corridor', distanceFromOriginMiles: 338 },
    ],
    'Turkey / Anatolia Inland Corridor': [
      { name: 'Ankara', country: 'Turkey', lat: 39.9334, lon: 32.8597, population: 5700000, corridor: 'Turkey / Anatolia Inland Corridor', distanceFromOriginMiles: 535 },
      { name: 'Konya', country: 'Turkey', lat: 37.8746, lon: 32.4932, population: 2200000, corridor: 'Turkey / Anatolia Inland Corridor', distanceFromOriginMiles: 427 },
    ],
    'Turkey / Aegean Coastal Corridor': [
      { name: 'Izmir', country: 'Turkey', lat: 38.4237, lon: 27.1428, population: 4300000, corridor: 'Turkey / Aegean Coastal Corridor', distanceFromOriginMiles: 610 },
    ],
    'Turkey / Mediterranean Tourism Corridor': [
      { name: 'Antalya', country: 'Turkey', lat: 36.8969, lon: 30.7133, population: 2600000, corridor: 'Turkey / Mediterranean Tourism Corridor', distanceFromOriginMiles: 400 },
    ],
    'Turkey / Eastern Mediterranean Corridor': [
      { name: 'Adana', country: 'Turkey', lat: 37.0000, lon: 35.3213, population: 2200000, corridor: 'Turkey / Eastern Mediterranean Corridor', distanceFromOriginMiles: 340 },
      { name: 'Mersin', country: 'Turkey', lat: 36.8121, lon: 34.6415, population: 1900000, corridor: 'Turkey / Eastern Mediterranean Port Corridor', distanceFromOriginMiles: 327 },
      { name: 'Gaziantep', country: 'Turkey', lat: 37.0662, lon: 37.3833, population: 2150000, corridor: 'Turkey / Northern Levant Corridor', distanceFromOriginMiles: 393 },
    ],
    'Iraq / Mesopotamia Corridor': [
      { name: 'Baghdad', country: 'Iraq', lat: 33.3152, lon: 44.3661, population: 7600000, corridor: 'Iraq / Mesopotamia Corridor', distanceFromOriginMiles: 560 },
    ],
    'Iraq / Kurdistan Corridor': [
      { name: 'Erbil', country: 'Iraq', lat: 36.1911, lon: 44.0092, population: 930000, corridor: 'Iraq / Kurdistan Corridor', distanceFromOriginMiles: 610 },
    ],
    'Iraq / Northern Corridor': [
      { name: 'Mosul', country: 'Iraq', lat: 36.3489, lon: 43.1577, population: 1700000, corridor: 'Iraq / Northern Corridor', distanceFromOriginMiles: 560 },
    ],
    'Iraq / Gulf Cargo Corridor': [
      { name: 'Basra', country: 'Iraq', lat: 30.5085, lon: 47.7804, population: 1400000, corridor: 'Iraq / Gulf Cargo Corridor', distanceFromOriginMiles: 720 },
    ],
    'Saudi / Red Sea Inland Corridor': [
      { name: 'Tabuk', country: 'Saudi Arabia', lat: 28.3838, lon: 36.5662, population: 660000, corridor: 'Saudi / Red Sea Inland Corridor', distanceFromOriginMiles: 300 },
      { name: 'Medina', country: 'Saudi Arabia', lat: 24.5247, lon: 39.5692, population: 1500000, corridor: 'Saudi / Red Sea Inland Corridor', distanceFromOriginMiles: 590 },
    ],
    'Saudi / Future City + Cargo Corridor': [
      { name: 'NEOM / Oxagon', country: 'Saudi Arabia', lat: 28.1096, lon: 35.1107, population: null, corridor: 'Saudi / Future City + Cargo Corridor', distanceFromOriginMiles: 275 },
    ],
  },

  'Lagos': {
    'Nigeria': [
      { name: 'Abuja', country: 'Nigeria', lat: 9.0765, lon: 7.3986, population: 2500000, corridor: 'Nigeria' },
      { name: 'Ibadan', country: 'Nigeria', lat: 7.3869, lon: 3.8969, population: 3500000, corridor: 'Nigeria' },
      { name: 'Kano', country: 'Nigeria', lat: 11.9500, lon: 8.5167, population: 3857000, corridor: 'Nigeria' },
      { name: 'Port Harcourt', country: 'Nigeria', lat: 4.7957, lon: 7.0099, population: 1320000, corridor: 'Nigeria' },
      { name: 'Benin City', country: 'Nigeria', lat: 6.3357, lon: 5.6233, population: 1500000, corridor: 'Nigeria' },
      { name: 'Kaduna', country: 'Nigeria', lat: 10.5054, lon: 7.4397, population: 1500000, corridor: 'Nigeria' },
    ],
    'West Africa': [
      { name: 'Accra', country: 'Ghana', lat: 5.5264, lon: -0.2211, population: 2393000, corridor: 'West Africa' },
      { name: 'Kumasi', country: 'Ghana', lat: 6.6663, lon: -1.6188, population: 2000000, corridor: 'West Africa' },
      { name: 'Abidjan', country: 'Ivory Coast', lat: 5.3364, lon: -4.0265, population: 4500000, corridor: 'West Africa' },
      { name: 'Cotonou', country: 'Benin', lat: 6.4969, lon: 2.6289, population: 679000, corridor: 'West Africa' },
      { name: 'Lomé', country: 'Togo', lat: 6.1256, lon: 1.2317, population: 1000000, corridor: 'West Africa' },
      { name: 'Douala', country: 'Cameroon', lat: 4.0511, lon: 9.7679, population: 3650000, corridor: 'West Africa' },
    ],
    'Central / Sahel Reach': [
      { name: 'Yaoundé', country: 'Cameroon', lat: 3.8667, lon: 11.5167, population: 2000000, corridor: 'Central / Sahel Reach' },
      { name: 'Niamey', country: 'Niger', lat: 13.5116, lon: 2.1257, population: 1000000, corridor: 'Central / Sahel Reach' },
      { name: 'Ouagadougou', country: 'Burkina Faso', lat: 12.3714, lon: -1.5197, population: 2000000, corridor: 'Central / Sahel Reach' },
    ],
    'Regional Long Reach': [
      { name: 'Dakar', country: 'Senegal', lat: 14.7167, lon: -17.4674, population: 1146000, corridor: 'Regional Long Reach' },
      { name: 'Bamako', country: 'Mali', lat: 12.6500, lon: -8.0029, population: 1650000, corridor: 'Regional Long Reach' },
    ],
  },
};

// Helper: Get all feeder cities for a given hub (valid coords, deduped, optional ROI hub exclusion)
export const getFeederCitiesForHub = (hubName, options = {}) => {
  const { excludeHubNames = [] } = options;
  const exclude = new Set(excludeHubNames);
  const hubData = regionalFeederCitiesByHub[hubName];
  if (!hubData) return [];

  const seen = new Map();
  const cities = [];

  Object.values(hubData).forEach((corridor) => {
    if (!Array.isArray(corridor)) return;
    corridor.forEach((city) => {
      if (
        typeof city?.lat !== 'number' ||
        !Number.isFinite(city.lat) ||
        typeof city?.lon !== 'number' ||
        !Number.isFinite(city.lon)
      ) {
        return;
      }
      if (exclude.has(city.name)) return;

      const key = `${city.name}|${city.country}`;
      if (seen.has(key)) return;

      seen.set(key, true);
      cities.push({
        ...city,
        population: city.population ?? null,
        corridor: city.corridor || 'Regional',
      });
    });
  });

  return cities;
};
