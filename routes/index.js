//JASRAJ SINGH TODO ---> create login page + ensure eveything is added/okay in DB; insert photo in DB
//EVERYONE ELSE --> if u go to /test u have access to all the variables. if u need more info, messge me on messenger.



var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var userEmail = "";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'GitBook' });
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
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    let tagStr = "";

    for (let t of tags) {
        tagStr += t;
    }

    console.log("title is: "+title);

    //TODO Add to DB here
    let query = "INSERT INTO ResearchIdea (dateOfCreation, advisor_email, research_name, description, interests) VALUES ('" +
                            date + "', '" + userEmail + "', '" + title + "', '" + description + "', '" + tagStr + "')";

    db.query(query, (err, result) => {
        if (err) {
            console.log("Query is: "+query);
            console.log(err);
            //return res.status(500).send(err);
        }
        //res.redirect('/');
    });
    res.render('add-entry-success', { title: 'Submission Success' });
});

//get login
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Login' });
});

/* POST login page. */
router.post('/login', function (req, res, next) {
    
    console.log(req.body);

    let e = req.body.userEmail;
    let p = req.body.userPassword;
    
    console.log("EMAIL IS: "+e);
    //res.render('login-success', { title: 'Login Success' });

    //TODO Add to DB here
    let query = "SELECT password FROM Accounts WHERE email = '" + e + "'";
    db.query(query, (err, result, fields) => {

        console.log(result[0].password);
            
            if (err) {
                console.log("USER LOGIN : "+query);
            }

            else {

                if(result[0].password === p) {
                    res.render('login-success', { title: 'Login Success' });
                    userEmail = e;
                }

                else {
                    res.render('login', { title: 'Login' });
                } 
            }  
        });
    });

    // router.get('/createLogin');
    // router.post('/createLogin');

    router.get('/test', function (req, res, next) {

        let query = "SELECT R.*, A.* FROM ResearchIdea as R INNER JOIN Accounts as A on R.advisor_email = A.email";
        db.query(query, (err, result, fields) => {

            if (err) {
                console.log("ERROR");
            }

            else {
                //console.log(result);
                for(let r of result) {

                    let date = r.dateOfCreation;
                    let advisor_email = r.advisor_email;
                    let research_name = r.research_name;
                    let description = r.description;
                    let interests = r.interests;
                    let advisorName = r.name;
                    let password = r.password;
                    let phoneNumber = r.phonenumber;
                    let user_interests = r.user_interests;
                    let image = r.image; //U have to figure out how to get picture

                    //console.log("{"+date+","+advisor_email+","+research_name+","+description+","+interests+"}");
                }
            }  
        });
    });




module.exports = router;
