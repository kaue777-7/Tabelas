document.addEventListener("DOMContentLoaded", () => {
    function extrairDadosVariaveisFixas() {
        const variavelInicialPrimeiraTabela = "Resumo do Cálculo";
        const variavelFinalPrimeiraTabela = "Percentual";

        let extrairPrimeiraTabela = false;

        const elementosTR = document.querySelectorAll('tr');
        const dadosTabela1 = [];

        elementosTR.forEach(elementoTR => {
            const textoLinha = elementoTR.textContent.trim();

            if (textoLinha.includes(variavelInicialPrimeiraTabela)) {
                extrairPrimeiraTabela = true;
                return;
            }

            if (textoLinha.includes(variavelFinalPrimeiraTabela)) {
                extrairPrimeiraTabela = false;
                return;
            }

            if (extrairPrimeiraTabela) {
                const elementosTD = elementoTR.querySelectorAll('td');
                const linhaArray = [];
                elementosTD.forEach(elementoTD => {
                    const texto = elementoTD.textContent.trim();
                    if (texto !== "") {
                        linhaArray.push(texto);
                    }
                });
                if (linhaArray.length > 0) {
                    dadosTabela1.push(linhaArray);
                }
            }
        });

        return { dadosTabela1 };
    }

    function processarBancoDeDados() {
        let { dadosTabela1 } = extrairDadosVariaveisFixas();

        // Processamento da primeira tabela
        dadosTabela1 = dadosTabela1.map((array, index) => {
            if (index >= 6 && index < dadosTabela1.length - 2) {
                return {
                    descricao: array[0],
                    valor: array[1],
                    juros: array[2],
                    total: array[3],
                };
            } else if (index >= dadosTabela1.length - 2) {
                return {
                    valor: array[0],
                    juros: array[1],
                    total: array[2],
                };
            }
            return array;
        });

        console.log("Dados Tabela 1:", dadosTabela1);
    }

    processarBancoDeDados();
});
