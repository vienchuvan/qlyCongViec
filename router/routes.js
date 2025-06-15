// routes.js
const quanTri = require('../controller/quanTriBaiViet');
const auth = require('../controller/auth');


module.exports = (app) => {
    app.use('/api/quantri', quanTri);
    app.use('/api/auth', auth);
};