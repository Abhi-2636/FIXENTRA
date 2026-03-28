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
    },
    {
        name: 'Inverter & UPS Repair',
        category: 'electrician',
        price: 699,
        description: 'Complete inverter checkup, battery water top-up, and UPS troubleshooting. Essential for Patna summers!'
    },
    {
        name: 'Full House Wall Painting',
        category: 'painter',
        price: 4999,
        description: 'Professional wall painting with Asian Paints/Berger options. Price per room, includes material.'
    },
    {
        name: 'Pest Control (Cockroach & Ant)',
        category: 'pest control',
        price: 1199,
        description: 'Gel-based pest treatment for cockroaches, ants, and silverfish. Safe for kids and pets.'
    },
    {
        name: 'Overhead Water Tank Cleaning',
        category: 'cleaning',
        price: 899,
        description: 'Complete tank draining, scrubbing, anti-bacterial wash, and UV treatment for clean water.'
    },
    {
        name: 'Chhath Puja Special: Deep Cleaning',
        category: 'cleaning',
        price: 3999,
        description: 'Complete rigorous purification and sanitization for Chhath Puja preparation. Unmatched purity for your home.'
    },
    {
        name: 'Diwali Pre-Festival Cleaning Bundle',
        category: 'cleaning',
        price: 4999,
        description: 'Deep house cleaning, cobweb removal, floor polishing, and sofa dry cleaning to get your home festival-ready.'
    },
    {
        name: 'Desert Cooler Repair & Servicing',
        category: 'appliance repair',
        price: 399,
        description: 'Cleaning of cooling pads, water pump check, and fan motor oiling for the perfect summer relief.'
    },
    {
        name: 'Water Purifier (RO) Repair & Filter Change',
        category: 'appliance repair',
        price: 599,
        description: 'Comprehensive checkup of RO/UV/UF filters. Price excludes spare parts and new filters.'
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
