const functions = require('firebase-functions');
const fetch = require('node-fetch');

exports.mapsProxy = functions
  .region('europe-west3')
  .runWith({ maxInstances: 1 })
  .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const params = new URLSearchParams(req.query);
    const url = `https://maps.googleapis.com/maps/api/directions/json?${params}`;

    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  });
