import express from 'express';
import router from './routes/index';

const app = express();

app.get('/status', router);
app.get('/stats', router);
app.listen(process.env.PORT || 5000);
