const Transfer = require('../store/transfer');
const User = require('../store/user');

exports.get = (req, res) => {

    Transfer.find({},[], {sort:{'date': -1}}).then(lstTransfers => {
        
        User.find().then(lstUsers => {

            let jsonOut = [];
            lstTransfers.map(trans => {
                let {idSender, idRecipient, credit, donation, date} = trans;
                
                let jsonTrans = {}; 
    
                let dateFormat = new Date(date);  // dateStr you get from mongodb
                let day = dateFormat.getDate().toString();
                let month = (dateFormat.getUTCMonth() + 1).toString(); //months from 1-12
                let year = dateFormat.getUTCFullYear().toString();
                let hours = dateFormat.getHours().toString();
                let minutes = dateFormat.getMinutes().toString();
    
                jsonTrans["date"] = day + '/' + month + '/' + year + " - " + hours + ":" + minutes;
    
                jsonTrans["idSender"] = idSender;
                let filter = lstUsers.filter( user => user.id == idSender);
                if(filter.length == 1)
                    jsonTrans["nameSender"] = filter[0].name;
                else
                    jsonTrans["nameSender"] = "Desconhecido";

                jsonTrans["idRecipient"] = idRecipient;                    
                filter = lstUsers.filter( user => user.id == idRecipient);
                if(filter.length == 1)
                    jsonTrans["nameRecipient"] = filter[0].name;
                else
                    jsonTrans["nameRecipient"] = "Desconhecido";
    
                if(credit > 0)
                    jsonTrans["value"] = credit;
                else
                    jsonTrans["value"] = donation;
    
                jsonOut.push(jsonTrans);
            })
    
            console.log('Recuperado histórico de transferências (Qt: ' + jsonOut.length + ')');
            res.status(200).json(jsonOut);
        })
        .catch((err) => {
            let msgError = 'Erro ao recuperar os nomes dos usuário das transferências: ' + err;
            console.log(msgError);
            res.status(500).send(msgError);
          })
    })
    .catch((err) => {
        let msgError = 'Erro ao recuperar histórico de transferências: ' + err;
        console.log(msgError);
        res.status(500).send(msgError);
      })
    ;


};

exports.post = (req, res, next) => {

    console.log(req.body);
    /*
    { 
        "idSender" : 1,
        "idRecipient" : 2,
        "credit": 0,
        "donation": 10,
        "description": "Primeira transação",
        "date": "2019-11-07"
    }
    */

    Transfer.create({
        idSender: req.body.idSender, 
        idRecipient: req.body.idRecipient, 
        credit: req.body.credit, 
        donation: req.body.donation, 
        description: req.body.description,
        date: req.body.date
    })
    .then(() => {
        console.log('Transferência efetuada!');
        res.status(201).send("Transferência efetuada!");
    })
    .catch(() => {
        console.log('Erro ao transferir!');
        res.status(500).send("Erro ao transferir!");
      })
    ;
    
};