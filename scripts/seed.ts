import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local or .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0) {
      process.env[key.trim()] = val.join('=').trim();
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ganesh_puja_db';

// Import Models
import User from '../src/models/User';
import Contribution from '../src/models/Contribution';
import Expense from '../src/models/Expense';
import ExpenseCategory from '../src/models/ExpenseCategory';
import Banner from '../src/models/Banner';
import Gallery from '../src/models/Gallery';
import Announcement from '../src/models/Announcement';
import Task from '../src/models/Task';
import Message from '../src/models/Message';
import Activity from '../src/models/Activity';
import Settings from '../src/models/Settings';

async function seed() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected to MongoDB.');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Contribution.deleteMany({}),
    Expense.deleteMany({}),
    ExpenseCategory.deleteMany({}),
    Banner.deleteMany({}),
    Gallery.deleteMany({}),
    Announcement.deleteMany({}),
    Task.deleteMany({}),
    Message.deleteMany({}),
    Activity.deleteMany({}),
    Settings.deleteMany({}),
  ]);
  console.log('Cleared existing database data.');

  // 1. Hash default password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Create Exactly 13 Committee Members
  const memberListData = [
    { name: 'Debasish Ghosh', email: 'admin@ganeshpuja.org', mobile: '9876543210', role: 'admin', profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' },
    { name: 'Rahul Das', email: 'rahul.das@ganeshpuja.org', mobile: '9876543211', role: 'member', profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400' },
    { name: 'Amit Kumar Roy', email: 'amit.roy@ganeshpuja.org', mobile: '9876543212', role: 'member', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    { name: 'Sanjay Mukherjee', email: 'sanjay.m@ganeshpuja.org', mobile: '9876543213', role: 'member', profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
    { name: 'Subhash Sen', email: 'subhash.sen@ganeshpuja.org', mobile: '9876543214', role: 'member', profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' },
    { name: 'Pritam Chakraborty', email: 'pritam.c@ganeshpuja.org', mobile: '9876543215', role: 'member', profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400' },
    { name: 'Bikash Banerjee', email: 'bikash.b@ganeshpuja.org', mobile: '9876543216', role: 'member', profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400' },
    { name: 'Sourav Ganguly', email: 'sourav.g@ganeshpuja.org', mobile: '9876543217', role: 'member', profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400' },
    { name: 'Prosenjit Chatterjee', email: 'prosenjit.c@ganeshpuja.org', mobile: '9876543218', role: 'member', profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' },
    { name: 'Rajesh Sharma', email: 'rajesh.s@ganeshpuja.org', mobile: '9876543219', role: 'member', profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400' },
    { name: 'Deepak Dey', email: 'deepak.dey@ganeshpuja.org', mobile: '9876543220', role: 'member', profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400' },
    { name: 'Anirban Mitra', email: 'anirban.m@ganeshpuja.org', mobile: '9876543221', role: 'member', profileImage: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400' },
    { name: 'Tapan Bhowmick', email: 'tapan.b@ganeshpuja.org', mobile: '9876543222', role: 'member', profileImage: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400' },
  ];

  const createdUsers = [];
  for (const m of memberListData) {
    const user = await User.create({
      name: m.name,
      email: m.email,
      mobile: m.mobile,
      password: hashedPassword,
      role: m.role,
      status: 'active',
      profileImage: m.profileImage,
      totalChanda: 0,
      totalExpense: 0,
    });
    createdUsers.push(user);
  }
  console.log(`Created ${createdUsers.length} Committee Users.`);

  const adminUser = createdUsers[0];
  const memberUser1 = createdUsers[1];
  const memberUser2 = createdUsers[2];
  const memberUser3 = createdUsers[3];
  const memberUser4 = createdUsers[4];

  // 3. Create Expense Categories
  const categoriesList = [
    'Decoration',
    'Lighting',
    'Idol',
    'Pandal',
    'Prasad',
    'Flowers',
    'Sound',
    'Transport',
    'Advertisement',
    'Cultural Program',
    'Miscellaneous',
  ];
  for (const catName of categoriesList) {
    await ExpenseCategory.create({ name: catName, isSystem: true });
  }
  console.log(`Created ${categoriesList.length} Expense Categories.`);

  // 4. Create Initial Contributions (Chanda)
  const sampleContributions = [
    { member: adminUser._id, amount: 10000, paymentMethod: 'UPI', note: 'Full annual chanda 2026', addedBy: adminUser._id, date: new Date('2026-08-01') },
    { member: memberUser1._id, amount: 10000, paymentMethod: 'Cash', note: 'Paid to Debasish', addedBy: adminUser._id, date: new Date('2026-08-02') },
    { member: memberUser2._id, amount: 10000, paymentMethod: 'UPI', note: 'Direct bank transfer', addedBy: adminUser._id, date: new Date('2026-08-03') },
    { member: memberUser3._id, amount: 5000, paymentMethod: 'Cash', note: '1st installment', addedBy: adminUser._id, date: new Date('2026-08-05') },
    { member: memberUser4._id, amount: 10000, paymentMethod: 'Bank Transfer', note: 'IMPS Ref #992834', addedBy: adminUser._id, date: new Date('2026-08-07') },
    { member: createdUsers[5]._id, amount: 10000, paymentMethod: 'UPI', note: 'GPay payment', addedBy: adminUser._id, date: new Date('2026-08-08') },
    { member: createdUsers[6]._id, amount: 10000, paymentMethod: 'Cash', note: 'Advance chanda', addedBy: adminUser._id, date: new Date('2026-08-10') },
  ];

  let totalChandaCalculated = 0;
  for (const c of sampleContributions) {
    await Contribution.create(c);
    totalChandaCalculated += c.amount;
    await User.findByIdAndUpdate(c.member, { $inc: { totalChanda: c.amount } });
  }
  console.log(`Created ${sampleContributions.length} Contributions. Total Chanda: ₹${totalChandaCalculated}`);

  // 5. Create Initial Expenses
  const sampleExpenses = [
    {
      title: 'Ganesh Idol Advance Booking',
      amount: 15000,
      category: 'Idol',
      paidBy: adminUser._id,
      paymentMethod: 'UPI',
      description: 'Advance payment to Kumartuli artisan for 8ft Idol',
      date: new Date('2026-08-02'),
      receiptUrl: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800',
      createdBy: adminUser._id,
    },
    {
      title: 'Pandal Bamboo & Cloth Advance',
      amount: 25000,
      category: 'Pandal',
      paidBy: memberUser1._id,
      paymentMethod: 'Cash',
      description: 'Advance given to Pandal decorator Rahul Tent House',
      date: new Date('2026-08-04'),
      receiptUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      createdBy: adminUser._id,
    },
    {
      title: 'Sound System Booking',
      amount: 8000,
      category: 'Sound',
      paidBy: memberUser2._id,
      paymentMethod: 'UPI',
      description: '3 Days Sound system & DJ arrangement',
      date: new Date('2026-08-06'),
      receiptUrl: '',
      createdBy: adminUser._id,
    },
    {
      title: 'Lighting & Gate Decoration Advance',
      amount: 12000,
      category: 'Lighting',
      paidBy: memberUser3._id,
      paymentMethod: 'Cash',
      description: 'LED lights & welcome arch setup',
      date: new Date('2026-08-09'),
      receiptUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      createdBy: adminUser._id,
    },
  ];

  let totalExpenseCalculated = 0;
  for (const e of sampleExpenses) {
    await Expense.create(e);
    totalExpenseCalculated += e.amount;
    await User.findByIdAndUpdate(e.paidBy, { $inc: { totalExpense: e.amount } });
  }
  console.log(`Created ${sampleExpenses.length} Expenses. Total Expenses: ₹${totalExpenseCalculated}`);

  // 6. Banners
  await Banner.create([
    {
      title: 'Shree Ganesh Puja 2026',
      subtitle: 'Jai Shree Ganesh - Annual Grand Celebration',
      buttonText: 'View Schedule',
      buttonAction: '/announcements',
      imageUrl: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=1200&auto=format&fit=crop',
      displayOrder: 1,
      status: 'active',
    },
    {
      title: 'Mahaprasad Distribution',
      subtitle: '26th August 2026 at Central Pandal Grounds',
      buttonText: 'Details',
      buttonAction: '/announcements',
      imageUrl: 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=1200&auto=format&fit=crop',
      displayOrder: 2,
      status: 'active',
    },
  ]);

  // 7. Gallery
  await Gallery.create([
    {
      title: 'Pratima Preparation 2026',
      description: 'Artisan hand-crafting the Eco-Friendly Clay Ganesha Idol',
      category: 'Ganesh Idol',
      imageUrl: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800',
      uploadedBy: adminUser._id,
    },
    {
      title: 'Pandal Lighting Arch',
      description: 'Festive illuminated entrance arch mock setup',
      category: 'Decoration',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      uploadedBy: memberUser1._id,
    },
    {
      title: 'Committee Meeting 2026',
      description: 'First annual planning meeting with all 13 members',
      category: 'Committee',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      uploadedBy: adminUser._id,
    },
  ]);

  // 8. Announcements
  await Announcement.create([
    {
      title: 'Idol Bringing & Shobhajatra Timing',
      message: 'All 13 committee members are requested to gather at Kumartuli on 24th Aug at 4:00 PM for bringing the Idol.',
      priority: 'Urgent',
      publishDate: new Date('2026-08-10'),
      status: 'Published',
      createdBy: adminUser._id,
    },
    {
      title: 'Chanda Collection Completion Deadline',
      message: 'Please ensure all remaining pending contributions are deposited by 20th August.',
      priority: 'Important',
      publishDate: new Date('2026-08-11'),
      status: 'Published',
      createdBy: adminUser._id,
    },
  ]);

  // 9. Tasks
  await Task.create([
    {
      title: 'Finalize Lighting Contractor',
      description: 'Negotiate final rate for gate & pandal LED setup',
      assignedTo: memberUser1._id,
      deadline: new Date('2026-08-18'),
      priority: 'High',
      status: 'In Progress',
      createdBy: adminUser._id,
    },
    {
      title: 'Prasad & Bhog Vendor Order',
      description: 'Order 500 boxes of Laddu and Khichudi Bhog materials',
      assignedTo: memberUser2._id,
      deadline: new Date('2026-08-20'),
      priority: 'Medium',
      status: 'Pending',
      createdBy: adminUser._id,
    },
    {
      title: 'Sound & Police Permission NOC',
      description: 'Submit NOC application to local police station',
      assignedTo: memberUser3._id,
      deadline: new Date('2026-08-15'),
      priority: 'High',
      status: 'Completed',
      createdBy: adminUser._id,
    },
  ]);

  // 10. Private Group Chat Initial Messages
  await Message.create([
    {
      sender: adminUser._id,
      content: 'Welcome everyone to the private 2026 Ganesh Puja Committee portal!',
      isPinned: true,
    },
    {
      sender: memberUser1._id,
      content: 'Namaskar! Pandal work started today morning. Bamboos have arrived.',
    },
    {
      sender: memberUser2._id,
      content: 'Great update Rahul! Sound system booking is confirmed for 3 days.',
    },
  ]);

  // 11. Activity Log
  await Activity.create([
    { user: adminUser._id, action: 'User Added', entityType: 'User', description: 'Initialized 13 committee members' },
    { user: adminUser._id, action: 'Contribution Added', entityType: 'Contribution', description: 'Debasish Ghosh added ₹10,000 contribution' },
    { user: memberUser1._id, action: 'Expense Added', entityType: 'Expense', description: 'Rahul Das added ₹25,000 expense for Pandal' },
    { user: adminUser._id, action: 'Announcement Created', entityType: 'Announcement', description: 'Published Idol Bringing Shobhajatra notice' },
  ]);

  // 12. System Settings
  await Settings.create({
    committeeName: 'Shree Ganesh Puja Committee 2026',
    pujaYear: '2026',
    pujaDate: '2026-08-25',
    location: 'Central Pandal Ground',
    description: 'Private Committee Management Portal',
    expectedChandaTotal: 130000,
    expectedChandaPerMember: 10000,
  });

  console.log('Seed completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
