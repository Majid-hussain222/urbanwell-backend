// ============================================================
// seed-dietitians.js  — Run once to populate dietitians DB
// Place in: Spicers-backend/seed-dietitians.js
// Run: node seed-dietitians.js
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');

// ── Connect ──────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => { console.error('❌ Connection failed:', err.message); process.exit(1); });

// ── Use your existing Dietitian model ────────────────────
let Dietitian;
try {
  Dietitian = require('./models/Dietitian');
} catch {
  // If model doesn't exist yet, create a minimal one inline
  const schema = new mongoose.Schema({
    name:        { type: String, required: true },
    specialty:   { type: String },
    expertise:   { type: String },
    bio:         { type: String },
    experience:  { type: Number },
    sessionFee:  { type: Number },
    rating:      { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    available:   { type: Boolean, default: true },
    isRegistered:{ type: Boolean, default: true },
    credential:  { type: String },
    location:    { city: String, country: String },
    tags:        [String],
    conditions:  [String],
    conditionsTreated: [String],
    languages:   [String],
    certifications: [{ name: String, year: String }],
    clientCount: { type: Number, default: 0 },
    gender:      { type: String, enum: ['male','female'] },
  }, { timestamps: true });
  Dietitian = mongoose.model('Dietitian', schema);
}

const DIETITIANS = [
  {
    name:        'Dr. Tahira Naqvi',
    specialty:   'Clinical Nutrition & Diabetes',
    expertise:   'Diabetes · Endocrinology · Metabolic Syndrome',
    bio:         'MD and Registered Dietitian with 14 years specializing in reversing Type 2 diabetes through medical nutrition therapy. Published researcher with 8 peer-reviewed papers on dietary management of insulin resistance. Uses a low-glycemic, evidence-based approach combining food science with behavioral change techniques.',
    experience:  14,
    sessionFee:  60,
    rating:      4.9,
    reviewCount: 108,
    credential:  'MD, RD',
    isRegistered: true,
    available:   true,
    gender:      'female',
    location:    { city: 'Lahore', country: 'Pakistan' },
    tags:        ['Diabetes', 'Endocrinology', 'Low GI Diet', 'Insulin Resistance'],
    conditions:  ['Type 1 Diabetes', 'Type 2 Diabetes', 'Pre-Diabetes', 'PCOS', 'Metabolic Syndrome'],
    conditionsTreated: ['Type 2 Diabetes', 'Pre-Diabetes', 'Gestational Diabetes', 'Metabolic Syndrome', 'Insulin Resistance', 'PCOS', 'Thyroid Disorders', 'Obesity'],
    certifications: [
      { name: 'Registered Dietitian (RD)', year: '2015' },
      { name: 'Certified Diabetes Educator (CDE)', year: '2016' },
      { name: 'Board Certified in Advanced Diabetes Management', year: '2019' },
    ],
    languages: ['English', 'Urdu', 'Punjabi'],
    clientCount: 420,
  },
  {
    name:        'Dr. Kamran Saleem',
    specialty:   'Renal & Cardiac Nutrition',
    expertise:   'Kidney Disease · Heart Health · Clinical Dietetics',
    bio:         'Registered Dietitian Nutritionist (RDN) with 11 years in hospital-based clinical nutrition. Specializes in renal diet therapy for CKD and dialysis patients, and cardiac nutrition for heart disease prevention. Developed the dietary protocol used in 3 major hospitals in Karachi.',
    experience:  11,
    sessionFee:  55,
    rating:      4.8,
    reviewCount: 87,
    credential:  'RDN',
    isRegistered: true,
    available:   true,
    gender:      'male',
    location:    { city: 'Karachi', country: 'Pakistan' },
    tags:        ['Kidney Disease', 'Heart Health', 'Low Sodium', 'Dialysis'],
    conditions:  ['CKD', 'Dialysis', 'Heart Disease', 'Hypertension'],
    conditionsTreated: ['Chronic Kidney Disease (CKD)', 'Dialysis Nutrition', 'Heart Failure', 'Coronary Artery Disease', 'Hypertension', 'High Cholesterol', 'Post-Transplant Nutrition'],
    certifications: [
      { name: 'Registered Dietitian Nutritionist (RDN)', year: '2014' },
      { name: 'Certified Nutrition Support Clinician (CNSC)', year: '2016' },
      { name: 'Renal Dietitian Certification', year: '2018' },
    ],
    languages: ['English', 'Urdu', 'Sindhi'],
    clientCount: 280,
  },
  {
    name:        'Sara Bilal',
    specialty:   'Oncology & Cancer Nutrition',
    expertise:   'Cancer Care · Chemotherapy Support · Immune Nutrition',
    bio:         'Registered Dietitian specializing in oncology nutrition — helping cancer patients maintain strength, manage treatment side effects, and rebuild after chemotherapy. Works closely with oncologists at Shaukat Khanum Memorial Cancer Hospital. Trained in enteral and parenteral nutrition.',
    experience:  9,
    sessionFee:  65,
    rating:      4.9,
    reviewCount: 64,
    credential:  'RD, CNSC',
    isRegistered: true,
    available:   true,
    gender:      'female',
    location:    { city: 'Lahore', country: 'Pakistan' },
    tags:        ['Cancer Nutrition', 'Oncology', 'Immune Support', 'Chemo Side Effects'],
    conditions:  ['Cancer', 'Chemotherapy', 'Radiation', 'Post-Surgery'],
    conditionsTreated: ['Breast Cancer', 'Colorectal Cancer', 'Prostate Cancer', 'Leukemia', 'Lymphoma', 'Cancer Prevention', 'Post-Chemotherapy Recovery', 'Tube Feeding', 'Cachexia'],
    certifications: [
      { name: 'Registered Dietitian (RD)', year: '2016' },
      { name: 'Certified Nutrition Support Clinician (CNSC)', year: '2018' },
      { name: 'Oncology Nutrition Certificate (ONC)', year: '2020' },
    ],
    languages: ['English', 'Urdu'],
    clientCount: 190,
  },
  {
    name:        'Dr. Amna Sheikh',
    specialty:   'Eating Disorders & Mental Health Nutrition',
    expertise:   'Anorexia · Bulimia · ARFID · Intuitive Eating',
    bio:         'Registered Dietitian and Certified Eating Disorders Specialist (CEDS) working at the intersection of mental health and nutrition. Provides compassionate, non-diet, weight-inclusive care for anorexia, bulimia, binge eating, and ARFID. Works as part of a multidisciplinary team with therapists and psychiatrists.',
    experience:  8,
    sessionFee:  70,
    rating:      5.0,
    reviewCount: 42,
    credential:  'RD, CEDS',
    isRegistered: true,
    available:   true,
    gender:      'female',
    location:    { city: 'Islamabad', country: 'Pakistan' },
    tags:        ['Eating Disorders', 'Non-Diet Approach', 'Intuitive Eating', 'Body Image'],
    conditions:  ['Anorexia', 'Bulimia', 'Binge Eating', 'ARFID', 'Orthorexia'],
    conditionsTreated: ['Anorexia Nervosa', 'Bulimia Nervosa', 'Binge Eating Disorder', 'ARFID', 'Orthorexia', 'Night Eating Syndrome', 'Body Dysmorphia Related Eating', 'Disordered Eating Patterns'],
    certifications: [
      { name: 'Registered Dietitian (RD)', year: '2017' },
      { name: 'Certified Eating Disorders Specialist (CEDS)', year: '2019' },
      { name: 'Intuitive Eating Counselor Certification', year: '2021' },
    ],
    languages: ['English', 'Urdu'],
    clientCount: 155,
  },
  {
    name:        'Dr. Farhan Qureshi',
    specialty:   'Pediatric & Child Nutrition',
    expertise:   'Child Development · Allergies · Growth Disorders',
    bio:         'Pediatric Registered Dietitian with 12 years helping children from infancy through adolescence. Specializes in pediatric food allergies, failure to thrive, tube feeding, and childhood obesity. Works with children with autism, ADHD, and other neurodevelopmental conditions on therapeutic feeding approaches.',
    experience:  12,
    sessionFee:  50,
    rating:      4.9,
    reviewCount: 93,
    credential:  'RD, IBCLC',
    isRegistered: true,
    available:   true,
    gender:      'male',
    location:    { city: 'Karachi', country: 'Pakistan' },
    tags:        ['Pediatrics', 'Child Nutrition', 'Allergies', 'Growth Disorders'],
    conditions:  ['Pediatric Allergies', 'Childhood Obesity', 'Failure to Thrive', 'Autism Nutrition'],
    conditionsTreated: ['Food Allergies in Children', 'Pediatric Obesity', 'Failure to Thrive', 'Autism Spectrum Disorder Nutrition', 'ADHD and Diet', 'Infant Feeding', 'Tube Feeding', 'Celiac in Children', 'Cow Milk Protein Allergy'],
    certifications: [
      { name: 'Registered Dietitian (RD)', year: '2013' },
      { name: 'Pediatric Nutrition Practice Group Certificate', year: '2015' },
      { name: 'International Board Certified Lactation Consultant (IBCLC)', year: '2017' },
    ],
    languages: ['English', 'Urdu', 'Punjabi'],
    clientCount: 340,
  },
  {
    name:        'Nadia Hussain',
    specialty:   'Gastroenterology & Gut Health',
    expertise:   'IBS · IBD · GERD · Gut Microbiome · FODMAPs',
    bio:         'Registered Dietitian specializing in digestive health with deep expertise in IBS, IBD (Crohn\'s disease and ulcerative colitis), celiac disease, and gut microbiome optimization. Certified in the Low-FODMAP diet and trained in the Rome IV diagnostic criteria for functional GI disorders.',
    experience:  10,
    sessionFee:  55,
    rating:      4.8,
    reviewCount: 76,
    credential:  'RD, FODMAP Cert.',
    isRegistered: true,
    available:   false,
    gender:      'female',
    location:    { city: 'Lahore', country: 'Pakistan' },
    tags:        ['Gut Health', 'IBS', 'IBD', 'Low FODMAP', 'Celiac'],
    conditions:  ['IBS', 'Crohn\'s Disease', 'Ulcerative Colitis', 'Celiac', 'GERD'],
    conditionsTreated: ['Irritable Bowel Syndrome (IBS)', 'Crohn\'s Disease', 'Ulcerative Colitis', 'GERD/Acid Reflux', 'Celiac Disease', 'Small Intestinal Bacterial Overgrowth (SIBO)', 'Leaky Gut', 'Food Intolerances', 'Gastroparesis'],
    certifications: [
      { name: 'Registered Dietitian (RD)', year: '2015' },
      { name: 'Monash University Low FODMAP Dietitian Certification', year: '2017' },
      { name: 'Gut Microbiome Practitioner Certificate', year: '2021' },
    ],
    languages: ['English', 'Urdu'],
    clientCount: 240,
  },
  {
    name:        'Dr. Rabia Tariq',
    specialty:   'Sports & Performance Dietitian',
    expertise:   'Athletic Performance · Body Composition · Recovery Nutrition',
    bio:         'Registered Sports Dietitian (RSD) working with elite athletes, national teams, and serious recreational athletes. Specializes in periodized nutrition, body composition optimization, hydration strategies, and supplement evidence review. Consulted for the Pakistan Cricket Board youth nutrition program.',
    experience:  7,
    sessionFee:  60,
    rating:      4.9,
    reviewCount: 58,
    credential:  'RD, CSSD',
    isRegistered: true,
    available:   true,
    gender:      'female',
    location:    { city: 'Lahore', country: 'Pakistan' },
    tags:        ['Sports Nutrition', 'Athletic Performance', 'Body Composition', 'Recovery'],
    conditions:  ['Athletic Performance', 'Body Composition', 'Sports Injury Recovery'],
    conditionsTreated: ['Performance Optimization', 'Body Composition Goals', 'Sports Injury Recovery', 'RED-S (Relative Energy Deficiency)', 'Athlete Gut Issues', 'Pre/Post Competition Nutrition', 'Hydration Strategies', 'Supplement Assessment'],
    certifications: [
      { name: 'Registered Dietitian (RD)', year: '2018' },
      { name: 'Certified Specialist in Sports Dietetics (CSSD)', year: '2020' },
      { name: 'ISSN Certified Sports Nutritionist', year: '2021' },
    ],
    languages: ['English', 'Urdu', 'Punjabi'],
    clientCount: 180,
  },
  {
    name:        'Dr. Zafar Iqbal',
    specialty:   'Critical Care & Hospital Nutrition',
    expertise:   'ICU Nutrition · Enteral/Parenteral · Post-Surgery',
    bio:         'Senior Clinical Dietitian with 16 years in intensive care and hospital nutrition support. Expert in enteral (tube feeding) and parenteral (IV nutrition) therapy. Manages nutrition for critically ill patients, post-surgical recovery, and complex multi-morbidity cases. Teaches clinical nutrition at CPSP.',
    experience:  16,
    sessionFee:  75,
    rating:      4.9,
    reviewCount: 39,
    credential:  'RD, CNSC, CPEN',
    isRegistered: true,
    available:   true,
    gender:      'male',
    location:    { city: 'Islamabad', country: 'Pakistan' },
    tags:        ['ICU Nutrition', 'Post-Surgery', 'Tube Feeding', 'Critical Care'],
    conditions:  ['Critical Illness', 'Post-Surgery', 'Cancer', 'Malnutrition'],
    conditionsTreated: ['Critical Illness Nutrition', 'Post-Operative Recovery', 'Severe Malnutrition', 'Liver Failure', 'Pancreatitis', 'Burns Nutrition', 'Neurological Injury', 'Enteral Feeding Intolerance', 'Parenteral Nutrition'],
    certifications: [
      { name: 'Registered Dietitian (RD)', year: '2009' },
      { name: 'Certified Nutrition Support Clinician (CNSC)', year: '2011' },
      { name: 'Certified Pediatric and Neonatal Nutrition (CPEN)', year: '2015' },
      { name: 'ASPEN Nutrition Support Practitioner', year: '2013' },
    ],
    languages: ['English', 'Urdu', 'Punjabi'],
    clientCount: 95,
  },
];

async function seed() {
  try {
    const existing = await Dietitian.countDocuments();
    if (existing > 0) {
      console.log(`ℹ️  Already have ${existing} dietitians. Clearing and re-seeding...`);
      await Dietitian.deleteMany({});
    }

    const result = await Dietitian.insertMany(DIETITIANS);
    console.log(`✅ Successfully seeded ${result.length} dietitians!`);
    result.forEach(d => console.log(`  → ${d.name} (${d.specialty})`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

seed();