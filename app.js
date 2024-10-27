const express = require('express');
const app = express ();
app.use(express.json());
// const session = require('express-session');
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3000;


// const productRouter = require("./routes/product-router")
const productRouter = require("./routes/product-router-db");
const salesRouter = require("./routes/sales-router-db");
app.use('/products', productRouter);
app.use('/sales', salesRouter);

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});

app.get('/status', (request, response) => {
    const status = {
        "Status": "Running"
    }
    response.send(status);
});
