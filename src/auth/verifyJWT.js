var jwt = require('jsonwebtoken');

module.exports = function verifyJWT(req, res, next){
    console.log("verifyJWT");

    var token = req.headers['x-access-token'];
    if (!token) {
      const msgFailed = 'Nenhum token foi fornecido';
      console.log(msgFailed);
      return res.status(401).send({ auth: false, message: msgFailed });
    }
    
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        const msgFailed = 'Sessão expirada, faça login novamente';
        console.log(msgFailed);
        return res.render('login', { auth: false, message: msgFailed });
      }
      
      // se tudo estiver ok, salva no request para uso posterior
      req.userId = decoded.id;
      next();
    });
  }