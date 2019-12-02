const mongoose = require('mongoose');
const User = require('../store/user');
const Transfer = require('../store/transfer');
const Award = require('../store/award');

exports.get = (req, res) => {

    let filter = {'systemUser': false}; // padrão é não carregar os usuarios do sistema
    if(req.query && req.query.filter){
        let objFilter = JSON.parse(req.query.filter);

        if(objFilter.hasOwnProperty("allUsers"))
            filter = {};
    }

    User.find(filter, [], {sort:{'name': 1}}).then(lstUser => {

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
      });

};

exports.postAwards = (req, res) => {

    let idUser = req.params.id;
    let idUserAward = 2;
    console.log(req.body);

    let lstAwardsPick = null
    let msgErrorValues = undefined;
    if(Array.isArray(req.body)){
        lstAwardsPick = req.body;
        if(lstAwardsPick.length <= 0)
            msgErrorValues = 'Erro: é necessário uma lista de objetos!';
    } else
        msgErrorValues = 'Erro: é necessário uma lista de objetos!';

    if(msgErrorValues)        
    {
        console.log(msgErrorValues);
        return res.status(400).send({ success: false, message: msgErrorValues });
    }
    
    Award.find({}).then(lstAwards => {

        Transfer.find({ $or:[ {idSender : idUser}, {idRecipient : idUser} ]}).then(lstTransfers => {
           
            let allReceptions = lstTransfers.filter(val => val.idRecipient == idUser).reduce((received, transfer) => 
                {return received + transfer.donation}, 0);

            let lstItemsFound = lstAwards.filter(idx => {if(lstAwardsPick.find(op=> op.id == idx.id) != null) return true});
            let sumCostAwards = lstItemsFound.reduce((total, awardSel) => {return total + awardSel.cost}, 0);
            console.log("allReceptions: " + allReceptions);
            console.log("sumCostAwards: " + sumCostAwards);
            if(sumCostAwards > allReceptions){
                let msgError = 'Não é possível resgatar os prêmios selecionados, não existem créditos suficientes (Necessário: ' + sumCostAwards.toString() + ' / Saldo atual: ' + allReceptions.toString();
                console.log(msgError);
                return res.status(400).send({ success: false, message: msgError });
            }
            
            let lstJsonNewTransfer = [];
            for(let x = 0; x < lstAwardsPick.length; x++){

                let awardFound = lstAwards.find(item => item.id == lstAwardsPick[x].id);
                
                if(awardFound){
                    let costSel = awardFound.cost;
                    let descriptionSel = awardFound.description;
                    let jsonNewTransfer = {
                        idSender: idUser, 
                        idRecipient: idUserAward, 
                        credit: 0, 
                        donation: costSel, 
                        description: descriptionSel
                    };
    
                    lstJsonNewTransfer.push(jsonNewTransfer);
                }
            }
            
            if(lstItemsFound.length !== lstJsonNewTransfer.length){
                let msgError = 'Ocorreu um erro com os prêmios requisitados, algum prêmio pode não existir mais! Carregue a página de prêmios e faça novamente o pedido!';
                console.log(msgError);
                return res.status(400).send({ success: false, message: msgError });
            }
            
            Transfer.create(lstJsonNewTransfer)
            .then(() => {
                let msg = 'Parabéns, resgate realizado com sucesso!';
                console.log(msg);
                res.status(201).send({ success: true, message: msg });
            })
            .catch((err) => {
                let msgError = 'Erro ao resgatar premiações: ' + err;
                console.log(msgError);
                res.status(500).send({ success: false, message: msgError });
            });
        })
        .catch(() => {
            let msgError = 'Erro ao validar premiações solicitadas para resgate: ' + err;
            console.log(msgError);
            res.status(500).send(msgError);
          });
        }
    )
    .catch((err) => {
        let msgError = 'Erro ao validar premiações solicitadas para resgate: ' + err;
        console.log(msgError);
        res.status(500).send(msgError);
    });
};