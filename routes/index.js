//JASRAJ SINGH TODO ---> create login page + ensure eveything is added/okay in DB; insert photo in DB
//EVERYONE ELSE --> if u go to /test u have access to all the variables. if u need more info, messge me on messenger.

//import alert from 'alert-node'


var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
const fs = require("fs");
var mkdirp = require('mkdirp');

function checkSignIn(req, res, next) {
    if (req.session.userEmail) {
        next();
    } else {
        res.render('error', {message: "Sign in first"});
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'GitBook' });
});

/* GET add idea page. */
router.get('/add-entry', checkSignIn, function(req, res, next) {
    res.render('add-entry', { title: 'Submit a New Idea' });
});

/* POST add idea page. */
router.post('/add-entry', checkSignIn, upload.single('pic'), function (req, res, next) {
    let image = req.file;
    let title = req.body.title;
    let description = req.body.description;
    let tags = req.body.tags;
    let userEmail = req.session.userEmail;
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let imageExt = image.originalname.split(".")[1];
    fs.readFile("uploads/"+image.filename, function(err, data) {
        if (err) { console.log(err); }

        let imageData = data;

        var query = "INSERT INTO ResearchIdea SET ?";
        let values = {
            dateOfCreation: date,
            advisor_email: userEmail,
            research_name: title,
            description: description,
            interests: JSON.stringify(tags),
            research_image: imageData,
            research_imageExtension: imageExt
        };
        db.query(query, values, function (er, da) {
            if(er) console(er);
        });
    });

    res.render('add-entry-success', { title: 'Submission Success' });
});

router.get('/edit/:id', checkSignIn, function (req, res, next) {

    let query = "SELECT * FROM ResearchIdea WHERE research_name = '"+req.params['id']+"'";
    db.query(query, (err, result, fields) => {
        if (err) {
            console.log("ERROR");
        }
        else {
            let count = 0;
            //console.log(result);
            for(let r of result) {
                console.log("STARTING TEST");
                let date = r.dateOfCreation;
                let advisor_email = r.advisor_email;
                let title_name = r.research_name;
                let description = r.description;
                let tags = JSON.parse(r.interests);

                let image = r.image;
                let imgExt = r.imageExtension;
                let outputfile = "testImg" + count + "."+ imgExt;
                console.log("WRITING IMAGE");
                const buf = new Buffer(image, "binary");
                fs.writeFileSync(outputfile, buf);

                count = count + 1;

                res.render('edit-entry', {title: 'Edit Post', val_description: description, val_title: title_name, val_tags : tags, file : outputfile})
            }
        }
    });
    res.status(404);
});

router.post('/edit/:id', checkSignIn, function (req, res, next) {
    let image = req.file;
    let title = req.body.title;
    let description = req.body.description;
    let tags = req.body.tags;
    let userEmail = req.session.userEmail;
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if(image){
        let imageExt = image.originalname.split(".")[1];
        fs.readFile("uploads/"+image.filename, function(err, data) {
            if (err) { console.log(err); }

            let imageData = data;

            var query = "UPDATE ResearchIdea WHERE research_name = "+req.params['id']+" SET ?";
            let values = {
                dateOfCreation: date,
                advisor_email: userEmail,
                research_name: title,
                description: description,
                interests: JSON.stringify(tags),
                research_image: imageData,
                research_imageExtension: imageExt
            };
            db.query(query, values, function (er, da) {
                if(er) console.log(er);
            });
        });
    } else {
        var query = "UPDATE ResearchIdea WHERE research_name = "+req.params['id']+" SET ?";
        let values = {
            dateOfCreation: date,
            advisor_email: userEmail,
            research_name: title,
            description: description,
            interests: JSON.stringify(tags),
        };
        db.query(query, values, function (er, da) {
            if(er) console.log(er);
        });
    }

    res.render('edit-entry-success', { title: 'Submission Success' });
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

            else if(result.length === 0) {
                res.render('login', { title: 'Login' });
            }

            else {

                if(result[0].password === p) {
                    //res.render('login-success', { title: 'Login Success' });
                    req.session.userEmail = e;
                    res.redirect('/feed');
                }

                else {
                    res.render('login', { title: 'Login' });
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
    res.render('create-account', { title: 'Register' });
});
    

    /* POST add idea page. */
router.post('/create-login', upload.single('pic'), function (req, res, next) {

    let image = req.file;
    let email = req.body.email;
    let name = req.body.name;
    let password = req.body.password;
    let number = req.body.number;
    let tags = req.body.tags;
    let tagStr = JSON.stringify(tags);
    let imageExt = image.originalname.split(".")[1];
    fs.readFile("uploads/"+image.filename, function(err, data) {
        if (err) { console.log(err); }

        let imageData = data;

        var query = "INSERT INTO Accounts SET ?";
        let values = {
            email: email,
            name: name,
            password: password,
            phonenumber: number,
            image: imageData,
            imageExtension: imageExt,
            user_interests: tagStr
        };
        db.query(query, values, function (er, da) {
            if(er) console.log(er);
        });

        req.session.userEmail = email;
        res.redirect('/feed');
    });
    /*
    fs.open("uploads/"+image.filename, 'r', function (status, fd) {
        if (status) {
            console.log(status.message);
            return;
        }
        var fileSize = getFilesizeInBytes("uploads/"+image.filename);
        var buffer = new Buffer(fileSize);
        fs.read(fd, buffer, 0, fileSize, 0, function (err, num) {
    
            var query = "INSERT INTO Accounts SET ?",
                values = {
                    email: email,
                    name: name,
                    password: password,
                    phonenumber: number,
                    image: buffer,
                    imageExtension: imageExt,
                    user_interests: tagStr
                };
            db.query(query, values, function (er, da) {
                if(er) console.log(er);
            });
    
        });
    });*/



    // let query = "INSERT INTO Accounts (email, name, password, phonenumber, image, imageExtension, user_interests) VALUES ('" +
    //                         email + "', '" + name + "', '" + password + "', '" + number + "', BINARY(:'" + imageData + ")', '" + imageExt + "', '" + tagStr + "')";
    // console.log("Query is: "+query);
    // db.query(query, (err, result) => {
    //     if (err) {
    //         console.log("Query is: "+query);
    //         console.log(err);
    //         //return res.status(500).send(err);
    //     }
    //     res.redirect('/');
    // });
    
});

/*
NOTES: TRY TO SEE HOW TO INSERT PROPERLY INTO ACCOUNTS DB
INSERT IMAGE INTO DB
FIGURE OUT HOW TO DISPLAY PICTURE UNDER /test
*/
//edit account
router.get('/view-account', checkSignIn, async function(req, res, next){
    let email=req.query.email || req.session.userEmail;
    let name, phonenumber, image, comments, interests=null;
    let data = await getAll(email);
    let projects = await getUserProjects(email);
    console.log('***email is:' + email);
    name=data[0].name;
    phonenumber=data[0].phonenumber;
    image=data[0].image;
    interests=JSON.parse(data[0].user_interests);
    comments=data[0].comments;
    let imgExt=data[0].imageExtension;
    let path=`images/${email}.${imgExt}`;
    console.log('***path is:' + path);
    mkdirp('images', function(err) { console.log(err); });
    fs.writeFileSync(path, image);
    res.render('view-account', {title: name, email:email, username:name, phonenumber:phonenumber, interests:interests, projects:projects, path:path});
    
});


router.get('/edit-account', checkSignIn, async function (req, res, next) {
    let userEmail = req.session.userEmail;
    let name, phonenumber, image, interests=null;
    let data = await getAll(userEmail);
    name=data[0].name;
    phonenumber=data[0].phonenumber;
    image=data[0].image;
    interests=JSON.parse(data[0].user_interests);
    let comments=data[0].comments;
    let imgExt=data[0].imageExtension;
    let path=`images/${userEmail}.${imgExt}`;
    mkdirp('images', function(err) { console.log(err); });
    fs.writeFileSync(path, image);

    res.render('edit-account', { title: 'Edit Account', email:userEmail, username:name, phonenumber:phonenumber, interests:interests, comments:comments, path:path});
});

router.post('/edit-account', checkSignIn, upload.single('pic'), function (req, res, next) {
        let image = req.file;
        let name = req.body.name;
        let number = req.body.number;
        let tags = req.body.tags;
        let userEmail = req.session.userEmail;
        let tagStr = JSON.stringify(tags);
        let imageExt = image.originalname.split(".")[1];
        fs.readFile("uploads/"+image.filename, function(err, data) {
            if (err) { console.log(err); }
    
            let imageData = data;
    
            var query = 'UPDATE Accounts SET name=?, phonenumber= ?, image= ?, imageExtension= ?, user_interests= ?  WHERE email= ?';
            let values = [name, number, imageData, imageExt, tagStr, userEmail];
    
            db.query(query, values, function (er, da) {
                console.log(query.sql);
                if(er) console.log(er);
            });
            


            res.redirect('/feed');
        
        });
    });
    

async function getAll(email) {
    let userQuery = `SELECT * FROM Accounts where email=?`;

    try {
        let results = await query2(userQuery, email);
        return results;
    } catch (err) {
        console.log(err);
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

async function getInterests(userEmail) {
    let userQuery = `SELECT user_interests FROM Accounts WHERE email='${userEmail}'`;

    try {
        let results = await query(userQuery);        
        return JSON.parse(results[0].user_interests).sort();
    } catch (err) {
        console.log(err);
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
    let researchQuery = 'SELECT R.*, A.* FROM ResearchIdea as R INNER JOIN Accounts as A on R.advisor_email = A.email ORDER BY dateOfCreation DESC';
    console.log(userInterests);
    try {
        let results = await query(researchQuery);

        for(let r of results) {
            let date = r.dateOfCreation;
            let advisorEmail = r.advisor_email;
            let researchName = r.research_name;
            let description = r.description;
            let interests = JSON.parse(r.interests);
            let advisorName = r.name;
            let image = r.research_image; 
            let imgExt = r.research_imageExtension;
            let outputFile = `images/${researchName}.${imgExt}`;
            mkdirp('images', function(err) { console.log(err); });
            fs.writeFileSync(outputFile, image);
            if (interests.some(interest => userInterests.indexOf(interest) !== -1)) {
                let obj = { date: formatDateTime(date),
                            name: advisorName,
                            title: researchName,
                            profile: `view-account?email=${advisorEmail}`,
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

async function getUserProjects(email) {
    let projects = [];
    let researchQuery = 'SELECT R.*, A.* FROM ResearchIdea as R INNER JOIN Accounts as A on R.advisor_email = A.email ORDER BY dateOfCreation DESC';
    console.log(email);
    try {
        let results = await query(researchQuery);

        for(let r of results) {
            let date = r.dateOfCreation;
            let advisorEmail = r.advisor_email;
            let researchName = r.research_name;
            let description = r.description;
            let interests = JSON.parse(r.interests);
            let advisorName = r.name;
            let image = r.research_image; 
            let imgExt = r.research_imageExtension;
            let outputFile = `images/${researchName}.${imgExt}`;
            mkdirp('images', function(err) { console.log(err); });
            fs.writeFileSync(outputFile, image);
            if (r.advisor_email === email) {
                let obj = { date: formatDateTime(date),
                            name: advisorName,
                            title: researchName,
                            profile: `view-account?email=${advisorEmail}`,
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

/* GET feed page*/
router.get('/feed', checkSignIn, async function(req, res, next) {
    let userEmail = req.session.userEmail;
    let interests = await getInterests(userEmail);
    let projects = await getProjects(interests);
    res.render('feed', { interests: interests, projects: projects });
});

/* POST feed page */
router.post('/feed', checkSignIn, async function(req, res, next) {
    let userEmail = req.session.userEmail;
    let interests = await getInterests(userEmail);
    let selected = req.body.interest === "All" ? interests: [req.body.interest];
    let projects = await getProjects(selected);
    res.render('feed', { selected: req.body.interest, interests: interests, projects: projects});
});

router.get('/test', function (req, res, next) {

    // let query = "SELECT R.*, A.* FROM ResearchIdea as R INNER JOIN Accounts as A on R.advisor_email = A.email ORDER BY dateOfCreation";
    // db.query(query, (err, result, fields) => {

    //     if (err) {
    //         console.log("ERROR");
    //     }

    //     else {
    //         let count = 0;

    //         //console.log(result);
    //         for(let r of result) {
    //             console.log("STARTING TEST");
    //             let date = r.dateOfCreation;
    //             let advisor_email = r.advisor_email;
    //             let research_name = r.research_name;
    //             let description = r.description;
    //             let interests = r.interests;
    //             let advisorName = r.name;
    //             let phoneNumber = r.phonenumber;
    //             let image = r.image; 
    //             let imgExt = r.imageExtension;
    //             let outputfile = "outputImg" + count + "."+ imgExt;
    //             console.log("WRITING IMAGE");
    //             const buf = new Buffer(image, "binary");
    //             fs.writeFileSync(outputfile, buf);

    //             count = count + 1;

    //             //LUKE -- I think output file contains the image to be displayed....u can prob use that info..

    //             console.log("{"+date+","+advisor_email+","+research_name+","+description+","+interests+"}");
    //         }
    //     }  
    // });

    let researchName = "test2";
    let query = "SELECT * FROM ResearchIdea WHERE research_name = '"+researchName+"'";
    db.query(query, (err, result, fields) => {

        if (err) {
            console.log("ERROR");
        }

        else {
            let count = 0;

            //console.log(result);
            for(let r of result) {
                console.log("STARTING TEST");
                let date = r.dateOfCreation;
                let advisor_email = r.advisor_email;
                let research_name = r.research_name;
                let description = r.description;
                let interests = r.interests;
                
                let image = r.image; 
                let imgExt = r.imageExtension;
                let outputfile = "testImg" + count + "."+ imgExt;
                console.log("WRITING IMAGE");
                const buf = new Buffer(image, "binary");
                fs.writeFileSync(outputfile, buf);

                count = count + 1;

                //LUKE -- I think output file contains the image to be displayed....u can prob use that info..

                console.log("{"+date+","+advisor_email+","+research_name+","+description+","+interests+"}");
            }
        }  
    });

});

module.exports = router;

function readImageFile(file) {
    // read binary data from a file:
    const bitmap = fs.readFileSync(file);
    const buf = new Buffer(bitmap);
    return buf;
}

function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
}