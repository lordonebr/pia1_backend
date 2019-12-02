const Award = require('../store/award');

exports.get = (req, res) => {
    
    Award.find({}, [], {sort:{'cost': 1}}).then(lstAwards => {

            let jsonOut = [];
            lstAwards.map(award => {
                let {id, description, cost } = award;

                let jsonAward = {}; 
                jsonAward["id"] = id;
                jsonAward["description"] = description;
                jsonAward["cost"] = cost;

                jsonOut.push(jsonAward);
            });

            console.log('Recuperado lista de premiações (Qt: ' + jsonOut.length + ')');
            res.status(200).json(jsonOut);
        }
    )
    .catch((err) => {
        let msgError = 'Erro ao recuperar lista de premiações: ' + err;
        console.log(msgError);
        res.status(500).send(msgError);
    });
};

exports.post = (req, res, next) => {

    console.log(req.body);
    /*

    { 
        "description" : "Caixa de bombom garoto",
        "cost": 10
    }

    { 
        "description" : "Par ingressos Cinema Cinemark",
        "cost": 25
    }

    { 
        "description" : "Voucher de 100 reais - Outback",
        "cost": 50
    }

    { 
        "description" : "Camisa oficial da seleção brasileira",
        "cost": 250
    }

    { 
        "description" : "Dia de folga",
        "cost": 100
    }

    { 
        "description" : "Hospedagem Final de semana no Tauá Resort Caeté (2 pessoas)",
        "cost": 500
    }

    { 
        "description" : "Vale-Presente Lojas Americanas - 100 reais",
        "cost": 50
    }

    { 
        "description" : "Fone de ouvido sem fio - JBL TUNE 500BT",
        "cost": 270
    }

    { 
        "description" : "Copo de Cerveja Backer",
        "cost": 30
    }

    { 
        "description" : "Garrafa de água de plástico (500ml)",
        "cost": 15
    }

    { 
        "description" : "Panetone Cacau Show",
        "cost": 40
    }
    */

   let msgErrorValues = undefined;
   if(!req.body.description)
       msgErrorValues = 'Erro: a descrição deve ser preenchida!';
   if(!req.body.cost)
       msgErrorValues = 'Erro: o valor de custo deve ser preenchido!';

    let costValue = 0;
    if(req.body.cost){
        costValue = req.body.cost;
        if(costValue !== "" && !isNaN(costValue)){
            costValue = parseInt(costValue);
            if(costValue < 0)
                msgErrorValues = 'Erro: o valor de custo deve ser um número positivo!';
        }
        else
            msgErrorValues = 'Erro: o valor de custo deve ser um número!';
    }
        
    if(msgErrorValues)        
    {
        console.log(msgErrorValues);
        return res.status(400).send({ success: false, message: msgErrorValues });
    }
    
    Award.find({},['id'], {sort:{'id': -1}}, function(err, docs){

        let newId = 1;
        if(docs != null && docs != undefined && docs.length > 0)
            newId = docs[0]["id"] + 1;

        let jsonNewAward = {
            id: newId, 
            description: req.body.description, 
            cost: costValue
        };

        Award.create(jsonNewAward)
        .then(() => {
            let msg = 'Premiação foi adicionada com sucesso!';
            console.log(msg);
            res.status(201).send({ success: true, message: msg });
        })
        .catch((err) => {
            let msgError = 'Erro ao adicionar premiação: ' + err;
            console.log(msgError);
            res.status(500).send({ success: false, message: msgError });
        });
    })
    .catch(error => {
        let msgError = 'Ocorreu o seguinte erro ao adicionar premiação: ' + error;
        console.log(msgError);
        res.status(500).send({ success: false, message: msgError });
    });
    
};