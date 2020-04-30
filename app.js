const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

const cityRouter = require('./routes/city');
const forecastRouter = require('./routes/forecast');

const PORT = process.env.PORT || 3000;

app.engine(
    'hbs',
    expressHbs({
        layoutsDir: __dirname + '/views/layouts',
        defaultLayout: 'index',
        extname: 'hbs',
    })
);

app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use(cityRouter);
app.use(forecastRouter);

app.get('/', (req, res) => {
    fs.readFile('cities.json', (err, data) => {
        if (err) throw err;

        res.render('dashboard', {
            data: JSON.parse(data),
            dashboardVisible: true,
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`);
});
