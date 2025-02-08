import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

const App = () => {
  const [impressoras, setImpressoras] = useState<string[]>([]);
  const [impressoraSelecionada, setImpressoraSelecionada] = useState<string | null>(null);

  useEffect(() => {
    // Carregar lista de impressoras ao iniciar
    const carregarImpressoras = async () => {
      try {
        const lista = await invoke<string[]>('listar_impressoras');
        setImpressoras(lista);
      } catch (error) {
        console.error('Erro ao carregar impressoras:', error);
      }
    };

    carregarImpressoras();
  }, []);

  const enviarImpressaoTeste = async () => {
    if (!impressoraSelecionada) {
      alert('Selecione uma impressora!');
      return;
    }

    try {
      const resultado = await invoke('imprimir_pedido', { impressora: impressoraSelecionada, conteudoArquivo: await imprimir() });
      console.log('Resultado da impressão de teste:', resultado);
      alert(`Impressão enviada para ${impressoraSelecionada}! Resultado: ${resultado}`);
    } catch (error) {
      console.error('Erro ao enviar impressão de teste:', error);
      alert('Falha ao enviar impressão.');
    }
  };

  const imprimir = async () => {
    const pedido = {
      pedido_id: "12345",
      produtos: [
        { nome: "Produto A", quantidade: 2, preco: 10.0 },
        { nome: "Produto B", quantidade: 1, preco: 15.5 },
      ],
    };
  
    // Montando o conteúdo do pedido como string
    let conteudo = `Pedido ID: ${pedido.pedido_id}\n\n`;
    conteudo += "Produto\tQtd\tPreço\n";
    conteudo += "--------------------------------\n";
  
    let total = 0;
    pedido.produtos.forEach((p) => {
      const subtotal = p.quantidade * p.preco;
      total += subtotal;
      conteudo += `${p.nome}\t${p.quantidade}\tR$ ${p.preco.toFixed(2)}\n`;
    });
  
    conteudo += "--------------------------------\n";
    conteudo += `Total: R$ ${total.toFixed(2)}\n`;
    conteudo += "\n\n\n\n\n";
    conteudo += "\x1D\x56\x42"


    return conteudo;
  };

  return (
    <div style={{backgroundColor: '#f0f0f0', height: '100vh', width: '100%'}}>
      <h1>Listagem de Impressoras</h1>
      <div>
        <label htmlFor="impressoras">Selecione a impressora:</label>
        <select
          id="impressoras"
          onChange={(e) => setImpressoraSelecionada(e.target.value)}
          value={impressoraSelecionada || ''}
        >
          <option value="">Selecione uma impressora</option>
          {impressoras.map((impressora) => (
            <option key={impressora} value={impressora}>
              {impressora}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button onClick={enviarImpressaoTeste}>Imprimir Teste</button>
      </div>
    </div>
  );
};

export default App;
