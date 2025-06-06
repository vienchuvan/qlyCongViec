// routes.js
const quanTri = require('../controller/quanTriBaiViet');


module.exports = (app) => {
    app.use('/api/quantri', quanTri);
    
};