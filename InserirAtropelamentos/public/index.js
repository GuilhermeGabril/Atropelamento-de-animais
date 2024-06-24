document.addEventListener('DOMContentLoaded', () => {
    fetch('/especie')
        .then(response => response.json())
        .then(data => {
            const especieSelect = document.getElementById('especie');
            data.forEach(especie => {
                const option = document.createElement('option');
                option.value = especie.CodEsp;
                option.textContent = especie.NomeComum;
                especieSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao carregar espécies:', error));
        
    fetch('/tipopav')
        .then(response => response.json())
        .then(data => {
            const tipopavSelect = document.getElementById('tipopav');
            data.forEach(tipopav => {
                const option = document.createElement('option');
                option.value = tipopav.CodTipopav;
                option.textContent = tipopav.NomePav;
                tipopavSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao carregar pavimentos:', error));

    fetch('/rodovia')
        .then(response => response.json())
        .then(data => {
            const rodoviaSelect = document.getElementById('rodovia');
            data.forEach(rodovia => {
                const option = document.createElement('option');
                option.value = rodovia.CodRodovia;
                option.textContent = rodovia.NomeRodovia;
                rodoviaSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao carregar rodovias:', error));

    fetch('/uf')
        .then(response => response.json())
        .then(data => {
            const ufSelect = document.getElementById('uf');
            data.forEach(uf => {
                const option = document.createElement('option');
                option.value = uf.CodUF;
                option.textContent = uf.NomeUF;
                ufSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao carregar UFs:', error));

    const form = document.getElementById('atropelamentoForm');
    const messageDiv = document.createElement('div');
    messageDiv.id = 'message';
    form.appendChild(messageDiv);
    
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {
            especie: formData.get('especie'),
            tipopav: formData.get('tipopav'),
            rodovia: formData.get('rodovia'),
            uf: formData.get('uf'),
            agua_na_pista: formData.get('agua_na_pista') ? true : false,
            data_hora: formData.get('data_hora'),
            quilometro: formData.get('quilometro'),
            numero_pistas: formData.get('numero_pistas'),
            velocidade_maxima: formData.get('velocidade_maxima'),
            situacao_animal: formData.get('situacao_animal')
        };

        // Corrigindo a verificação do checkbox
        data.agua_na_pista = document.getElementById('agua').checked;

        fetch('/addatropelamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao cadastrar atropelamento');
            }
            return response.text();
        })
        .then(message => {
            messageDiv.textContent = message;
            messageDiv.className = 'success';
            form.reset(); // Reseta o formulário após envio bem-sucedido
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = '';
            }, 3000); // A mensagem desaparece após 3 segundos
        })
        .catch(error => {
            console.error('Erro:', error);
            messageDiv.textContent = 'Erro ao cadastrar atropelamento: ' + error.message;
            messageDiv.className = 'error';
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = '';
            }, 3000); // A mensagem desaparece após 3 segundos
        });
    });
});
