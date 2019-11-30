const mongoose = require('mongoose');
const User = require('../store/user');
const Transfer = require('../store/transfer');

exports.get = (req, res) => {

    User.find({'systemUser': false}, [], {sort:{'name': 1}}).then(lstUser => {

            let jsonOut = [];
            lstUser.map(user => {
                let {id, name} = user;

                let jsonUser = {}; 
                jsonUser["id"] = id;
                jsonUser["name"] = name;

                jsonOut.push(jsonUser);
            });

            console.log('Recuperado lista de usuarios (Qt: ' + jsonOut.length + ')');
            res.status(200).json(jsonOut);
        }
    )
    .catch((err) => {
        let msgError = 'Erro ao recuperar lista de usuários: ' + err;
        console.log(msgError);
        res.status(500).send(msgError);
      })
    ;

};

exports.getUser = (req, res) => {

    let idUser = req.params.id;

    User.find({id : idUser}).then(lst => 
        {
            console.log('Recuperado informações do usuário ' + idUser.toString());
            res.status(200).json(lst);
        }
    )
    .catch(() => {
        let msgError = 'Erro ao recuperar informações do usuário ' + idUser.toString();
        console.log(msgError);
        res.status(500).send(msgError);
      })
    ;

};

exports.createUser = (req, res, next) => {

    // exemplos de JSONs do sistema
    /*{ 
        "name" : "DTI Digital",
        "email" : "coins@dti.com",
        "password" : "123",
        "systemUser" : true
    }

    { 
        "name" : "Recompensa",
        "email" : "coins2@dti.com",
        "password" : "123",
        "systemUser" : true
    }
    */

    // exemplo de JSON
    /*{ 
        "name" : "André Lordone",
        "email" : "andgas@yahoo.com.br",
        "password" : "123"
    }*/

    console.log('JSON: ' + JSON.stringify(req.body));

    let msgErrorValues = undefined;
    if(!req.body.email)
        msgErrorValues = 'Erro: campo e-mail deve ser preenchido!';
    if(!req.body.name)
        msgErrorValues = 'Erro: campo nome deve ser preenchido!';
    if(!req.body.password)
        msgErrorValues = 'Erro: campo senha deve ser preenchido!';

    if(msgErrorValues)        
    {
        console.log(msgErrorValues);
        return res.status(400).send({ signup: false, message: msgErrorValues });
    }

    User.findOne({email : req.body.email})
    .then(
        foundEmail =>
        {
            if(foundEmail){
                // email já foi cadastrado
                let msg = 'E-mail já cadastrado!';
                console.log(msg);
                return res.status(400).send({ signup: false, message: msg });
            }
            else{

                User.find({},['id'], {sort:{'id': -1}}, function(err, docs){
                    
                    let newId = 1;
                    if(docs != null && docs != undefined && docs.length > 0)
                        newId = docs[0]["id"] + 1;

                    let jsonNewUser = {
                        id: newId, 
                        name: req.body.name, 
                        email: req.body.email,
                        password: req.body.password
                    };

                    if(req.body.systemUser)
                        jsonNewUser["systemUser"] = req.body.systemUser;
                        
                    // email ainda não foi cadastrado, vamos tentar cadastra-lo
                    User.create(jsonNewUser)
                    .then(() => {

                        let msg = 'Usuário cadastrado com sucesso! Faça o Login.';
                        console.log("ID_USER: " + newId + " - "+ msg);

                        let dateObj = new Date();
                        let month = dateObj.getUTCMonth() + 1; //months from 1-12
                        let year = dateObj.getUTCFullYear();
                        let descTrans = "Crédito mensal (" + month.toString() + "/" + year.toString() + ")";

                        Transfer.create({
                            idSender: 1, 
                            idRecipient: newId, 
                            credit: 100, 
                            donation: 0, 
                            description: descTrans
                        })
                        .then(() => {
                            console.log(descTrans);
                            res.status(201).send({ signup: true, message: msg });
                        })
                        
                    })
                    .catch(error => {
                        let msgError = 'Ocorreu o seguinte erro ao cadastrar o usuário: ' + error;
                        console.log(msgError);
                        res.status(500).send({ signup: false, message: msgError });
                    });
                })
                .catch(error => {
                    let msgError = 'Ocorreu o seguinte erro ao cadastrar o usuário: ' + error;
                    console.log(msgError);
                    res.status(500).send({ signup: false, message: msgError });
                });
            }
        }
    )
    .catch(error => {
        let msgError = 'Ocorreu o seguinte erro ao cadastrar o usuário: ' + error;
        console.log(msgError);
        res.status(500).send({ signup: false, message: msgError });
    });

};

exports.getUserDonations = (req, res) => {

    let idUser = req.params.id;

    Transfer.find({idSender : idUser}).then(lst => 
        {
            console.log('Recuperado lista de doações do usuário ' + idUser.toString());
            res.status(200).json(lst);
        }
    )
    .catch(() => {
        let msgError = 'Erro ao recuperar lista de doações do usuário ' + idUser.toString();
        console.log(msgError);
        res.status(500).send(msgError);
      })
    ;

};

exports.getUserReceptions = (req, res) => {

    let idUser = req.params.id;

    Transfer.find({ $and:[ {idRecipient : idUser}, {donation : {$gt : 0}}]}).then(lst => 
        {
            console.log('Recuperado lista de recebimentos do usuário ' + idUser.toString());
            res.status(200).json(lst);
        }
    )
    .catch(() => {
        let msgError = 'Erro ao recuperar lista de recebimentos do usuário ' + idUser.toString();
        console.log(msgError);
        res.status(500).send(msgError);
      })
    ;

};

exports.getUserBalances = (req, res) => {

    let idUser = req.params.id;

    Transfer.find({ $or:[ {idSender : idUser}, {idRecipient : idUser} ]}).then(lst => 
        {
            console.log(lst);
            let allCredit = lst.reduce((credit, transfer) => 
                {return credit + transfer.credit}, 0);

            let allDonations = lst.filter(val => val.idSender == idUser).reduce((donation, transfer) => 
                {return donation + transfer.donation}, 0);

            let allReceptions = lst.filter(val => val.idRecipient == idUser).reduce((received, transfer) => 
                {return received + transfer.donation}, 0);

            let jsonBalances = {};
            jsonBalances.credit = allCredit - allDonations;
            jsonBalances.donations = allDonations;
            jsonBalances.receptions = allReceptions;

            console.log('Recuperado saldos (USER_ID: ' + idUser.toString() + ')');
            res.status(200).json(jsonBalances);
        }
    )
    .catch(() => {
        let msgError = 'Erro ao recuperar lista de recebimentos do usuário ' + idUser.toString();
        console.log(msgError);
        res.status(500).send(msgError);
      })
    ;

};