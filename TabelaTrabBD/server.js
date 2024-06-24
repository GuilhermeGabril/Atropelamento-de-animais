const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 5500;

// Configuração do banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'atropelamentos'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL.');
});

// Configurar EJS como motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial que busca e renderiza os funcionários
app.get('/', (req, res) => {
    const query = `
        SELECT a.DataAtrop, a.HoraAtrop, a.Km, a.Haagua, a.NumPistas, a.VelMax,
        sf.Descrsit AS situacao, tp.NomePav AS pavimento, r.NomeRodovia AS rodovia,
        e.NomeComum AS nomeespecie, u.NomeUF AS nomeUF
        FROM atropelamento a
        JOIN situacaofinal sf ON a.Codsit = sf.Codsit
        JOIN tipopav tp ON a.CodTipopav = tp.CodTipopav
        JOIN rodovia r ON a.CodRodovia = r.CodRodovia
        JOIN registrocatuf rc ON a.CodAloc = rc.CodAloc
        JOIN especie e ON rc.CodEsp = e.CodEsp
        JOIN uf u ON rc.CodUF = u.CodUF
        GROUP BY a.DataAtrop, a.HoraAtrop, a.Km, a.Haagua, a.NumPistas, a.VelMax,
        sf.Descrsit, tp.NomePav, r.NomeRodovia, e.NomeComum, u.NomeUF
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar dados:', err);
            res.status(500).send('Erro ao buscar dados');
            return;
        }
        res.render('index', { atropelamentos: results });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
