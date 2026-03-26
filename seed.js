require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');

const services = [
    {
        name: 'Full Home Deep Cleaning',
        category: 'cleaning',
        price: 3499,
        description: 'Comprehensive cleaning for all rooms, bathrooms, and kitchen including deep sanitization and dusting.'
    },
    {
        name: 'Electrical Repairs & Installation',
        category: 'electrician',
        price: 499,
        description: 'Standard electrical troubleshooting, wiring fix, and socket installations by certified experts.'
    },
    {
        name: 'Carpenter: Furniture Repair',
        category: 'carpenter',
        price: 899,
        description: 'Fixing door hinges, broken handles, drawer sliders, and minor furniture alignments.'
    },
    {
        name: 'Emergency Plumbing Repair',
        category: 'plumber',
        price: 599,
        description: 'Fixing leakages, tap replacements, and blockages by an expert plumber.'
    },
    {
        name: 'AC Maintenance & Servicing',
        category: 'appliance repair',
        price: 1499,
        description: 'Full AC servicing and common part cleaning/repair including gas check.'
    },
    {
        name: 'Kitchen Deep Cleaning',
        category: 'cleaning',
        price: 1299,
        description: 'Complete degreasing and sanitization of your kitchen countertops, tiles, and cabinets.'
    },
    {
        name: 'Carpenter: New Work / Assembly',
        category: 'carpenter',
        price: 1999,
        description: 'High-quality new furniture assembly, customized racks, or wardrobe repairs.'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Seed: Connected to DB.');
        
        await Service.deleteMany();
        console.log('Seed: Cleared old services.');
        
        await Service.insertMany(services);
        console.log('Seed: Success! Added Indian services with INR pricing.');
        
        process.exit();
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seedDB();
