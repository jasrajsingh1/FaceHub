//JASRAJ SINGH TODO ---> create login page + ensure eveything is added/okay in DB; insert photo in DB
//EVERYONE ELSE --> if u go to /test u have access to all the variables. if u need more info, messge me on messenger.

//import alert from 'alert-node'


var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
const fs = require("fs");
const crypto = require('crypto');

function hash(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');
    return [salt, hash].join('$');
}

function verify(password, hashed) {
    const originalHash = hashed.split('$')[1];
    const salt = hashed.split('$')[0];
    const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');
    return hash === originalHash;
}

function error_redirect(res){
    res.render('error', { authorized: false, message: "Database has Failed"});
}

function checkSignIn(req, res, next) {
    if (req.session.username) {
        next();
    } else {
        res.render('error', {authorized: req.session.username, message: "Sign in first"});
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { authorized: req.session.username, title: 'GitBook' });
});

/* GET add idea page. */
router.get('/add-entry', checkSignIn, function(req, res, next) {
    res.render('add-entry', { authorized: req.session.username, title: 'Submit a New Idea' });
});

/* POST add idea page. */
router.post('/add-entry', checkSignIn, upload.single('pic'), function (req, res, next) {
    let image = req.file;
    let title = req.body.title;
    let description = req.body.description;
    let tags = req.body.tags;
    let username = req.session.username;
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let splitImage = image.originalname.split(".");
    let imageExt = splitImage[splitImage.length - 1];
    fs.readFile("uploads/"+image.filename, function(err, data) {
        if (err) { error_redirect(res); }

        let imageData = data;

        var query = "INSERT INTO ResearchIdea SET ?";
        let values = {
            dateOfCreation: date,
            advisor_username: username,
            research_name: title,
            description: description,
            interests: JSON.stringify(tags),
            research_image: imageData,
            research_imageExtension: imageExt
        };
        db.query(query, values, function (er, da) {
            if(er) error_redirect(res);
        });
    });

    res.render('add-entry-success', { authorized: req.session.username, title: 'Submission Success' });
});

router.get('/edit/:id', checkSignIn, function (req, res, next) {

    console.log(req.params['id']);
    let query = "SELECT * FROM ResearchIdea WHERE research_name='"+req.params['id']+"'";
    db.query(query, (err, result, fields) => {
        if (err) {
            error_redirect(res);
        }
        else {
            for(let r of result) {
                let date = r.dateOfCreation;
                let advisorUsername = r.advisor_username;
                let researchName = r.research_name;
                let description = r.description;
                let tags = JSON.parse(r.interests);
                let advisorName = r.name;
                let image = r.research_image; 
                let imgExt = r.research_imageExtension;
                let outputFile = `images/${researchName}.${imgExt}`;
                fs.writeFileSync(outputFile, image);
                outputFile = "../" + outputFile;

                res.render('edit-entry', {authorized: req.session.username, title: 'Edit Post', val_description: description, val_title: researchName, val_tags : tags, file : outputFile})
            }
        }
    });
    res.status(404);
});

router.post('/edit/:id', checkSignIn, upload.single('pic'), async function (req, res, next) {
    let image = req.file;
    let title = req.body.title;
    let description = req.body.description;
    let tags = req.body.tags;
    let username = req.session.username;
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let researchUsername = await getProjectUsername(req.params['id']);
    console.log(req.params['id'])

    if (username !== researchUsername) {
        res.render('error', {authorized: req.session.username, message: "Cannot edit another user's post"});
    }

    if(image){
        let splitImage = image.originalname.split(".");
        let imageExt = splitImage[splitImage.length - 1];
        fs.readFile("uploads/"+image.filename, function(err, data) {
            if (err) { error_redirect(res); }

            let imageData = data;

            var query = "UPDATE ResearchIdea SET ? WHERE research_name = '"+req.params['id']+"'";
            let values = {
                dateOfCreation: date,
                advisor_username: username,
                research_name: title,
                description: description,
                interests: JSON.stringify(tags),
                research_image: imageData,
                research_imageExtension: imageExt
            };
            db.query(query, values, function (er, da) {
                if(er) error_redirect(res);
            });
        });
    } else {
        var query = "UPDATE ResearchIdea SET ? WHERE research_name = '"+req.params['id']+"'";
        let values = {
            dateOfCreation: date,
            advisor_username: username,
            research_name: title,
            description: description,
            interests: JSON.stringify(tags),
        };
        db.query(query, values, function (er, da) {
            if(er) error_redirect(res);
        });
    }

    res.render('edit-entry-success', { authorized: req.session.username, title: 'Submission Success' });
});

//get login
router.get('/login', function(req, res, next) {
    res.render('login', { authorized: req.session.username, title: 'Login' });
});

/* POST login page. */
router.post('/login', function (req, res, next) {
    let e = req.body.username.toLowerCase();
    let p = req.body.userPassword;

    let query = "SELECT password FROM Accounts WHERE username = '" + e + "'";
    db.query(query, (err, result, fields) => {
        if (err) {
            console.log("USER LOGIN : "+query);
        }

        else if(result.length === 0) {
            res.render('login', { authorized: req.session.username, title: 'Login' });
        }

        else {

            if(verify(p, result[0].password)) {
                req.session.username = e;
                res.redirect('/feed');
            }

            else {
                res.render('login', { authorized: req.session.username, title: 'Login' });
            } 
        }  
    });
});

router.get('/logout', function(req, res, next) {
    if (req.session) {
      req.session.destroy(function(err) {
        if(err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
});

router.get('/create-login', function (req, res, next) {
    res.render('create-account', { authorized: req.session.username, title: 'Register' });
});
    

    /* POST add idea page. */
router.post('/create-login', upload.single('pic'), function (req, res, next) {

    let image = req.file;
    let username = req.body.username.toLowerCase();
    let email = req.body.email;
    let name = req.body.name;
    let unhashed = req.body.password;
    let password = hash(unhashed);
    let number = req.body.number;
    let tags = req.body.tags;
    let tagStr = JSON.stringify(tags);
    let splitImage = image.originalname.split(".");
    let imageExt = splitImage[splitImage.length - 1];
    fs.readFile("uploads/"+image.filename, function(err, data) {
        if (err) { error_redirect(res); }

        let imageData = data;

        var query = "INSERT INTO Accounts SET ?";
        let values = {
            username: username,
            email: email,
            name: name,
            password: password,
            phonenumber: number,
            image: imageData,
            imageExtension: imageExt,
            user_interests: tagStr
        };
        db.query(query, values, function (er, da) {
            if(er) error_redirect(res);
        });

        req.session.username = username;
        res.redirect('/feed');
    });
});

/*
NOTES: TRY TO SEE HOW TO INSERT PROPERLY INTO ACCOUNTS DB
INSERT IMAGE INTO DB
FIGURE OUT HOW TO DISPLAY PICTURE UNDER /test
*/
//edit account
router.get('/view-account', checkSignIn, async function(req, res, next){
    let username=req.query.username || req.session.username;
    username = username.toLowerCase();
    let name, email, phonenumber, image, interests=null;
    let data = await getAll(username);
    let projects = await getUserProjects(username);
    
    name=data[0].name;
    email=data[0].email;
    phonenumber=data[0].phonenumber;
    image=data[0].image;
    interests=JSON.parse(data[0].user_interests);
    comments=data[0].comments;

    let imgExt=data[0].imageExtension;
    let path=`images/${username}.${imgExt}`;
    fs.writeFileSync(path, image);
    res.render('view-account', {authorized: req.session.username, title: name, email:email, username:name, phonenumber:phonenumber, interests:interests, projects:projects, path:path, own:username === req.session.username});
});


router.get('/edit-account', checkSignIn, async function (req, res, next) {
    let username = req.session.username;
    let name, phonenumber, image, interests=null;
    let data = await getAll(username);
    email=data[0].email;
    name=data[0].name;
    phonenumber=data[0].phonenumber;
    image=data[0].image;
    interests=JSON.parse(data[0].user_interests);
    let imgExt=data[0].imageExtension;
    let path=`images/${username}.${imgExt}`;
    fs.writeFileSync(path, image);

    res.render('edit-account', { authorized: req.session.username, title: 'Edit Account', email:email, name:name, phonenumber:phonenumber, interests:interests, path:path});
});

router.post('/edit-account', checkSignIn, upload.single('pic'), function (req, res, next) {
        let image = req.file;
        let name = req.body.name;
        let number = req.body.number;
        let tags = req.body.tags;
        let username = req.session.username;
        let tagStr = JSON.stringify(tags);

        if(image){
            let splitImage = image.originalname.split(".");
            let imageExt = splitImage[splitImage.length - 1];
            fs.readFile("uploads/"+image.filename, function(err, data) {
                if (err) { error_redirect(res); }
    
                let imageData = data;
    
                var query = 'UPDATE Accounts SET name=?, phonenumber= ?, image= ?, imageExtension= ?, user_interests= ?  WHERE username= ?';
                let values = [name, number, imageData, imageExt, tagStr, username];
        
                db.query(query, values, function (er, da) {
                    console.log(query.sql);
                    if(er) error_redirect(res);
                });
                


                res.redirect('/feed');
            });
        } else {
            var query = "UPDATE Accounts SET ? WHERE username='"+username+"'";
            let values = {
                name: name,
                phonenumber: number,
                user_interests: tagStr
            };
            db.query(query, values, function (er, da) {
                if(er) error_redirect(res);
            });

            
            res.redirect('/feed');
        }
    });
    

async function getAll(username) {
    let userQuery = `SELECT * FROM Accounts where username=?`;

    try {
        let results = await query2(userQuery, username);
        return results;
    } catch (err) {
        error_redirect(res);
    }
}

function query2(sql, values) {
    return new Promise((resolve, reject) => {
        db.query(sql, values,(err, result, fields) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result);
            }
        });
    });
}
function query(sql) {
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result, fields) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getInterests(username) {
    let userQuery = `SELECT user_interests FROM Accounts WHERE username='${username}'`;

    try {
        let results = await query(userQuery);        
        return JSON.parse(results[0].user_interests).sort();
    } catch (err) {
        error_redirect(res);
    }
}

function formatDateTime(dt) {
    let hours = dt.getHours();
    let minutes = dt.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours %= 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let time = `${hours}:${minutes} ${ampm}`;
    
    let month = dt.getMonth() + 1;
    let day = dt.getDate();
    let year = dt.getFullYear();
    let date = `${month}/${day}/${year}`;

    return `${date} ${time}`;
}

async function getProjects(userInterests) {
    let projects = [];
    let researchQuery = 'SELECT R.*, A.* FROM ResearchIdea as R INNER JOIN Accounts as A on R.advisor_username = A.username ORDER BY dateOfCreation DESC';
    try {
        let results = await query(researchQuery);

        for(let r of results) {
            let date = r.dateOfCreation;
            let advisorUsername = r.advisor_username;
            let researchName = r.research_name;
            let description = r.description;
            let interests = JSON.parse(r.interests);
            let advisorName = r.name;
            let image = r.research_image; 
            let imgExt = r.research_imageExtension;
            let outputFile = `images/${researchName}.${imgExt}`;
            fs.writeFileSync(outputFile, image);
            if (interests.some(interest => userInterests.indexOf(interest) !== -1)) {
                let obj = { date: formatDateTime(date),
                            name: advisorName,
                            title: researchName,
                            profile: `view-account?username=${advisorUsername}`,
                            description: description,
                            tags: interests,
                            filename: outputFile };
                projects.push(obj);
            }
        }

        return projects;
    } catch (err) {
        console.log(err);
    }
}

async function getUserProjects(username) {
    let projects = [];
    let researchQuery = 'SELECT R.*, A.* FROM ResearchIdea as R INNER JOIN Accounts as A on R.advisor_username = A.username ORDER BY dateOfCreation DESC';
    try {
        let results = await query(researchQuery);

        for(let r of results) {
            let date = r.dateOfCreation;
            let advisorUsername = r.advisor_username;
            let researchName = r.research_name;
            let description = r.description;
            let interests = JSON.parse(r.interests);
            let advisorName = r.name;
            let image = r.research_image; 
            let imgExt = r.research_imageExtension;
            let outputFile = `images/${researchName}.${imgExt}`;
            fs.writeFileSync(outputFile, image);
            if (advisorUsername === username) {
                let obj = { date: formatDateTime(date),
                            name: advisorName,
                            title: researchName,
                            profile: `view-account`,
                            description: description,
                            tags: interests,
                            filename: outputFile };
                projects.push(obj);
            }
        }

        return projects;
    } catch (err) {
        console.log(err);
    }
}

async function getProjectUsername(projectName) {
    let projects = [];
    let researchQuery = 'SELECT R.*, A.* FROM ResearchIdea as R INNER JOIN Accounts as A on R.advisor_username = A.username ORDER BY dateOfCreation DESC';
    try {
        let results = await query(researchQuery);

        for(let r of results) {
            let advisorUsername = r.advisor_username;

            return advisorUsername;
        }

        return projects;
    } catch (err) {
        console.log(err);
    }

    return null;
}

/* GET feed page*/
router.get('/feed', checkSignIn, async function(req, res, next) {
    let username = req.session.username;
    let interests = await getInterests(username);
    let projects = await getProjects(interests);
    res.render('feed', { authorized: req.session.username, interests: interests, projects: projects });
});

/* POST feed page */
router.post('/feed', checkSignIn, async function(req, res, next) {
    let username = req.session.username;
    let interests = await getInterests(username);
    let selected = req.body.interest === "All" ? interests: [req.body.interest];
    let projects = await getProjects(selected);
    res.render('feed', { authorized: req.session.username, selected: req.body.interest, interests: interests, projects: projects});
});

module.exports = router;