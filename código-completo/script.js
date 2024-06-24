const puppeteer = require('puppeteer');

async function extrairDadosVariaveisFixas(page) {
    const variavelInicialPrimeiraTabela = "Resumo do Cálculo";
    const variavelFinalPrimeiraTabela = "Percentual";
    const variavelInicialSegundaTabela = "Descrição de Créditos ";
    const variavelFinalSegundaTabela = "Critério de Cálculo e Fundamentação Legal";
    const variavelInicialTerceiraTabela = "Líquido Devido ao Reclamante";
    const variavelFinalTerceiraTabela = "1.";

    let extrairPrimeiraTabela = false;
    let extrairSegundaTabela = false;
    let extrairTerceiraTabela = false;

    const dadosTabela1 = [];
    const dadosTabela2 = [];
    const dadosTabela3 = [];

    const elementosTR = await page.$$('tr');

    for (const elementoTR of elementosTR) {
        const textoLinha = await page.evaluate(el => el.textContent.trim(), elementoTR);

        if (textoLinha.includes(variavelInicialPrimeiraTabela)) {
            extrairPrimeiraTabela = true;
            continue;
        }

        if (textoLinha.includes(variavelFinalPrimeiraTabela)) {
            extrairPrimeiraTabela = false;
            continue;
        }

        if (extrairPrimeiraTabela) {
            const elementosTD = await elementoTR.$$('td');
            const linhaArray = [];

            for (const elementoTD of elementosTD) {
                const texto = await page.evaluate(el => el.textContent.trim(), elementoTD);
                if (texto !== "") {
                    linhaArray.push(texto);
                }
            }

            if (linhaArray.length > 0) {
                dadosTabela1.push(linhaArray);
            }
        }

        if (textoLinha.includes(variavelInicialSegundaTabela)) {
            extrairSegundaTabela = true;
            continue;
        }

        if (textoLinha.includes(variavelFinalSegundaTabela)) {
            extrairSegundaTabela = false;
            continue;
        }

        if (extrairSegundaTabela) {
            const elementosTD = await elementoTR.$$('td');
            const linhaArray = [];

            for (const elementoTD of elementosTD) {
                const texto = await page.evaluate(el => el.textContent.trim(), elementoTD);
                if (texto !== "" && !texto.includes("\n")) {
                    linhaArray.push(texto);
                }
            }

            if (linhaArray.length > 0) {
                dadosTabela2.push(linhaArray);
            }
        }

        if (textoLinha.includes(variavelInicialTerceiraTabela)) {
            extrairTerceiraTabela = true;
            continue;
        }

        if (extrairTerceiraTabela) {
            if (textoLinha.includes(variavelFinalTerceiraTabela)) {
                extrairTerceiraTabela = false;
                continue;
            }

            const elementosTD = await elementoTR.$$('td');
            const linhaArray = [];

            for (const elementoTD of elementosTD) {
                const texto = await page.evaluate(el => el.textContent.trim(), elementoTD);
                if (texto !== "" && !texto.includes("\n")) {
                    linhaArray.push(texto);
                }
            }

            if (linhaArray.length > 0) {
                dadosTabela3.push(linhaArray);
            }
        }
    }

    const dadosTabela3SemDuplicados = dadosTabela3.filter((array, index) => {
        const stringArray = JSON.stringify(array);
        return (
            index === dadosTabela3.findIndex((arr) => JSON.stringify(arr) === stringArray)
        );
    });

    return { dadosTabela1, dadosTabela2, dadosTabela3: dadosTabela3SemDuplicados };
}

function adicionarIndices(tabela, indices) {
    return tabela.map((linha) => {
        const objeto = {};
        indices.forEach((indice, i) => {
            objeto[indice] = linha[i] || '';
        });
        return objeto;
    });
}

async function processarBancoDeDados() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('file:///C:/Users/Envoy/Desktop/relatorio%20processo/Tabelas-JavaScript/código-completo/relatorio-processo123059.html'); // Substitua com a URL da página que deseja acessar

    await page.waitForSelector('tr'); // Espera até que os elementos <tr> estejam presentes

    const { dadosTabela1, dadosTabela2, dadosTabela3 } = await extrairDadosVariaveisFixas(page);

    const dadosTabela1Modificados = dadosTabela1.map((array, index) => {
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

    const dadosTabela2Limpos = dadosTabela2.filter(array => !array.some(item => item.includes("\n")));

    const parte1 = [];
    const parte2 = [];

    dadosTabela2Limpos.forEach(array => {
        if (array.length >= 4) {
            parte1.push(array.slice(0, 2));
            parte2.push(array.slice(2));
        }
    });

    const parte1ComIndices = adicionarIndices(parte1, ['descricao', 'valor']);
    const parte2ComIndices = adicionarIndices(parte2, ['descricao', 'valor']);
    const dadosTabela3ComIndices = adicionarIndices(dadosTabela3, ['descricao', 'valor']);

    console.log("Dados Tabela 1:", dadosTabela1Modificados);
    console.log("Dados Tabela 2 - Parte 1:", parte1ComIndices);
    console.log("Dados Tabela 2 - Parte 2:", parte2ComIndices);
    console.log("Dados Tabela 3:", dadosTabela3ComIndices);

    await browser.close();
}

processarBancoDeDados();
