const Transfer = require('../store/transfer');
const User = require('../store/user');

exports.get = (req, res) => {
    
    let filter = {};
    let options = {sort:{'date': -1}}
    if(req.query && req.query.filter){
        let objFilter = JSON.parse(req.query.filter);

        if(objFilter.hasOwnProperty("limit"))
            options["limit"] = objFilter["limit"];
        
        let lstFilters = [];
        if(objFilter.hasOwnProperty("idSender"))
            lstFilters.push({idSender : objFilter["idSender"]});

        if(objFilter.hasOwnProperty("idRecipient"))
            lstFilters.push({idRecipient : objFilter["idRecipient"]});

        if(objFilter.hasOwnProperty("date")){

            const regExpDate = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
            let resultExp = regExpDate.exec(objFilter["date"]);
            if(resultExp){
                let parseDate = new Date(resultExp[3], resultExp[2]-1, resultExp[1]);
                let dateLimit = parseDate.getUTCFullYear() + "/" + (parseDate.getUTCMonth() + 1) + "/" + parseDate.getUTCDate();

                let parseDate2 = parseDate;
                parseDate2.setDate(parseDate2.getUTCDate() + 1);
                let dateLimit2 = parseDate2.getUTCFullYear() + "/" + (parseDate2.getUTCMonth() + 1) + "/" + parseDate2.getUTCDate();

                lstFilters.push({date : { $gte: dateLimit, $lte: dateLimit2 } });
            }
        }

        if(lstFilters.length > 0)
            filter = { $or: lstFilters }
    }
    console.log("Filtro transferências: " + JSON.stringify(filter));
    
    Transfer.find(filter, [], options).then(lstTransfers => {
        
        User.find().then(lstUsers => {
            let jsonOut = [];
            lstTransfers.map(trans => {
                let {idSender, idRecipient, credit, donation, date, description} = trans;
                
                let jsonTrans = {}; 
    
                let dateBD = new Date(date);  // dateStr you get from mongodb
                let dateFormat = new Date(dateBD.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));

                let day = formatTwoDigits(dateFormat.getDate());
                let month = formatTwoDigits((dateFormat.getUTCMonth() + 1)); //months from 1-12
                let year = dateFormat.getUTCFullYear().toString();
                let hours = formatTwoDigits(dateFormat.getHours());
                let minutes = formatTwoDigits(dateFormat.getMinutes());
    
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

                jsonTrans["description"] = description;  
    
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
      });
};

formatTwoDigits = (val) => {
    val = val.toString();
    if(val.length == 1)
        val = '0' + val;

    return val;
}

exports.post = (req, res, next) => {

    console.log(req.body);
    /*
    { 
        "idSender" : 1,
        "idRecipient" : 2,
        "credit": 0,
        "donation": 10,
        "description": "Primeira transação"
    }
    */

   let msgErrorValues = undefined;
   if(!req.body.idSender)
       msgErrorValues = 'Erro: id do usuário que envia a transferência deve ser preenchido!';
   if(!req.body.idRecipient)
       msgErrorValues = 'Erro: id do usuário que recebe a transferência deve ser preenchido!';
   if(!req.body.description)
       msgErrorValues = 'Erro: descrição da transferência deve ser preenchido!';

    let qtCredit = 0;
    if(req.body.credit){
        qtCredit = req.body.credit;
        if(qtCredit !== "" && !isNaN(qtCredit)){
            qtCredit = parseInt(qtCredit);
            if(qtCredit < 0)
                msgErrorValues = 'Erro: quantidade de créditos enviada deve ser um número positivo!';
        }
        else
            msgErrorValues = 'Erro: quantidade de créditos enviada deve ser um número!';
    }

    let qtDonation = 0;
    if(req.body.donation){
        qtDonation = req.body.donation;
        if(qtDonation !== "" && !isNaN(qtDonation)){
            qtDonation = parseInt(qtDonation);
            if(qtDonation < 0)
                msgErrorValues = 'Erro: quantidade de créditos doada deve ser um número positivo!';
        }
        else
            msgErrorValues = 'Erro: quantidade de créditos doada deve ser um número!';
    }
        
    if(msgErrorValues)        
    {
        console.log(msgErrorValues);
        return res.status(400).send({ success: false, message: msgErrorValues });
    }

    let jsonNewTransfer = {
        idSender: req.body.idSender, 
        idRecipient: req.body.idRecipient, 
        credit: qtCredit, 
        donation: qtDonation, 
        description: req.body.description
    };

    Transfer.create(jsonNewTransfer)
    .then(() => {
        let msg = 'Transferência efetuada com sucesso!';
        console.log(msg);
        res.status(201).send({ success: true, message: msg });
    })
    .catch((err) => {
        let msgError = 'Erro ao transferir: ' + err;
        console.log(msgError);
        res.status(500).send({ success: false, message: msgError });
      });
    
};