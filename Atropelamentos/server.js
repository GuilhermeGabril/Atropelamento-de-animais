const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Configuração do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'atropelamentos'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        throw err;
    }
    console.log('Conectado ao banco de dados MySQL');
});



// Rota para obter as espécies
app.get('/especie', (req, res) => {
    const sql = 'SELECT CodEsp, NomeComum FROM especie';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao obter espécies:', err);
            res.status(500).send('Erro ao obter espécies');
        } else {
            res.json(result);
        }
    });
});



// Rota para obter os tipos de pavimento
app.get('/tipopav', (req, res) => {
    const sql = 'SELECT * FROM tipopav';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao obter os pavimentos:', err);
            res.status(500).send('Erro ao obter pavimentos');
        } else {
            res.json(result);
        }
    });
});



// Rota para obter as rodovias
app.get('/rodovia', (req, res) => {
    const sql = 'SELECT * FROM rodovia';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao obter as rodovias:', err);
            res.status(500).send('Erro ao obter rodovias');
        } else {
            res.json(result);
        }
    });
});



// Rota para obter as UFs
app.get('/uf', (req, res) => {
    const sql = 'SELECT * FROM uf';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao obter UF:', err);
            res.status(500).send('Erro ao obter UF');
        } else {
            res.json(result);
        }
    });
});




app.post('/addatropelamento', (req, res) => {
    const {
        especie,
        tipopav,
        rodovia,
        uf,
        agua_na_pista,
        data_hora,
        quilometro,
        numero_pistas,
        velocidade_maxima,
        situacao_animal
    } = req.body;

    const data = new Date(data_hora);
    const dataAtrop = data.toISOString().split('T')[0];
    const horaAtrop = data.toTimeString().split(' ')[0];

    // Buscar ou criar a situação do animal
    const selectOrCreateSituation = `
        INSERT INTO situacaofinal (Descrsit)
        VALUES (?)
        ON DUPLICATE KEY UPDATE Codsit=LAST_INSERT_ID(Codsit);
    `;

    db.query(selectOrCreateSituation, [situacao_animal], (err, results) => {
        if (err) {
            console.error('Erro ao buscar ou criar situação do animal:', err);
            return res.status(500).send('Erro ao buscar ou criar situação do animal');
        }

        const codSit = results.insertId;


        

        // Buscar o CodAloc com base nos códigos de espécie e unidade federativa
        const selectRegistroCatuf = `
            SELECT CodAloc FROM registrocatuf
            WHERE CodEsp = ? AND CodUF = ?
        `;
        
        db.query(selectRegistroCatuf, [especie, uf], (err, results) => {
            if (err) {
                console.error('Erro ao buscar registro de alocação:', err);
                return res.status(500).send('Erro ao buscar registro de alocação');
            }
            
            if (results.length === 0) {
                return res.status(404).send('Registro de alocação não encontrado');
            }
            
            const codAloc = results[0].CodAloc;
            
            // Inserir novo atropelamento
            const insertAtropelamento = `
                INSERT INTO atropelamento (DataAtrop, HoraAtrop, Km, Haagua, Numpistas, VelMax, Codsit, CodTipopav, CodAloc, CodRodovia)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.query(insertAtropelamento, [
                dataAtrop,
                horaAtrop,
                quilometro,
                agua_na_pista ? 1 : 0,
                numero_pistas,
                velocidade_maxima,
                codSit,
                tipopav,
                codAloc,
                rodovia
            ], (err, result) => {
                if (err) {
                    console.error('Erro ao inserir atropelamento:', err);
                    return res.status(500).send('Erro ao inserir atropelamento');
                }
                
                res.send('Atropelamento cadastrado com sucesso');
            });
        });
    });
});

app.use(express.static('public'));

app.listen(5500, () => {
    console.log('Servidor rodando na porta 5500');
});
