import express from 'express';
import { createClient } from 'redis';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());

const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
await client.connect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'frontend')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.post("/", async (req, res) => {
    const location = req.body.city;
    const redisData = await client.get(location);
    const weatherData = JSON.parse(redisData);

    if(weatherData == null) {
        const apiReq = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${process.env.API_KEY}`);
        const apiResult = await apiReq.json();

        if(apiResult) {
            const newData = {address: apiResult.address, description: apiResult.description, temp: apiResult.currentConditions.temp};
            res.json({success: true, source: "API", data: newData});
            await client.set(location, JSON.stringify(newData), { EX: 3600 });
        }
        else {
            res.json({success: false, message: "Error! Please enter a valid address"});
        }
    }
    else {
        res.json({success: true, source: "Redis", data: weatherData});
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});