const puppeteer = require ("puppeteer");


document.addEventListener("DOMContentLoaded", () => {
  function extrairDadosVariaveisFixas() {
      const variavelInicialPrimeiraTabela = "Resumo do Cálculo";
      const variavelFinalPrimeiraTabela = "Percentual";
      const variavelInicialSegundaTabela = "Descrição de Créditos ";
      const variavelFinalSegundaTabela = "Critério de Cálculo e Fundamentação Legal";
      const variavelInicialTerceiraTabela = "Líquido Devido ao Reclamante";
      const variavelFinalTerceiraTabela = "1.";
      let extrairPrimeiraTabela = false;
      let extrairSegundaTabela = false;
      let extrairTerceiraTabela = false;
      const elementosTR = document.querySelectorAll('tr');
      const dadosTabela1 = [];
      const dadosTabela2 = [];
      const dadosTabela3 = [];

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

          if (textoLinha.includes(variavelInicialSegundaTabela)) {
              extrairSegundaTabela = true;
              return;
          }

          if (textoLinha.includes(variavelFinalSegundaTabela)) {
              extrairSegundaTabela = false;
              return;
          }

          if (extrairSegundaTabela) {
              const elementosTD = elementoTR.querySelectorAll('td');
              const linhaArray = [];

              elementosTD.forEach(elementoTD => {
                  const texto = elementoTD.textContent.trim();
                  if (texto !== "" && !texto.includes("\n")) {
                      linhaArray.push(texto);
                  }
              });

              if (linhaArray.length > 0) {
                  dadosTabela2.push(linhaArray);
              }
          }

          if (textoLinha.includes(variavelInicialTerceiraTabela)) {
              extrairTerceiraTabela = true;
              return;
          }

          if (extrairTerceiraTabela) {
              if (textoLinha.includes(variavelFinalTerceiraTabela)) {
                  extrairTerceiraTabela = false;
                  return;
              }

              const elementosTD = elementoTR.querySelectorAll('td');
              const linhaArray = [];

              elementosTD.forEach(elementoTD => {
                  const texto = elementoTD.textContent.trim();
                  if (texto !== "" && !texto.includes("\n")) {
                      linhaArray.push(texto);
                  }
              });

              if (linhaArray.length > 0) {
                  dadosTabela3.push(linhaArray);
              }
          }
      });

      // Função para remover arrays duplicados da terceira tabela
      const dadosTabela3SemDuplicados = dadosTabela3.filter((array, index) => {
          const stringArray = JSON.stringify(array); // Converter array em string para comparação
          // Verificar se esta string já existe em um índice anterior
          return (
              index === dadosTabela3.findIndex((arr) => {
                  return JSON.stringify(arr) === stringArray;
              })
          );
      });

      return { dadosTabela1, dadosTabela2, dadosTabela3: dadosTabela3SemDuplicados };
  }

  function processarBancoDeDados() {
      let { dadosTabela1, dadosTabela2, dadosTabela3 } = extrairDadosVariaveisFixas();

      // Aplicar modificações na primeira tabela
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

      // Remover arrays duplicados e com \n da segunda tabela
      const dadosTabela2Limpos = dadosTabela2.filter(array => !array.some(item => item.includes("\n")));

      // Separar os dois primeiros elementos dos dois últimos em cada array da segunda tabela
      const parte1 = [];
      const parte2 = [];

      dadosTabela2Limpos.forEach(array => {
          if (array.length >= 4) {
              parte1.push(array.slice(0, 2));
              parte2.push(array.slice(2));
          }
      });

      // Exibir os dados processados até a palavra "1." na terceira tabela
      console.log("Dados Tabela 1:", dadosTabela1);
      console.log("Dados Tabela 2 - Parte 1:", parte1);
      console.log("Dados Tabela 2 - Parte 2:", parte2);
      console.log("Dados Tabela 3 (sem duplicados):", dadosTabela3);
  }

  // Chama a função para processar os dados
  processarBancoDeDados();
});
