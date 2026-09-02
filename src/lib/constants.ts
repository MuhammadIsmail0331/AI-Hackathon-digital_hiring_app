// ─── Worker Categories ───────────────────────────────────
export const WORKER_CATEGORIES = [
  { id: "painter", en: "Painter", ur: "پینٹر" },
  { id: "plumber", en: "Plumber", ur: "پلمبر" },
  { id: "electrician", en: "Electrician", ur: "الیکٹریشن" },
  { id: "carpenter", en: "Carpenter", ur: "بڑھئی" },
  { id: "mason", en: "Mason", ur: "مستری" },
  { id: "labourer", en: "Labourer", ur: "مزدور" },
  { id: "cleaner", en: "Cleaner", ur: "صفائی والا" },
  { id: "welder", en: "Welder", ur: "ویلڈر" },
  { id: "gardener", en: "Gardener", ur: "مالی" },
  { id: "driver", en: "Driver", ur: "ڈرائیور" },
  { id: "helper", en: "Helper", ur: "مددگار" },
  { id: "other", en: "Other", ur: "دیگر" },
] as const;

export type WorkerCategoryId = (typeof WORKER_CATEGORIES)[number]["id"];

// ─── Tools ───────────────────────────────────────────────
export const TOOLS = [
  { id: "hammer", en: "Hammer", ur: "ہتھوڑا" },
  { id: "drill", en: "Drill", ur: "ڈرل" },
  { id: "wrench", en: "Wrench", ur: "رینچ" },
  { id: "saw", en: "Saw", ur: "آری" },
  { id: "ladder", en: "Ladder", ur: "سیڑھی" },
  { id: "paint_roller", en: "Paint Roller", ur: "پینٹ رولر" },
  { id: "brush", en: "Brush", ur: "برش" },
  { id: "shovel", en: "Shovel", ur: "بیلچہ" },
  { id: "wheelbarrow", en: "Wheelbarrow", ur: "ریکھڑی" },
  { id: "safety_gear", en: "Safety Gear", ur: "حفاظتی سامان" },
  { id: "measuring_tape", en: "Measuring Tape", ur: "فیتہ" },
  { id: "pliers", en: "Pliers", ur: "پلاس" },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];

// ─── Days of Week ────────────────────────────────────────
export const DAYS_OF_WEEK = [
  { id: "mon", en: "Monday", ur: "پیر" },
  { id: "tue", en: "Tuesday", ur: "منگل" },
  { id: "wed", en: "Wednesday", ur: "بدھ" },
  { id: "thu", en: "Thursday", ur: "جمعرات" },
  { id: "fri", en: "Friday", ur: "جمعہ" },
  { id: "sat", en: "Saturday", ur: "ہفتہ" },
  { id: "sun", en: "Sunday", ur: "اتوار" },
] as const;

export type DayId = (typeof DAYS_OF_WEEK)[number]["id"];

// ─── Role ────────────────────────────────────────────────
export const ROLES = ["WORKER", "EMPLOYER"] as const;
export type Role = (typeof ROLES)[number];

// ─── Job Status ──────────────────────────────────────────
export const JOB_STATUSES = [
  "DRAFT",
  "OPEN",
  "MATCHING",
  "OFFERS_SENT",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

// ─── Offer Status ────────────────────────────────────────
export const OFFER_STATUSES = ["PENDING", "ACCEPTED", "DECLINED"] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

// ─── Payment Status ──────────────────────────────────────
export const PAYMENT_STATUSES = [
  "PENDING",
  "SECURED",
  "HELD",
  "RELEASED",
  "CANCELLED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ─── Skills per Category ─────────────────────────────────
export const SKILLS_MAP: Record<WorkerCategoryId, readonly { id: string; en: string; ur: string }[]> = {
  painter: [
    { id: "interior_painting", en: "Interior Painting", ur: "اندرونی پینٹنگ" },
    { id: "exterior_painting", en: "Exterior Painting", ur: "بیرونی پینٹنگ" },
    { id: "wallpaper", en: "Wallpaper", ur: "وال پیپر" },
    { id: "texture", en: "Texture Work", ur: "ٹیکسچر ورک" },
    { id: "waterproofing", en: "Waterproofing", ur: "واٹر پروفنگ" },
  ],
  plumber: [
    { id: "pipe_fitting", en: "Pipe Fitting", ur: "پائپ فٹنگ" },
    { id: "drainage", en: "Drainage", ur: "نکاسی" },
    { id: "water_heater", en: "Water Heater", ur: "گیزر" },
    { id: "tap_repair", en: "Tap Repair", ur: "نال مرمت" },
    { id: "toilet_install", en: "Toilet Install", ur: "ٹوائلیٹ لگانا" },
  ],
  electrician: [
    { id: "wiring", en: "Wiring", ur: "وائرنگ" },
    { id: "fan_install", en: "Fan Installation", ur: "پنکھا لگانا" },
    { id: "switchboard", en: "Switchboard", ur: "سوئچ بورڈ" },
    { id: "generator", en: "Generator Repair", ur: "جنریٹر مرمت" },
    { id: "solar", en: "Solar Panel", ur: "سولر پینل" },
  ],
  carpenter: [
    { id: "furniture", en: "Furniture Making", ur: "فرنیچر بنانا" },
    { id: "door_repair", en: "Door Repair", ur: "دروازہ مرمت" },
    { id: "window_work", en: "Window Work", ur: "کھڑکی کام" },
    { id: "flooring", en: "Flooring", ur: "فلورنگ" },
    { id: "kitchen_cabinet", en: "Kitchen Cabinet", ur: "کچن الماری" },
  ],
  mason: [
    { id: "brick_work", en: "Brick Work", ur: "اینٹوں کا کام" },
    { id: "plastering", en: "Plastering", ur: "پلاسٹر" },
    { id: "tiling", en: "Tiling", ur: "ٹائلنگ" },
    { id: "concrete", en: "Concrete Work", ur: "کنکریٹ کام" },
    { id: "boundary_wall", en: "Boundary Wall", ur: "باؤنڈری وال" },
  ],
  labourer: [
    { id: "loading", en: "Loading/Unloading", ur: "لوڈنگ/اتارنا" },
    { id: "digging", en: "Digging", ur: "کھدائی" },
    { id: "construction", en: "Construction Help", ur: "تعمیراتی مدد" },
    { id: "demolition", en: "Demolition", ur: "منہدم کرنا" },
    { id: "moving", en: "Moving/Shifting", ur: "منتقلی" },
  ],
  cleaner: [
    { id: "home_cleaning", en: "Home Cleaning", ur: "گھر کی صفائی" },
    { id: "office_cleaning", en: "Office Cleaning", ur: "دفتر کی صفائی" },
    { id: "vehicle_wash", en: "Vehicle Wash", ur: "گاڑی دھونا" },
    { id: "deep_clean", en: "Deep Cleaning", ur: "گہری صفائی" },
    { id: "window_clean", en: "Window Cleaning", ur: "کھڑکی صفائی" },
  ],
  welder: [
    { id: "gate_grill", en: "Gate & Grill", ur: "گیٹ اور گرل" },
    { id: "pipe_welding", en: "Pipe Welding", ur: "پائپ ویلڈنگ" },
    { id: "structural", en: "Structural Welding", ur: "اسٹرکچرل ویلڈنگ" },
    { id: "repair", en: "Metal Repair", ur: "دھات مرمت" },
    { id: "custom_fabrication", en: "Custom Fabrication", ur: "کسٹم فبریکیشن" },
  ],
  gardener: [
    { id: "lawn_care", en: "Lawn Care", ur: "لان کی دیکھ بھال" },
    { id: "tree_trimming", en: "Tree Trimming", ur: "درختوں کی کٹائی" },
    { id: "planting", en: "Planting", ur: "پودے لگانا" },
    { id: "irrigation", en: "Irrigation", ur: "آبپاشی" },
    { id: "pest_control", en: "Pest Control", ur: "کیڑے مارنا" },
  ],
  driver: [
    { id: "car", en: "Car Driving", ur: "کار ڈرائیونگ" },
    { id: "bike", en: "Bike/Motorcycle", ur: "بائیک/موٹر سائیکل" },
    { id: "truck", en: "Truck/Loader", ur: "ٹرک/لوڈر" },
    { id: "rickshaw", en: "Rickshaw", ur: "رکشہ" },
    { id: "heavy_vehicle", en: "Heavy Vehicle", ur: "بھاری گاڑی" },
  ],
  helper: [
    { id: "general_help", en: "General Help", ur: "عام مدد" },
    { id: "kitchen_help", en: "Kitchen Help", ur: "کچن مدد" },
    { id: "event_help", en: "Event Help", ur: "تقریب مدد" },
    { id: "construction_help", en: "Construction Help", ur: "تعمیراتی مدد" },
    { id: "shop_help", en: "Shop Help", ur: "دکان مدد" },
  ],
  other: [
    { id: "misc", en: "Other Skills", ur: "دیگر مہارتیں" },
  ],
} as const;

// ─── Experience Levels ───────────────────────────────────
export const EXPERIENCE_LEVELS = [
  { id: "beginner", en: "Beginner (0-1 years)", ur: "مبتدی (0-1 سال)", years: 1 },
  { id: "intermediate", en: "Intermediate (2-4 years)", ur: "درمیانہ (2-4 سال)", years: 3 },
  { id: "experienced", en: "Experienced (5-9 years)", ur: "تجربہ کار (5-9 سال)", years: 7 },
  { id: "expert", en: "Expert (10+ years)", ur: "ماہر (10+ سال)", years: 10 },
] as const;

export type ExperienceLevelId = (typeof EXPERIENCE_LEVELS)[number]["id"];

// ─── Pakistani Cities ────────────────────────────────────
export const PAKISTAN_CITIES = [
  { id: "karachi", en: "Karachi", ur: "کراچی" },
  { id: "lahore", en: "Lahore", ur: "لاہور" },
  { id: "islamabad", en: "Islamabad", ur: "اسلام آباد" },
  { id: "rawalpindi", en: "Rawalpindi", ur: "راولپنڈی" },
  { id: "faisalabad", en: "Faisalabad", ur: "فیصل آباد" },
  { id: "multan", en: "Multan", ur: "ملتان" },
  { id: "peshawar", en: "Peshawar", ur: "پشاور" },
  { id: "quetta", en: "Quetta", ur: "کوئٹہ" },
  { id: "sialkot", en: "Sialkot", ur: "سیالکوٹ" },
  { id: "gujranwala", en: "Gujranwala", ur: "گوجرانوالہ" },
  { id: "hyderabad", en: "Hyderabad", ur: "حیدرآباد" },
  { id: "other_city", en: "Other City", ur: "دیگر شہر" },
] as const;

export type CityId = (typeof PAKISTAN_CITIES)[number]["id"];

// ─── Languages ───────────────────────────────────────────
export const LANGUAGES = ["en", "ur"] as const;
export type Language = (typeof LANGUAGES)[number];

// ─── City Coordinates (fallback when GPS unavailable) ────
export const CITY_COORDINATES: Record<CityId, { lat: number; lng: number }> = {
  karachi:      { lat: 24.8607, lng: 67.0011 },
  lahore:       { lat: 31.5204, lng: 74.3587 },
  islamabad:    { lat: 33.6844, lng: 73.0479 },
  rawalpindi:   { lat: 33.5651, lng: 73.0169 },
  faisalabad:   { lat: 31.4504, lng: 73.1350 },
  multan:       { lat: 30.1575, lng: 71.5249 },
  peshawar:     { lat: 34.0151, lng: 71.5249 },
  quetta:       { lat: 30.1798, lng: 66.9750 },
  sialkot:      { lat: 32.4945, lng: 74.5229 },
  gujranwala:   { lat: 32.1877, lng: 74.1945 },
  hyderabad:    { lat: 25.3960, lng: 68.3578 },
  other_city:   { lat: 33.6844, lng: 73.0479 },
};
