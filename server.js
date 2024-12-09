import express from 'express';
import router from './routes/index';

const app = express();

app.use(express.json());

app.get('/status', router);
app.get('/stats', router);
app.post('/users', router);
app.listen(process.env.PORT || 5000);
