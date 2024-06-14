require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

// Define a Mongoose schema and model
const productSchema = new mongoose.Schema({
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: String
});

const Product = mongoose.model('Product', productSchema);

// Initialize the database
app.get('/initialize-db', async (req, res) => {
    try {
        // Fetch data from the third-party API
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;

        // Clear existing data
        await Product.deleteMany({});

        // Insert new data
        await Product.insertMany(products);

        res.send('Database initialized with seed data');
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).send('Error initializing database');
    }
});
app.get('/allproducts',async (req,res)=>{

    let products = await Product.find({});

    // console.log("all products fetched");

    res.json(products);
})
// API to list all transactions with search and pagination

app.get('/transactions', async (req, res) => {
    try {
        const { month, search, page = 1, perPage = 10 } = req.query;

        // Validate and parse month input
        const monthIndex = parseMonthInput(month);
        if (monthIndex === -1) {
            return res.status(400).json({ error: 'Invalid month input. Please provide a valid month between January to December.' });
        }

        // Construct regex to match the month in dateOfSale field
        const monthRegex = `-${padTwoDigits(monthIndex + 1)}-`;

        // Construct search query
        const searchQuery = search ? {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { price: { $regex: search, $options: 'i' } }
            ]
        } : {};

        // Pagination settings
        const skip = (page - 1) * perPage;
        const limit = parseInt(perPage);

        // Fetch transactions
        const transactions = await Product.find({
            dateOfSale: { $regex: monthRegex },
            ...searchQuery
        })
        .skip(skip)
        .limit(limit);

        const totalCount = await Product.countDocuments({
            dateOfSale: { $regex: monthRegex },
            ...searchQuery
        });

        res.json({
            totalCount,
            transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Error fetching transactions');
    }
});

// Utility function to parse month input
function parseMonthInput(month) {
    if (!month || typeof month !== 'string') {
        return -1; // Invalid input
    }

    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIndex = months.findIndex(m => m.toLowerCase() === month.toLowerCase());
    return monthIndex;
}

// Utility function to pad single digit month number with zero
function padTwoDigits(number) {
    return number.toString().padStart(2, '0');
}
app.get('/statistics', async (req, res) => {
    try {
        const { month } = req.query;

        
        const monthIndex = parseMonthInput(month);
        if (monthIndex === -1) {
            return res.status(400).json({ error: 'Invalid month input. Please provide a valid month between January to December.' });
        }

        
        const monthPattern = `-${padTwoDigits(monthIndex + 1)}-`;

        
        const [
            totalSaleAmountResult,
            totalSoldItemsResult,
            totalNotSoldItemsResult
        ] = await Promise.all([
            Product.aggregate([
                {
                    $match: {
                        dateOfSale: { $regex: monthPattern }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSaleAmount: { $sum: "$price" }
                    }
                }
            ]),
            Product.aggregate([
                {
                    $match: {
                        dateOfSale: { $regex: monthPattern },
                        sold: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSoldItems: { $sum: 1 }
                    }
                }
            ]),
            Product.aggregate([
                {
                    $match: {
                        dateOfSale: { $regex: monthPattern },
                        sold: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalNotSoldItems: { $sum: 1 }
                    }
                }
            ])
        ]);

        
        const totalSaleAmount = totalSaleAmountResult.length > 0 ? totalSaleAmountResult[0].totalSaleAmount : 0;
        const totalSoldItems = totalSoldItemsResult.length > 0 ? totalSoldItemsResult[0].totalSoldItems : 0;
        const totalNotSoldItems = totalNotSoldItemsResult.length > 0 ? totalNotSoldItemsResult[0].totalNotSoldItems : 0;

        // Return combined statistics
        res.json({
            totalSaleAmount,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).send('Error fetching statistics');
    }
});


function parseMonthInput(month) {
    if (!month || typeof month !== 'string') {
        return -1; // Invalid input
    }

    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIndex = months.findIndex(m => m.toLowerCase() === month.toLowerCase());
    return monthIndex;
}

function padTwoDigits(number) {
    return number.toString().padStart(2, '0');
}

//bar chart

app.get('/bar-chart', async (req, res) => {
    try {
        const { month } = req.query;

        
        const monthIndex = parseMonthInput(month);
        if (monthIndex === -1) {
            return res.status(400).json({ error: 'Invalid month input. Please provide a valid month between January to December.' });
        }

        
        const monthRegex = `-${padTwoDigits(monthIndex + 1)}-`;

        
        const result = await Product.aggregate([
            {
                $match: {
                    dateOfSale: { $regex: monthRegex }
                }
            },
            {
                $group: {
                    _id: null,
                    range0_100: { $sum: { $cond: [{ $lte: ["$price", 100] }, 1, 0] } },
                    range101_200: { $sum: { $cond: [{ $and: [{ $gt: ["$price", 100] }, { $lte: ["$price", 200] }] }, 1, 0] } },
                    range201_300: { $sum: { $cond: [{ $and: [{ $gt: ["$price", 200] }, { $lte: ["$price", 300] }] }, 1, 0] } },
                    range301_400: { $sum: { $cond: [{ $and: [{ $gt: ["$price", 300] }, { $lte: ["$price", 400] }] }, 1, 0] } },
                    range401_500: { $sum: { $cond: [{ $and: [{ $gt: ["$price", 400] }, { $lte: ["$price", 500] }] }, 1, 0] } },
                    range501_600: { $sum: { $cond: [{ $and: [{ $gt: ["$price", 500] }, { $lte: ["$price", 600] }] }, 1, 0] } },
                    range601_700: { $sum: { $cond: [{ $and: [{ $gt: ["$price", 600] }, { $lte: ["$price", 700] }] }, 1, 0] } },
                    range701_800: { $sum: { $cond: [{ $and: [{ $gt: ["$price", 700] }, { $lte: ["$price", 800] }] }, 1, 0] } },
                    range801_900: { $sum: { $cond: [{ $and: [{ $gt: ["$price", 800] }, { $lte: ["$price", 900] }] }, 1, 0] } },
                    range901_above: { $sum: { $cond: [{ $gt: ["$price", 900] }, 1, 0] } }
                }
            }
        ]);

        
        if (!result || result.length === 0) {
            return res.json({
                "0-100": 0,
                "101-200": 0,
                "201-300": 0,
                "301-400": 0,
                "401-500": 0,
                "501-600": 0,
                "601-700": 0,
                "701-800": 0,
                "801-900": 0,
                "901-above": 0
            });
        }

        
        const barChartData = {
            "0-100": result[0].range0_100 || 0,
            "101-200": result[0].range101_200 || 0,
            "201-300": result[0].range201_300 || 0,
            "301-400": result[0].range301_400 || 0,
            "401-500": result[0].range401_500 || 0,
            "501-600": result[0].range501_600 || 0,
            "601-700": result[0].range601_700 || 0,
            "701-800": result[0].range701_800 || 0,
            "801-900": result[0].range801_900 || 0,
            "901-above": result[0].range901_above || 0
        };

        // Return the bar chart data
        res.json(barChartData);
    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        res.status(500).send('Error fetching bar chart data');
    }
});

//pie
app.get('/pie-chart', async (req, res) => {
    try {
        const { month } = req.query;

        
        const monthIndex = parseMonthInput(month);
        if (monthIndex === -1) {
            return res.status(400).json({ error: 'Invalid month input. Please provide a valid month between January to December.' });
        }

        
        const monthRegex = `-${padTwoDigits(monthIndex + 1)}-`;

        
        const result = await Product.aggregate([
            {
                $match: {
                    dateOfSale: { $regex: monthRegex }
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        
        if (result.length === 0) {
            return res.json([]); // Return empty array if no data found
        }

        // Map result to desired format
        const pieChartData = result.map(item => ({
            category: item._id,
            count: item.count
        }));

        // Return the pie chart data
        res.json(pieChartData);
    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        res.status(500).send('Error fetching pie chart data');
    }
});


//combined
app.get('/combined-data', async (req, res) => {
    try {
        const { month } = req.query;

        
        const monthIndex = parseMonthInput(month);
        if (monthIndex === -1) {
            return res.status(400).json({ error: 'Invalid month input. Please provide a valid month between January to December.' });
        }

        
        const monthRegex = `-${padTwoDigits(monthIndex + 1)}-`;

        
        const [transactionsResponse, statisticsResponse, barChartDataResponse] = await Promise.all([
            axios.get(`http://localhost:7000/transactions?month=${month}`),
            axios.get(`http://localhost:7000/statistics?month=${month}`),
            axios.get(`http://localhost:7000/bar-chart?month=${month}`)
        ]);

        // Extract data from responses
        const transactions = transactionsResponse.data.transactions || [];
        const statistics = statisticsResponse.data || {};
        const barChartData = barChartDataResponse.data || {};

        
        const combinedData = {
            transactions,
            statistics,
            barChartData
        };

        // Send combined response
        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).send('Error fetching combined data');
    }
});

// Root route
app.get("/", (req, res) => {
    res.json({ message: "Express app is running" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
