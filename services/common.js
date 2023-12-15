const passport = require('passport')
exports.isAuth=(req,res,done)=>{
   return passport.authenticate('jwt')
}

exports.sanitizeUser = (user) => {
    return {id:user.id, role:user.role}
}
exports.cookieExtractor = function(req){
    let token = null;
    if(req && req.cookies){
        token = req.cookies['jwt']
    }
    //TODO : this is temporary token for testing without cookie
    // suraj@gmail.com
    // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M3Y2UyNGY5MDRhNWIyNTdkZGIxOSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzAyNjU3MjUwfQ.XPloLLTg84Lb7f3zROPzsV2vL_UaQPQov2ObvJyJbV8'
    
    //suraj1@gmail.com
    // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M4YTBiYjQxMDQ2YTU2YzM3ZTZiMyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzAyNjYwNjE5fQ.X0rVnqvYJEtkZJFVusyHPYxEEG1q1nYLYlbYJsGAqJg'

    //admin@gmail.com
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2M4ZTIzNDVlNTY0YmRjZTkxZTM4NSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMjY2MjAyM30.Tr5naf3bz3zAH9mhu3J_NTTchZw9GNJMjV1i1XwAuVQ'
    return token;
}