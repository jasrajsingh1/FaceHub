var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET add idea page. */
router.get('/add-entry', function(req, res, next) {
    res.render('add-entry', { title: 'Submit a New Idea' });
});

/* POST add idea page. */
router.post('/add-entry', upload.single('pic'), function (req, res, next) {
    let image = req.file;
    let title = req.body.title;
    let description = req.body.description;
    let tags = req.body.tags;

    //TODO Add to DB here

    res.render('add-entry-success', { title: 'Submission Success' });
});

module.exports = router;
