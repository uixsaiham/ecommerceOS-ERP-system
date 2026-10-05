/* Fernhill product catalog shared by the Products pages (All Products, Categories, Collections,
   Product Reviews, Attributes). Matches the data the dashboard, Sales Channels and Abandoned Carts
   already show (30-day revenue: $820,443 as on the Orders page): same products and SKUs, the 8 SKUs below reorder level, the 14 Amazon listings
   suppressed for a missing GTIN, and channel revenue for the last 30 days. Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var NOW = Date.UTC(2026, 9, 1, 9, 42), DAY0 = Date.UTC(2026, 9, 1), DAY = 864e5;
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  var STORES = [
    { key: 'all', label: 'All stores', sub: '4 stores · USD', icon: 'store', factor: 1 },
    { key: 'us', label: 'Fernhill US', sub: 'Shopify · fernhill.co', icon: 'shopping-bag', factor: 0.49 },
    { key: 'eu', label: 'Fernhill EU', sub: 'Shopify · fernhill.eu', icon: 'shopping-bag', factor: 0.37 },
    { key: 'wholesale', label: 'Wholesale', sub: 'B2B portal', icon: 'factory', factor: 0.04 },
    { key: 'amazon', label: 'Amazon US', sub: 'Marketplace', icon: 'tag', factor: 0.10 }
  ];
  var USER = { name: 'Priya Natarajan', role: 'Operations Manager', email: 'priya@fernhill.co', initials: 'PN' };
  /* channel key on a product → store key, label and 30-day revenue (the Orders page, as on Sales Channels and the dashboard) */
  var CHANNELS = [
    { key: 'us', store: 'us', label: 'Fernhill US', short: 'US', rev: 213122.5 },
    { key: 'eu', store: 'eu', label: 'Fernhill EU', short: 'EU', rev: 161442.5 },
    { key: 'wh', store: 'wholesale', label: 'Wholesale', short: 'WS', rev: 401488.45 },
    { key: 'amz', store: 'amazon', label: 'Amazon US', short: 'AZ', rev: 44389.5 }
  ];

  /* ---------- categories (two levels) ---------- */
  var CATEGORIES = [
    { key: 'tops', name: 'Tops', parent: null, google: 'Apparel & Accessories > Clothing > Shirts & Tops', visible: true, desc: 'Tees, shirts, knitwear and sweats.' },
    { key: 'tees', name: 'T-shirts & tees', parent: 'tops', google: 'Apparel & Accessories > Clothing > Shirts & Tops', amazon: 'Clothing › Men › Shirts › T-Shirts', visible: true, desc: 'Everyday tees in organic cotton and merino.' },
    { key: 'shirts', name: 'Shirts & overshirts', parent: 'tops', google: 'Apparel & Accessories > Clothing > Shirts & Tops', amazon: 'Clothing › Men › Shirts › Casual Button-Down', visible: true, desc: 'Woven shirts, overshirts and camp collars.' },
    { key: 'knit', name: 'Knitwear', parent: 'tops', google: 'Apparel & Accessories > Clothing > Shirts & Tops > Sweaters', amazon: 'Clothing › Men › Sweaters', visible: true, desc: 'Merino and lambswool sweaters and cardigans.' },
    { key: 'sweats', name: 'Hoodies & sweatshirts', parent: 'tops', google: 'Apparel & Accessories > Clothing > Activewear > Sweatshirts', amazon: 'Clothing › Men › Fashion Hoodies & Sweatshirts', visible: true, desc: 'Loopback and fleece sweats.' },
    { key: 'outer', name: 'Outerwear', parent: null, google: 'Apparel & Accessories > Clothing > Outerwear', visible: true, desc: 'Jackets, coats and rainwear.' },
    { key: 'jackets', name: 'Jackets & coats', parent: 'outer', google: 'Apparel & Accessories > Clothing > Outerwear > Coats & Jackets', amazon: 'Clothing › Men › Jackets & Coats', visible: true, desc: 'Field jackets, liners and coats.' },
    { key: 'rain', name: 'Rainwear', parent: 'outer', google: 'Apparel & Accessories > Clothing > Outerwear > Rain Gear', amazon: 'Clothing › Men › Jackets & Coats › Rain Jackets', visible: true, desc: 'Waterproof shells and packable rain jackets.' },
    { key: 'bottoms', name: 'Bottoms', parent: null, google: 'Apparel & Accessories > Clothing > Pants', visible: true, desc: 'Trousers, jeans and shorts.' },
    { key: 'trousers', name: 'Trousers & jeans', parent: 'bottoms', google: 'Apparel & Accessories > Clothing > Pants', amazon: 'Clothing › Men › Pants', visible: true, desc: 'Chinos, cords and denim.' },
    { key: 'shorts', name: 'Shorts', parent: 'bottoms', google: 'Apparel & Accessories > Clothing > Shorts', amazon: 'Clothing › Men › Shorts', visible: true, desc: 'Twill, linen and swim shorts.' },
    { key: 'acc', name: 'Accessories', parent: null, google: null, visible: true, desc: 'Bags, hats, scarves, leather goods and socks.' },
    { key: 'bags', name: 'Bags', parent: 'acc', google: 'Apparel & Accessories > Handbags, Wallets & Cases', amazon: 'Clothing › Luggage & Travel Gear › Tote Bags', visible: true, desc: 'Totes, backpacks and pouches.' },
    { key: 'hats', name: 'Hats & beanies', parent: 'acc', google: 'Apparel & Accessories > Clothing Accessories > Hats', amazon: 'Clothing › Accessories › Hats & Caps', visible: true, desc: 'Beanies, caps and bucket hats.' },
    { key: 'scarves', name: 'Scarves', parent: 'acc', google: 'Apparel & Accessories > Clothing Accessories > Scarves & Shawls', amazon: 'Clothing › Accessories › Scarves', visible: true, desc: 'Handwoven Jamdani and lambswool scarves.' },
    { key: 'leather', name: 'Small leather goods', parent: 'acc', google: null, amazon: 'Clothing › Accessories › Wallets', visible: true, desc: 'Card holders, wallets and belts.' },
    { key: 'socks', name: 'Socks', parent: 'acc', google: 'Apparel & Accessories > Clothing > Underwear & Socks > Socks', amazon: 'Clothing › Men › Socks', visible: true, desc: 'Recycled cotton and merino socks.' },
    { key: 'home', name: 'Home textiles', parent: null, google: null, visible: false, desc: 'Handwoven throws and cushion covers. Launching with the gift guide.' }
  ];

  /* ---------- products ---------- */
  var SZ = { L: ['S', 'M', 'L', 'XL'], LX: ['XS', 'S', 'M', 'L', 'XL'], S3: ['S', 'M', 'L'], W: ['30', '32', '34', '36'], SK: ['36–38', '39–42', '43–46'], OS: ['One size'] };
  var CC = { Navy: 'NVY', Black: 'BLK', Oatmeal: 'OAT', White: 'WHT', Sand: 'SAND', Sage: 'SAGE', Olive: 'OLV', Forest: 'FOR', Charcoal: 'CHR', Stone: 'STN', Tan: 'TAN', Natural: 'NAT', Indigo: 'IND', Rust: 'RST', Ecru: 'ECR', Brown: 'BRN', 'Grey melange': 'GRY', 'Light blue': 'LBL', 'Navy blue': 'NVB', Mixed: 'MIX', Yellow: 'YEL', Coral: 'CRL', 'Burgundy check': 'BUR', 'Olive check': 'OLC', 'Navy stripe': 'NVS', 'Rust stripe': 'RSS', Burgundy: 'BUR', Khaki: 'KHK', Cream: 'CRM', Terracotta: 'TER', Slate: 'SLT', Mustard: 'MUS' };
  var SWATCH = { Navy: '#1f2a44', Black: '#1b1b1b', Oatmeal: '#d9cdb5', White: '#f7f6f2', Sand: '#cdb995', Sage: '#9fae8f', Olive: '#5f6236', Forest: '#2f4a36', Charcoal: '#3b3d40', Stone: '#b5aa96', Tan: '#a8784b', Natural: '#e2d6bd', Indigo: '#2e3a6b', Rust: '#a5512d', Ecru: '#ece3cf', Brown: '#5b4030', 'Grey melange': '#9b9da0', 'Light blue': '#a9c3dc', 'Navy blue': '#22305a', Mixed: 'linear-gradient(135deg,#1f2a44 0 33%,#a5512d 33% 66%,#9fae8f 66%)', Yellow: '#e5b93b', Coral: '#e17b62', 'Burgundy check': '#6e2433', 'Olive check': '#5f6236', 'Navy stripe': '#1f2a44', 'Rust stripe': '#a5512d', Burgundy: '#6e2433', Khaki: '#a39a6e', Cream: '#f1e8d2', Terracotta: '#c0643f', Slate: '#5a6470', Mustard: '#c9962e' };
  function sizeCode(s) { return s === 'One size' ? 'OS' : s.replace('–', '').replace(/\s/g, ''); }

  /* code, name, cat, status, price, compareAt, cost, colors, sizes, stock, sold30, rating, reviews, channels,
     origin, material, fit, gender, season, created (days ago), media, extra */
  var HERO = [
    ['TSH', 'Merino crew tee', 'tees', 'active', 58, 0, 21, ['Navy', 'Black', 'Oatmeal'], 'L', 1284, 412, 4.7, 318, 'us eu wh amz', 'Portugal', 'Merino wool', 'Regular', 'Unisex', 'All season', 410, 6, { cc: { Navy: 'NAVY' }, forced: { 'Navy/M': [12, 40], 'Black/L': [31, 40] }, vendor: 'Porto Knit Lda.', tags: ['merino', 'bestseller'] }],
    ['TEE', 'Organic cotton tee', 'tees', 'active', 34, 0, 9.5, ['White', 'Black', 'Navy', 'Sage'], 'L', 2140, 538, 4.5, 402, 'us eu wh amz', 'Bangladesh', 'Organic cotton', 'Regular', 'Unisex', 'All season', 520, 8, { tags: ['bestseller', 'gots-certified'] }],
    ['PKT', 'Heavyweight pocket tee', 'tees', 'active', 42, 0, 12, ['Ecru', 'Charcoal'], 'L', 860, 196, 4.6, 141, 'us eu amz', 'Bangladesh', 'Cotton', 'Relaxed', 'Unisex', 'All season', 300, 5],
    ['TLS', 'Merino long-sleeve tee', 'tees', 'active', 68, 0, 25, ['Navy', 'Charcoal'], 'LX', 540, 142, 4.8, 96, 'us eu', 'Portugal', 'Merino wool', 'Slim', 'Unisex', 'Autumn/Winter', 380, 5, { vendor: 'Porto Knit Lda.', tags: ['merino'] }],
    ['BRT', 'Striped Breton tee', 'tees', 'active', 48, 60, 15, ['Navy stripe', 'Rust stripe'], 'L', 318, 88, 4.3, 64, 'us eu', 'Bangladesh', 'Organic cotton', 'Regular', 'Women', 'Spring/Summer', 240, 4, { tags: ['sale'] }],
    ['OVS', 'Linen overshirt', 'shirts', 'active', 96, 0, 34, ['Sand', 'Sage'], 'L', 212, 131, 4.6, 122, 'us eu wh amz', 'Lithuania', 'Linen', 'Relaxed', 'Men', 'Spring/Summer', 450, 6, { forced: { 'Sand/L': [0, 25] }, suppressed: 2 }],
    ['OXF', 'Oxford button-down', 'shirts', 'active', 78, 0, 24, ['White', 'Light blue', 'Navy blue'], 'L', 690, 174, 4.4, 158, 'us eu wh amz', 'Bangladesh', 'Cotton', 'Regular', 'Men', 'All season', 600, 6],
    ['FLN', 'Flannel work shirt', 'shirts', 'active', 84, 0, 27, ['Burgundy check', 'Olive check'], 'LX', 455, 63, 4.5, 37, 'us eu', 'Bangladesh', 'Brushed cotton', 'Relaxed', 'Men', 'Autumn/Winter', 21, 5, { tags: ['autumn-26'] }],
    ['CMP', 'Jamdani-trim camp shirt', 'shirts', 'active', 92, 0, 31, ['Indigo', 'Ecru'], 'S3', 140, 41, 4.9, 22, 'us eu', 'Bangladesh', 'Jamdani cotton', 'Relaxed', 'Men', 'All season', 12, 4, { handwoven: true, vendor: 'Dhaka Loom Co.', tags: ['made-in-bd', 'handwoven', 'autumn-26'] }],
    ['LMB', 'Lambswool crew sweater', 'knit', 'active', 128, 0, 46, ['Oatmeal', 'Forest'], 'LX', 380, 77, 4.6, 89, 'us eu wh', 'Scotland', 'Lambswool', 'Regular', 'Unisex', 'Autumn/Winter', 25, 6, { vendor: 'Highland Mill', tags: ['autumn-26'] }],
    ['QZP', 'Merino quarter-zip', 'knit', 'active', 138, 0, 49, ['Navy', 'Charcoal'], 'L', 264, 58, 4.7, 51, 'us eu', 'Portugal', 'Merino wool', 'Regular', 'Men', 'Autumn/Winter', 330, 5, { vendor: 'Porto Knit Lda.', tags: ['merino'] }],
    ['CDG', 'Cable-knit cardigan', 'knit', 'draft', 156, 0, 58, ['Ecru', 'Brown'], 'L', 120, 0, 0, 0, '', 'Scotland', 'Lambswool', 'Relaxed', 'Women', 'Autumn/Winter', 3, 0, { vendor: 'Highland Mill', noDesc: true, tags: ['autumn-26'] }],
    ['HOD', 'Organic hoodie', 'sweats', 'active', 88, 0, 29, ['Forest', 'Grey melange'], 'LX', 476, 203, 4.6, 264, 'us eu wh amz', 'Bangladesh', 'Organic cotton', 'Regular', 'Unisex', 'All season', 500, 6, { forced: { 'Forest/S': [0, 20] }, suppressed: 2, tags: ['bestseller'] }],
    ['FCS', 'Fleece crew sweatshirt', 'sweats', 'active', 74, 0, 24, ['Grey melange', 'Navy'], 'LX', 610, 156, 4.5, 187, 'us eu amz', 'Bangladesh', 'Recycled fleece', 'Relaxed', 'Unisex', 'Autumn/Winter', 400, 5],
    ['HZF', 'Half-zip fleece', 'sweats', 'active', 96, 120, 34, ['Stone', 'Black'], 'L', 92, 21, 4.2, 44, 'us eu', 'Vietnam', 'Recycled polyester', 'Relaxed', 'Unisex', 'Autumn/Winter', 700, 4, { tags: ['sale'] }],
    ['RSH', 'North Sea rain shell', 'rain', 'active', 148, 0, 52, ['Olive', 'Navy'], 'S3', 1140, 96, 4.4, 133, 'us eu amz', 'Vietnam', 'Recycled polyester', 'Regular', 'Unisex', 'All season', 560, 7, { forced: { 'Olive/M': [412, 40] }, suppressed: 3, tags: ['waterproof'] }],
    ['PRJ', 'Packable rain jacket', 'rain', 'active', 118, 0, 41, ['Yellow', 'Black'], 'S3', 420, 52, 4.3, 61, 'us eu amz', 'Vietnam', 'Recycled nylon', 'Regular', 'Women', 'All season', 260, 5, { tags: ['waterproof'] }],
    ['WFJ', 'Waxed field jacket', 'jackets', 'active', 228, 0, 88, ['Olive', 'Navy'], 'L', 186, 38, 4.8, 47, 'us eu', 'England', 'Waxed cotton', 'Regular', 'Men', 'Autumn/Winter', 18, 7, { tags: ['autumn-26', 'waterproof'] }],
    ['QLJ', 'Quilted liner jacket', 'jackets', 'active', 168, 0, 59, ['Olive', 'Black'], 'L', 240, 44, 4.6, 39, 'us eu wh', 'Vietnam', 'Recycled polyester', 'Regular', 'Unisex', 'Autumn/Winter', 18, 6, { tags: ['autumn-26'] }],
    ['CHC', 'Wool chore coat', 'jackets', 'draft', 248, 0, 96, ['Charcoal', 'Navy'], 'S3', 0, 0, 0, 0, '', 'Portugal', 'Wool', 'Relaxed', 'Men', 'Autumn/Winter', 5, 2, { tags: ['autumn-26'], incoming: 180 }],
    ['DTJ', 'Denim trucker jacket', 'jackets', 'archived', 138, 0, 49, ['Indigo'], 'L', 14, 0, 4.1, 88, '', 'Bangladesh', 'Cotton denim', 'Regular', 'Unisex', 'All season', 620, 4],
    ['CHN', 'Relaxed chino', 'trousers', 'active', 89, 0, 28, ['Stone', 'Navy', 'Olive'], 'W', 780, 168, 4.5, 211, 'us eu wh amz', 'Bangladesh', 'Cotton twill', 'Relaxed', 'Men', 'All season', 480, 6, { tags: ['bestseller'] }],
    ['CRT', 'Corduroy trousers', 'trousers', 'active', 98, 0, 33, ['Brown', 'Ecru'], 'W', 360, 71, 4.6, 58, 'us eu', 'Bangladesh', 'Corduroy', 'Relaxed', 'Men', 'Autumn/Winter', 28, 5, { tags: ['autumn-26'] }],
    ['LDT', 'Linen drawstring trousers', 'trousers', 'active', 84, 98, 29, ['Sand', 'Black'], 'LX', 128, 19, 4.4, 73, 'us eu', 'Lithuania', 'Linen', 'Relaxed', 'Women', 'Spring/Summer', 210, 5, { tags: ['sale'] }],
    ['SHT', 'Summer shorts', 'shorts', 'active', 54, 64, 17, ['Stone', 'Navy'], 'W', 1210, 64, 4.3, 142, 'us eu wh amz', 'Bangladesh', 'Cotton twill', 'Regular', 'Men', 'Spring/Summer', 400, 5, { forced: { 'Stone/32': [538, 30] }, suppressed: 1, tags: ['sale'] }],
    ['SWS', 'Swim shorts', 'shorts', 'archived', 48, 0, 15, ['Navy', 'Coral'], 'L', 66, 0, 4.2, 54, '', 'Vietnam', 'Recycled polyester', 'Regular', 'Men', 'Spring/Summer', 640, 4],
    ['TOT', 'Canvas tote', 'bags', 'active', 34, 0, 10, ['Natural'], 'OS', 0, 118, 4.7, 205, 'us eu wh amz', 'Bangladesh', 'Cotton canvas', null, 'Unisex', 'All season', 700, 4, { forced: { 'Natural/One size': [0, 60] }, suppressed: 1, incoming: 400 }],
    ['BPK', 'Waxed canvas backpack', 'bags', 'active', 128, 0, 44, ['Olive', 'Black'], 'OS', 148, 39, 4.8, 66, 'us eu amz', 'Bangladesh', 'Waxed cotton', null, 'Unisex', 'All season', 350, 6, { tags: ['waterproof'] }],
    ['JUT', 'Jute market bag', 'bags', 'active', 28, 0, 7, ['Natural'], 'OS', 520, 91, 4.5, 84, 'us eu wh', 'Bangladesh', 'Jute', null, 'Unisex', 'All season', 300, 4, { handwoven: true, tags: ['made-in-bd', 'handwoven'] }],
    ['BNE', 'Wool beanie', 'hats', 'active', 29, 0, 8, ['Charcoal', 'Navy', 'Rust', 'Forest'], 'OS', 362, 188, 4.6, 176, 'us eu wh amz', 'Scotland', 'Lambswool', null, 'Unisex', 'Autumn/Winter', 690, 5, { forced: { 'Charcoal/One size': [18, 30] }, suppressed: 1, noBarcode: ['Charcoal'], vendor: 'Highland Mill', tags: ['bestseller'] }],
    ['HAT', 'Straw bucket hat', 'hats', 'active', 36, 42, 10, ['Natural', 'Black'], 'OS', 340, 12, 4.2, 58, 'us eu amz', 'Bangladesh', 'Straw', null, 'Women', 'Spring/Summer', 230, 4, { forced: { 'Natural/One size': [296, 20] }, suppressed: 1, tags: ['sale'] }],
    ['CAP', 'Waxed cotton cap', 'hats', 'active', 38, 0, 11, ['Olive', 'Navy', 'Black'], 'OS', 210, 47, 4.4, 33, 'us eu amz', 'England', 'Waxed cotton', null, 'Unisex', 'All season', 190, 4, { tags: ['waterproof'] }],
    ['SCF', 'Jamdani scarf', 'scarves', 'active', 64, 0, 21, ['Indigo', 'Rust', 'Ecru'], 'OS', 158, 54, 4.9, 71, 'us eu wh amz', 'Bangladesh', 'Jamdani cotton', null, 'Women', 'All season', 330, 6, { handwoven: true, suppressed: 2, noBarcode: ['Indigo', 'Rust'], vendor: 'Dhaka Loom Co.', tags: ['made-in-bd', 'handwoven'] }],
    ['LSC', 'Lambswool scarf', 'scarves', 'active', 58, 0, 19, ['Oatmeal', 'Forest', 'Charcoal', 'Rust'], 'OS', 236, 33, 4.7, 29, 'us eu', 'Scotland', 'Lambswool', null, 'Unisex', 'Autumn/Winter', 25, 5, { vendor: 'Highland Mill', tags: ['autumn-26'] }],
    ['CRD', 'Leather card holder', 'leather', 'active', 42, 0, 12, ['Tan', 'Black', 'Brown'], 'OS', 64, 76, 4.6, 112, 'us eu amz', 'Bangladesh', 'Leather', null, 'Unisex', 'All season', 520, 5, { forced: { 'Tan/One size': [9, 15] }, suppressed: 1 }],
    ['BLT', 'Leather belt', 'leather', 'active', 68, 0, 19, ['Tan', 'Black'], 'W', 184, 29, 4.5, 41, 'us eu wh amz', 'Bangladesh', 'Leather', null, 'Men', 'All season', 450, 4],
    ['WAL', 'Bifold wallet', 'leather', 'active', 74, 0, 22, ['Tan', 'Black'], 'OS', 96, 22, 4.7, 18, 'us eu amz', 'Bangladesh', 'Leather', null, 'Men', 'All season', 160, 4],
    ['SCK', 'Recycled socks 3-pack', 'socks', 'active', 24, 0, 6, ['Mixed'], 'SK', 640, 486, 4.4, 512, 'us eu wh amz', 'Turkey', 'Recycled cotton', null, 'Unisex', 'All season', 720, 3, { forced: { 'Mixed/39–42': [22, 50] }, tags: ['bestseller'] }],
    ['MHS', 'Merino hiking socks', 'socks', 'active', 22, 0, 7, ['Charcoal', 'Forest'], 'SK', 410, 152, 4.7, 138, 'us eu amz', 'Portugal', 'Merino wool', null, 'Unisex', 'Autumn/Winter', 280, 3, { vendor: 'Porto Knit Lda.', tags: ['merino'] }],
    ['NKT', 'Nakshi kantha throw', 'home', 'draft', 145, 0, 52, ['Indigo', 'Rust'], 'OS', 24, 0, 0, 0, '', 'Bangladesh', 'Cotton', null, null, 'All season', 4, 3, { handwoven: true, vendor: 'Dhaka Loom Co.', tags: ['made-in-bd', 'handwoven'] }],
    ['JCC', 'Jamdani cushion cover', 'home', 'draft', 48, 0, 15, ['Indigo', 'Ecru', 'Rust'], 'OS', 60, 0, 0, 0, '', 'Bangladesh', 'Jamdani cotton', null, null, null, 6, 0, { handwoven: true, vendor: 'Dhaka Loom Co.', noDesc: true, tags: ['made-in-bd', 'handwoven'] }]
  ];

  /* the long tail: real-sounding styles, generated deterministically */
  var TAIL = {
    tees: [['Slub cotton henley', 44, 'Cotton'], ['Pima cotton polo', 62, 'Pima cotton'], ['Hemp-blend tee', 39, 'Hemp blend'], ['Ringer tee', 32, 'Organic cotton'], ['Boxy crop tee', 36, 'Organic cotton'], ['Raglan baseball tee', 42, 'Cotton'], ['Waffle long-sleeve', 52, 'Cotton'], ['Garment-dyed tee', 38, 'Cotton'], ['Organic cotton tank', 28, 'Organic cotton'], ['Linen-blend tee', 46, 'Linen blend'], ['Graphic tee “Tide”', 36, 'Organic cotton'], ['Graphic tee “Fern”', 36, 'Organic cotton'], ['Merino tank', 54, 'Merino wool'], ['Rib mock-neck tee', 44, 'Cotton']],
    shirts: [['Chambray shirt', 82, 'Cotton chambray'], ['Seersucker camp shirt', 78, 'Cotton'], ['Poplin shirt', 74, 'Cotton'], ['Grandad collar shirt', 79, 'Linen'], ['Corduroy overshirt', 108, 'Corduroy'], ['Denim western shirt', 92, 'Cotton denim'], ['Linen popover', 86, 'Linen'], ['Utility shirt', 88, 'Cotton twill'], ['Brushed twill shirt', 84, 'Brushed cotton'], ['Gauze resort shirt', 76, 'Cotton gauze']],
    knit: [['Merino V-neck', 118, 'Merino wool'], ['Cotton rollneck', 96, 'Cotton'], ['Fisherman sweater', 148, 'Lambswool'], ['Merino cardigan', 138, 'Merino wool'], ['Knitted vest', 88, 'Lambswool'], ['Lambswool polo knit', 124, 'Lambswool'], ['Mohair-blend crew', 158, 'Mohair blend'], ['Cotton cable crew', 112, 'Cotton']],
    sweats: [['Zip hoodie', 94, 'Organic cotton'], ['Garment-dyed crew sweat', 78, 'Cotton'], ['Sweatpants', 72, 'Organic cotton'], ['Loopback shorts', 52, 'Organic cotton'], ['Heavyweight hoodie', 104, 'Cotton'], ['Track jacket', 98, 'Recycled polyester']],
    jackets: [['Chore jacket', 158, 'Cotton twill'], ['Harrington jacket', 178, 'Cotton'], ['Puffer vest', 138, 'Recycled polyester'], ['Down parka', 298, 'Recycled polyester'], ['Bomber jacket', 188, 'Recycled nylon'], ['Fleece jacket', 118, 'Recycled fleece'], ['Overshirt jacket', 148, 'Wool']],
    rain: [['Rain poncho', 78, 'Recycled polyester'], ['Long rain coat', 188, 'Recycled polyester'], ['Rain trousers', 88, 'Recycled nylon']],
    trousers: [['Pleated trousers', 112, 'Wool'], ['Carpenter pants', 96, 'Cotton canvas'], ['Wide-leg trousers', 98, 'Cotton twill'], ['Slim chino', 89, 'Cotton twill'], ['Cargo trousers', 99, 'Cotton ripstop'], ['Selvedge jeans', 148, 'Cotton denim'], ['Straight-leg jeans', 118, 'Cotton denim']],
    shorts: [['Linen shorts', 58, 'Linen'], ['Cargo shorts', 62, 'Cotton ripstop'], ['Running shorts', 48, 'Recycled polyester'], ['Denim shorts', 64, 'Cotton denim'], ['Pleated shorts', 66, 'Cotton twill']],
    bags: [['Leather weekender', 298, 'Leather'], ['Crossbody bag', 88, 'Cotton canvas'], ['Laptop sleeve', 58, 'Recycled fleece'], ['Drawstring pouch', 18, 'Cotton canvas'], ['Roll-top backpack', 148, 'Recycled nylon'], ['Mini tote', 26, 'Cotton canvas']],
    hats: [['Corduroy cap', 36, 'Corduroy'], ['Fisherman beanie', 32, 'Merino wool'], ['Linen bucket hat', 38, 'Linen'], ['Trapper hat', 78, 'Wool'], ['Wool flat cap', 54, 'Wool']],
    scarves: [['Cotton bandana', 18, 'Cotton'], ['Cashmere-blend scarf', 118, 'Cashmere blend'], ['Silk neckerchief', 48, 'Silk'], ['Gamcha scarf', 34, 'Cotton']],
    leather: [['Leather key ring', 24, 'Leather'], ['Coin pouch', 32, 'Leather'], ['Passport cover', 56, 'Leather'], ['Watch strap', 44, 'Leather'], ['Leather gloves', 78, 'Leather']],
    socks: [['Cotton crew socks 5-pack', 32, 'Organic cotton'], ['Wool boot socks', 26, 'Lambswool'], ['Ankle socks 3-pack', 19, 'Recycled cotton'], ['Linen-blend socks', 16, 'Linen blend']]
  };
  var PALETTE = ['Navy', 'Black', 'Oatmeal', 'White', 'Sand', 'Sage', 'Olive', 'Forest', 'Charcoal', 'Stone', 'Ecru', 'Brown', 'Rust', 'Khaki', 'Cream', 'Terracotta', 'Slate', 'Mustard', 'Burgundy', 'Indigo'];
  var CAT_SIZES = { tees: 'L', shirts: 'L', knit: 'L', sweats: 'LX', jackets: 'S3', rain: 'S3', trousers: 'W', shorts: 'W', bags: 'OS', hats: 'OS', scarves: 'OS', leather: 'OS', socks: 'SK' };
  var ORIGIN_OF = { 'Merino wool': 'Portugal', Lambswool: 'Scotland', Wool: 'Portugal', Linen: 'Lithuania', 'Linen blend': 'Lithuania', 'Recycled polyester': 'Vietnam', 'Recycled nylon': 'Vietnam', 'Recycled fleece': 'Vietnam', 'Mohair blend': 'Scotland', 'Cashmere blend': 'Scotland', Silk: 'India', 'Recycled cotton': 'Turkey' };
  var SEASON_OF = { knit: 'Autumn/Winter', jackets: 'Autumn/Winter', shorts: 'Spring/Summer' };
  var FITS = ['Slim', 'Regular', 'Regular', 'Relaxed', 'Oversized'];

  function buildTail() {
    var r = rng(4417), out = [], n = 0;
    Object.keys(TAIL).forEach(function (cat) {
      TAIL[cat].forEach(function (t) {
        n++;
        var code = t[0].replace(/[^A-Za-z ]/g, '').split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2) + String.fromCharCode(65 + (n % 26));
        var nc = cat === 'socks' || cat === 'leather' || cat === 'scarves' ? 1 + Math.floor(r() * 2) : 2 + Math.floor(r() * 2), colors = [];
        while (colors.length < nc) { var c = PALETTE[Math.floor(r() * PALETTE.length)]; if (colors.indexOf(c) < 0) colors.push(c); }
        var roll = r(), status = roll < 0.07 ? 'archived' : roll < 0.14 ? 'draft' : 'active';
        var created = status === 'draft' ? 2 + Math.floor(r() * 20) : r() < 0.1 ? 5 + Math.floor(r() * 25) : 40 + Math.floor(r() * 820);
        var sizes = SZ[CAT_SIZES[cat]].length * nc, stock = status === 'draft' ? Math.floor(r() * 3) * 40 : Math.round(sizes * (6 + r() * 22));
        var sold = status === 'active' ? Math.round(Math.pow(r(), 1.6) * 90 * (t[1] < 60 ? 1.6 : 1)) : 0;
        var chs = status !== 'active' ? '' : ['us', r() < 0.86 ? 'eu' : '', r() < 0.34 ? 'wh' : '', r() < 0.22 ? 'amz' : ''].filter(Boolean).join(' ');
        var sale = status === 'active' && r() < 0.1;
        var gender = r() < 0.12 ? null : ['Unisex', 'Unisex', 'Men', 'Women'][Math.floor(r() * 4)];
        var fit = ['bags', 'hats', 'scarves', 'leather', 'socks'].indexOf(cat) >= 0 ? null : r() < 0.08 ? null : FITS[Math.floor(r() * FITS.length)];
        var reviews = status === 'draft' ? 0 : Math.round(Math.pow(r(), 1.4) * 120);
        out.push([code, t[0], cat, status, t[1], sale ? Math.round(t[1] * 1.25) : 0, Math.round(t[1] * (0.3 + r() * 0.08) * 100) / 100, colors, CAT_SIZES[cat], stock, sold,
          reviews ? Math.round((4 + r() * 0.9) * 10) / 10 : 0, reviews, chs, ORIGIN_OF[t[2]] || 'Bangladesh', t[2], fit, gender,
          r() < 0.06 ? null : SEASON_OF[cat] || 'All season', created, status === 'draft' && r() < 0.5 ? 0 : 3 + Math.floor(r() * 4),
          { tags: sale ? ['sale'] : [], noCare: r() < 0.07, noHs: r() < 0.05 }]);
      });
    });
    return out;
  }

  function buildProducts() {
    var rows = HERO.concat(buildTail()), r = rng(9021), out = [];
    rows.forEach(function (p, i) {
      var x = p[21] || {}, cat = CATEGORIES.filter(function (c) { return c.key === p[2]; })[0];
      var colors = p[7], sizes = SZ[p[8]], vars = [], forced = x.forced || {}, free = [];
      colors.forEach(function (col) {
        sizes.forEach(function (sz) {
          var cc = (x.cc && x.cc[col]) || CC[col] || col.slice(0, 3).toUpperCase();
          var v = { sku: 'SKU-' + p[0] + '-' + cc + '-' + sizeCode(sz), color: col, size: sz, label: sz === 'One size' ? col : col + ' / ' + sz, stock: 0, reorder: 0, barcode: !(x.noBarcode && x.noBarcode.indexOf(col) >= 0) };
          var f = forced[col + '/' + sz];
          if (f) { v.stock = f[0]; v.reorder = f[1]; } else free.push(v);
          vars.push(v);
        });
      });
      var left = p[9] - vars.reduce(function (a, v) { return a + v.stock; }, 0), w = free.map(function () { return 0.75 + r() * 0.5; }), ws = w.reduce(function (a, b) { return a + b; }, 0);
      free.forEach(function (v, k) { v.stock = k === free.length - 1 ? left : Math.round(p[9] * 0 + (left > 0 ? left : 0) * w[k] / ws); });
      if (free.length > 1) { var sum = free.slice(0, -1).reduce(function (a, v) { return a + v.stock; }, 0); free[free.length - 1].stock = Math.max(0, left - sum); }
      free.forEach(function (v) { v.reorder = Math.max(5, Math.min(40, Math.round(v.stock * 0.3))); });
      var active = p[3] === 'active';
      var low = vars.filter(function (v) { return active && v.stock > 0 && v.stock < v.reorder; }).length;
      var out0 = vars.filter(function (v) { return active && v.stock === 0; }).length;
      out.push({
        id: 'PRD-' + (1001 + i), code: p[0], name: p[1], handle: p[1].toLowerCase().replace(/[“”]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), cat: p[2], parent: cat.parent, status: p[3],
        price: p[4], compareAt: p[5] || null, cost: p[6], colors: colors, sizes: sizes, variants: vars, stock: p[9], sold30: p[10], rating: p[11], reviews: p[12],
        channels: p[13] ? p[13].split(' ') : [], origin: p[14], material: p[15], fit: p[16], gender: p[17], season: p[18], created: NOW - p[19] * DAY - Math.round(r() * 8e7),
        updated: NOW - Math.round(Math.pow(r(), 2) * 40 * DAY), media: p[20], vendor: x.vendor || 'Fernhill', tags: x.tags || [], handwoven: !!x.handwoven,
        hasDesc: !x.noDesc, care: !x.noCare, hs: x.noHs ? null : HS[p[2]] || '6109.10', weight: WEIGHT[p[2]] || 300, suppressed: x.suppressed || 0, incoming: x.incoming || 0,
        lowVariants: low, outVariants: out0, stockStatus: !active ? 'na' : p[9] === 0 ? 'out' : low + out0 > 0 ? 'low' : 'ok'
      });
    });
    /* revenue per channel, scaled so each channel matches its 30-day revenue on Sales Channels */
    var SHARE = { us: 0.52, eu: 0.27, wh: 0.13, amz: 0.08 };
    out.forEach(function (p) {
      var on = p.channels, tot = on.reduce(function (a, c) { return a + SHARE[c]; }, 0);
      p.revCh = {}; on.forEach(function (c) { p.revCh[c] = p.sold30 * p.price * SHARE[c] / tot; });
    });
    CHANNELS.forEach(function (ch) {
      var sum = out.reduce(function (a, p) { return a + (p.revCh[ch.key] || 0); }, 0), k = sum ? ch.rev / sum : 0;
      out.forEach(function (p) { if (p.revCh[ch.key] != null) p.revCh[ch.key] *= k; });
    });
    /* units follow from revenue: wholesale sells at 55% of retail, retail averages 12% off list after promotions */
    var NET = { us: 0.88, eu: 0.88, wh: 0.55, amz: 0.92 };
    out.forEach(function (p) {
      p.unitsCh = {}; Object.keys(p.revCh).forEach(function (c) { p.unitsCh[c] = p.revCh[c] / (p.price * NET[c]); });
      p.rev30 = Object.keys(p.revCh).reduce(function (a, c) { return a + p.revCh[c]; }, 0);
      p.sold30 = Math.round(Object.keys(p.unitsCh).reduce(function (a, c) { return a + p.unitsCh[c]; }, 0));
    });
    return out;
  }
  var HS = { tees: '6109.10', shirts: '6205.20', knit: '6110.11', sweats: '6110.20', jackets: '6201.40', rain: '6201.40', trousers: '6203.42', shorts: '6203.42', bags: '4202.92', hats: '6505.00', scarves: '6214.90', leather: '4202.31', socks: '6115.95', home: '6304.92' };
  var WEIGHT = { tees: 210, shirts: 320, knit: 480, sweats: 560, jackets: 1150, rain: 520, trousers: 620, shorts: 380, bags: 640, hats: 110, scarves: 160, leather: 90, socks: 120, home: 1300 };
  var PRODUCTS = buildProducts();

  /* ---------- collections ---------- */
  function ids(codes) { return codes.map(function (c) { return PRODUCTS.filter(function (p) { return p.code === c; })[0].id; }); }
  var COLLECTIONS = [
    { key: 'autumn-26', name: 'Autumn ’26 drop', type: 'manual', status: 'active', handle: 'autumn-26', channels: ['us', 'eu'], since: NOW - 16 * DAY, sort: 'manual', tone: 'c3',
      desc: 'Flannel, lambswool and waxed cotton for the cold months. Lead story on the homepage until November.',
      products: ids(['WFJ', 'LMB', 'FLN', 'CMP', 'QLJ', 'CRT', 'LSC', 'QZP', 'CDG', 'CHC']) },
    { key: 'bestsellers', name: 'Bestsellers', type: 'smart', status: 'active', handle: 'bestsellers', channels: ['us', 'eu', 'wh', 'amz'], since: NOW - 610 * DAY, sort: 'best', tone: 'c0', match: 'all',
      desc: 'Updates itself every night from the last 30 days of sales.', rules: [{ field: 'sold30', op: 'gte', value: '40' }, { field: 'status', op: 'eq', value: 'active' }] },
    { key: 'new', name: 'New arrivals', type: 'smart', status: 'active', handle: 'new-arrivals', channels: ['us', 'eu'], since: NOW - 610 * DAY, sort: 'newest', tone: 'c1', match: 'all',
      desc: 'Anything added in the last 30 days.', rules: [{ field: 'created', op: 'within', value: '30' }, { field: 'status', op: 'eq', value: 'active' }] },
    { key: 'under-50', name: 'Gifts under $50', type: 'smart', status: 'active', handle: 'gifts-under-50', channels: ['us', 'eu'], since: NOW - 280 * DAY, sort: 'best', tone: 'c2', match: 'all',
      desc: 'Stocking fillers and small gifts.', rules: [{ field: 'price', op: 'lt', value: '50' }, { field: 'stock', op: 'gt', value: '0' }, { field: 'status', op: 'eq', value: 'active' }] },
    { key: 'made-in-bd', name: 'Made in Bangladesh', type: 'smart', status: 'active', handle: 'made-in-bangladesh', channels: ['us', 'eu', 'wh'], since: NOW - 340 * DAY, sort: 'best', tone: 'c2', match: 'all',
      desc: 'Our partner workshops in Dhaka and Narayanganj, including handwoven Jamdani.', rules: [{ field: 'origin', op: 'eq', value: 'Bangladesh' }, { field: 'status', op: 'eq', value: 'active' }] },
    { key: 'merino', name: 'Merino essentials', type: 'smart', status: 'active', handle: 'merino', channels: ['us', 'eu', 'amz'], since: NOW - 400 * DAY, sort: 'best', tone: 'c4', match: 'all',
      desc: 'Temperature-regulating merino from Porto Knit.', rules: [{ field: 'material', op: 'eq', value: 'Merino wool' }, { field: 'status', op: 'eq', value: 'active' }] },
    { key: 'rainy', name: 'Rainy day edit', type: 'manual', status: 'active', handle: 'rainy-day', channels: ['us', 'eu'], since: NOW - 30 * DAY, sort: 'manual', tone: 'c1',
      desc: 'Shells, waxed cotton and wool for wet weather.', products: ids(['RSH', 'PRJ', 'WFJ', 'CAP', 'BPK', 'BNE']) },
    { key: 'last-chance', name: 'Last chance', type: 'smart', status: 'active', handle: 'sale', channels: ['us', 'eu'], since: NOW - 60 * DAY, sort: 'price-asc', tone: 'c3', match: 'all',
      desc: 'End-of-season markdowns. Anything with a compare-at price.', rules: [{ field: 'compareAt', op: 'set', value: '' }, { field: 'status', op: 'eq', value: 'active' }] },
    { key: 'gift-guide', name: 'Holiday gift guide 2026', type: 'manual', status: 'scheduled', handle: 'gift-guide', channels: ['us', 'eu'], since: Date.UTC(2026, 10, 16, 8), sort: 'manual', tone: 'c0',
      desc: 'Goes live on Nov 16 with the holiday email.', products: ids(['SCF', 'CRD', 'WAL', 'BNE', 'LSC', 'TOT', 'SCK', 'MHS', 'NKT', 'JUT']) },
    { key: 'wholesale-core', name: 'Wholesale core range', type: 'manual', status: 'active', handle: 'trade-core', channels: ['wh'], since: NOW - 200 * DAY, sort: 'manual', tone: 'c4',
      desc: 'Styles we keep in stock all year for trade buyers.', products: ids(['TEE', 'TSH', 'OXF', 'CHN', 'HOD', 'SCK', 'BNE', 'TOT', 'JUT']) },
    { key: 'summer-26', name: 'Summer ’26', type: 'manual', status: 'hidden', handle: 'summer-26', channels: [], since: NOW - 150 * DAY, sort: 'manual', tone: 'c3',
      desc: 'Unpublished on Aug 31. Kept for next year’s reference.', products: ids(['SHT', 'LDT', 'HAT', 'BRT', 'OVS', 'SWS']) }
  ];
  var RULE_FIELDS = [
    { value: 'price', label: 'Price', kind: 'number' }, { value: 'compareAt', label: 'Compare-at price', kind: 'set' }, { value: 'sold30', label: 'Units sold (30 days)', kind: 'number' },
    { value: 'stock', label: 'Stock on hand', kind: 'number' }, { value: 'created', label: 'Date added', kind: 'within' }, { value: 'material', label: 'Material', kind: 'text' },
    { value: 'origin', label: 'Country of origin', kind: 'text' }, { value: 'cat', label: 'Category', kind: 'text' }, { value: 'tag', label: 'Tag', kind: 'text' }, { value: 'status', label: 'Status', kind: 'text' }
  ];
  function ruleMatch(p, rule) {
    var v = rule.value, n = Number(v);
    switch (rule.field) {
      case 'price': case 'sold30': case 'stock':
        var x = p[rule.field]; return rule.op === 'lt' ? x < n : rule.op === 'gt' ? x > n : rule.op === 'gte' ? x >= n : rule.op === 'lte' ? x <= n : x === n;
      case 'compareAt': return rule.op === 'set' ? !!p.compareAt : !p.compareAt;
      case 'created': return NOW - p.created <= n * DAY;
      case 'tag': return rule.op === 'neq' ? p.tags.indexOf(v) < 0 : p.tags.indexOf(v) >= 0;
      case 'cat': return rule.op === 'neq' ? !(p.cat === v || p.parent === v) : p.cat === v || p.parent === v;
      default: var val = String(p[rule.field] || '').toLowerCase(), t = String(v).toLowerCase();
        return rule.op === 'neq' ? val !== t : rule.op === 'contains' ? val.indexOf(t) >= 0 : val === t;
    }
  }
  function collectionProducts(col, list) {
    list = list || PRODUCTS;
    if (col.type === 'manual') return col.products.map(function (id) { return list.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean);
    if (!col.rules.length) return [];
    return list.filter(function (p) { return col.match === 'any' ? col.rules.some(function (r) { return ruleMatch(p, r); }) : col.rules.every(function (r) { return ruleMatch(p, r); }); });
  }

  /* ---------- attributes ---------- */
  var ATTRIBUTES = [
    { key: 'color', name: 'Color', group: 'variant', type: 'Swatch', scope: 'Variant option', filterable: true, required: true, google: 'color', applies: 'all', desc: 'Defines variants. Shown as swatches on product pages and in storefront filters.' },
    { key: 'size', name: 'Size', group: 'variant', type: 'Dropdown', scope: 'Variant option', filterable: true, required: true, google: 'size', applies: 'all', desc: 'Defines variants. Letter sizes for tops, waist sizes for bottoms and belts, EU ranges for socks.' },
    { key: 'material', name: 'Material', group: 'details', type: 'Dropdown', scope: 'Product', filterable: true, required: true, google: 'material', applies: 'all', desc: 'Main fabric. Used by the Merino essentials collection and storefront filters.' },
    { key: 'fit', name: 'Fit', group: 'details', type: 'Dropdown', scope: 'Product', filterable: true, required: false, google: null, applies: ['tops', 'outer', 'bottoms'], desc: 'How the garment is cut. Drives the size guide note on product pages.' },
    { key: 'gender', name: 'Gender', group: 'details', type: 'Dropdown', scope: 'Product', filterable: true, required: true, google: 'gender', applies: ['tops', 'outer', 'bottoms', 'acc'], desc: 'Required by Google Shopping and Amazon for apparel.' },
    { key: 'season', name: 'Season', group: 'details', type: 'Dropdown', scope: 'Product', filterable: false, required: false, google: null, applies: 'all', desc: 'Used to plan markdowns and seasonal collections.' },
    { key: 'care', name: 'Care instructions', group: 'details', type: 'Text', scope: 'Product', filterable: false, required: true, google: null, applies: ['tops', 'outer', 'bottoms', 'acc'], desc: 'Washing and care text printed on product pages. Required for EU textile labelling.' },
    { key: 'handwoven', name: 'Handwoven', group: 'details', type: 'Yes / No', scope: 'Product', filterable: true, required: false, google: null, applies: 'all', desc: 'Adds a “Handwoven in Bangladesh” badge on product pages.' },
    { key: 'origin', name: 'Country of origin', group: 'compliance', type: 'Dropdown', scope: 'Product', filterable: false, required: true, google: null, applies: 'all', desc: 'Printed on customs forms for every international shipment.' },
    { key: 'hs', name: 'HS tariff code', group: 'compliance', type: 'Text', scope: 'Product', filterable: false, required: true, google: null, applies: 'all', desc: 'Six-digit customs code. Missing codes hold EU and wholesale export shipments.' },
    { key: 'barcode', name: 'Barcode (GTIN)', group: 'compliance', type: 'Text', scope: 'Variant', filterable: false, required: true, google: 'gtin', applies: 'all', desc: 'UPC or EAN on every variant. Amazon and Google need it to list the product.' },
    { key: 'weight', name: 'Shipping weight', group: 'compliance', type: 'Number (g)', scope: 'Variant', filterable: false, required: true, google: 'shipping_weight', applies: 'all', desc: 'Used to quote carrier rates at checkout.' }
  ];

  /* ---------- helpers ---------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtWhen(ts) { var d = new Date(ts), t = pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()); if (ts >= DAY0 && ts < DAY0 + DAY) return 'Today, ' + t; if (ts >= DAY0 - DAY && ts < DAY0) return 'Yesterday, ' + t; return MON[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + t; }
  function fmtDate(ts) { var d = new Date(ts); return MON[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); }
  function timeAgo(ts) { var m = Math.max(1, Math.round((NOW - ts) / 6e4)); if (m < 60) return m + ' min ago'; var hh = Math.round(m / 60); if (hh < 24) return hh + 'h ago'; var d = Math.round(hh / 24); if (d < 45) return d === 1 ? '1 day ago' : d + ' days ago'; var mo = Math.round(d / 30); return mo < 12 ? mo + ' months ago' : Math.round(mo / 12) + (Math.round(mo / 12) === 1 ? ' year ago' : ' years ago'); }
  function int(n) { return Math.round(n).toLocaleString('en-US'); }
  function money0(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function money2(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function signedPct(d) { return (d > 0 ? '+' : d < 0 ? '−' : '') + (Math.abs(d) * 100).toFixed(1) + '%'; }
  function initials(name) { return name.replace(/[“”’]/g, '').split(/[\s-]+/).filter(function (w) { return /^[A-Za-z]/.test(w); }).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(); }
  function plural(n, one, many) { return int(n) + ' ' + (n === 1 ? one : many || one + 's'); }
  function catOf(key) { return CATEGORIES.filter(function (c) { return c.key === key; })[0]; }
  function catPath(key) { var c = catOf(key); if (!c) return '—'; var p = c.parent ? catOf(c.parent) : null; return p ? p.name + ' › ' + c.name : c.name; }
  /* thumbnail tone by top-level category */
  var THUMB = { tops: 'th-0', outer: 'th-1', bottoms: 'th-2', acc: 'th-3', home: 'th-4' };
  function thumbCls(p) { return 'pr-thumb ' + (THUMB[p.parent || p.cat] || 'th-4'); }
  function channelOf(store) { return CHANNELS.filter(function (c) { return c.store === store; })[0] || null; }
  function navLabel(path) { var r = window.CommerceOS.navResolve(path); return r.page ? r.page.label : r.module ? r.module.label : path; }

  window.Fernhill = {
    NOW: NOW, DAY0: DAY0, DAY: DAY, rng: rng, STORES: STORES, USER: USER, CHANNELS: CHANNELS, CATEGORIES: CATEGORIES, PRODUCTS: PRODUCTS,
    COLLECTIONS: COLLECTIONS, RULE_FIELDS: RULE_FIELDS, ruleMatch: ruleMatch, collectionProducts: collectionProducts, ATTRIBUTES: ATTRIBUTES, SWATCH: SWATCH,
    fmtWhen: fmtWhen, fmtDate: fmtDate, timeAgo: timeAgo, int: int, money0: money0, money2: money2, signedPct: signedPct, initials: initials, plural: plural,
    catOf: catOf, catPath: catPath, thumbCls: thumbCls, channelOf: channelOf, navLabel: navLabel
  };
})();
