let express = require('express');
let router = express.Router();
let Schema = require('../database/schema');
const nodemailer = require('nodemailer');
let bcrypt = require('bcrypt');
require('dotenv/config');
const saltRounds = 10;

router.post('/',function (req,res) {
    let investorSchema = Schema.investor({
        NoActiveMember: req.body.NoActiveMember,
        FullName: req.body.FullName,
        Email: req.body.Email,
        LinkedInUrl: req.body.LinkedInUrl,

        //Investor's Company Information
        CompanyName: req.body.CompanyName,
        InvestorGroupType: req.body.InvestorGroupType,
        RoleInCompany: req.body.RoleInCompany,
        CompanyWebsite: req.body.CompanyWebsite,
        InvestmentFocusSector: req.body.InvestmentFocusSector,
        CompanyCity: req.body.CompanyCity,
        AboutCompany: req.body.AboutCompany,
        AmountToInvest: req.body.AmountToInvest,

        //User Information
        UserID: req.body.UserID,
        Password: bcrypt.hashSync(req.body.Password,saltRounds),
        Type: "Investor"
    });


    // letiables used in validation
    let Linkedinurl = req.body.LinkedInUrl;
    let Companyurl = req.body.CompanyWebsite;
    let fname = req.body.FullName;
    // IMPLEMENTING VALIDATION FOR INVESTOR

    req.checkBody('FullName','Your Fullname entered contains other values than alphabets.')
        .isAlpha();
    req.checkBody('Password', 'password must be at least 5 chars long ')
        .isLength({ min: 5 });
    req.checkBody('Password','password and Confirm password must be same ')
        .equals(req.body.ConfirmPassword);
    req.checkBody('LinkedInUrl','LinkedIn URL entered is incorrect.')
        .isURL({Linkedinurl});
    if(!!(req.body.CompanyWebsite)){
        req.checkBody('CompanyWebsite','Company website URL entered is incorrect.')
            .isURL({Companyurl});
    }

    let errors = req.validationErrors();
    // if an error occurs
    if(errors){
        for(i=0;i<errors.length;i++){
            console.log(errors[i].msg);
        }
        return res.send(errors);
    }
    // when no error occurs
    else {
        res.send("Your account has been created.Login to use your account.")
    }


    let transporter = nodemailer.createTransport({
        service:"Gmail",
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAILUSER,     // generated ethereal user
            pass: process.env.MAILPASSWORD  // generated ethereal password
        }
    });

// setup email data with unicode symbols
    let mailOptions = {
        from: 'MoneyGust101@gmail.com', // sender address
        to: investorSchema.Email, // list of receivers
        subject:'MoneyGust Autogenerated Mail (do not reply)', // Subject line
        text: 'Thank you for joining MoneyGust.',
        html:  '<b>Thank you for joining MoneyGust. ' +
        'We will help you in finding best startup to invest your money.</b>'
    };

// send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
// Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
});

        investorSchema.save(function (err,data) {

            if(err) throw err;
        });

});


module.exports = router;