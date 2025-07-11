import express from 'express';
import { createClient } from 'redis';
import 'dotenv/config'

const app = express();
const PORT = 3000;

app.use(express.json());

const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
await client.connect();

app.post("/", async (req, res) => {
    const location = req.body.city;
    const weatherData = await client.get(location);

    if(weatherData == null) {
        apiResult = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${process.env.API_KEY}`);

        if(apiResult) {
            const newData = {address: apiResult.address, description: apiResult.description, temp: apiResult.currentConditions.temp};
            res.json({success: true, data: newData});
            client.set(location, apiResult);
        }
        else {
            res.json({success: false, message: "Error! Please enter a valid address"});
        }
    }
    else {
        res.json({success: true, data: weatherData});
    }
})

app.listen(PORT, (req, res) => {
    console.log(`Listening on port: ${PORT}`);
});