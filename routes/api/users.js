const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');

//POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res, next) => {
  const { body: { user } } = req;
  console.log('in signup new user obj',req.body);
  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      }, 
    });
  }

  const finalUser = new Users(user);

  finalUser.setPassword(user.password);
  console.log('Final User is ',finalUser);
  return finalUser.save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }));
});
// POST Verify email id
router.post('/forgetpassword',(req,res,next)=>{
  console.log('email in forget password',req.body);
  const { body: { user :{ email}} } = req;
  Users.findOne({email:email},(err,data)=>{
    if(err){
      res.status(400).send({'message':'This Email does not exist in DB.'});
    }
    else{
      console.log(data);
      res.status(200).send({data:data});
    }
  })
});
//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;
  console.log('req in login',req.body);
  if(!user.email) { 
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      return next(err);
    }

    if(passportUser) {
      const user = passportUser;
      
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON() });
    }

    return status(400).info;
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  console.log('in current payload',req); 
  console.log('in current ',id,req.payload);
  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

module.exports = router;