import React, { useState, useEffect } from 'react';
import './GoalTracker.css';

export default function GoalTracker() {
  const [metaTotal, setMetaTotal] = useState(() => {
    return localStorage.getItem('metaTotal_react') || '';
  });
  const [valorObtido, setValorObtido] = useState('');
  const [progressoAcumulado, setProgressoAcumulado] = useState(() => {
    return Number(localStorage.getItem('progresso_react')) || 0;
  });
  const [historico, setHistorico] = useState(() => {
    const salvo = localStorage.getItem('historico_react');
    return salvo ? JSON.parse(salvo) : [];
  });
  
  // Estado para controlar o modo: 'somar' ou 'alterar'
  const [modo, setModo] = useState('somar');

  useEffect(() => {
    localStorage.setItem('metaTotal_react', metaTotal);
    localStorage.setItem('progresso_react', progressoAcumulado);
    localStorage.setItem('historico_react', JSON.stringify(historico));
  }, [metaTotal, progressoAcumulado, historico]);

  const executarAcao = () => {
    const meta = parseFloat(metaTotal);
    const valorInput = parseFloat(valorObtido);

    if (isNaN(meta) || meta <= 0) {
      alert("Por favor, defina uma Meta Total válida antes de continuar.");
      return;
    }
    if (isNaN(valorInput) || valorInput < 0) {
      alert("Por favor, insira um valor válido.");
      return;
    }

    let novoProgresso = progressoAcumulado;
    let diferenca = 0;

    if (modo === 'somar') {
      diferenca = valorInput;
      novoProgresso += valorInput;
    } else {
      // Modo Alterar: Define o valor absoluto digitado (limitado ao teto da meta)
      let valorAjustado = valorInput;
      if (valorAjustado > meta) {
        valorAjustado = meta;
      }
      diferenca = valorAjustado - progressoAcumulado;
      novoProgresso = valorAjustado;
    }

    // Garante que o progresso não ultrapasse a meta total
    if (novoProgresso > meta) {
      novoProgresso = meta;
    }

    // Se o valor alterado for idêntico ao progresso atual, ignora o log
    if (modo === 'alterar' && diferenca === 0) {
      setValorObtido('');
      return;
    }

    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR');
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const timestamp = `${dataFormatada} às ${horaFormatada}`;

    setProgressoAcumulado(novoProgresso);
    
    // Salva a diferença calculada no histórico para mostrar o ganho/perda real
    setHistorico([{ valor: diferenca, dataHora: timestamp, ehAlteracao: modo === 'alterar' }, ...historico]);
    setValorObtido('');
  };

  const reiniciarMeta = () => {
    if (window.confirm("Tem certeza que deseja resetar a meta e apagar todo o histórico?")) {
      setProgressoAcumulado(0);
      setHistorico([]);
      setMetaTotal('');
      setValorObtido('');
      setModo('somar');
      localStorage.removeItem('metaTotal_react');
      localStorage.removeItem('progresso_react');
      localStorage.removeItem('historico_react');
    }
  };

  const metaNum = parseFloat(metaTotal) || 0;
  const porcentagem = metaNum > 0 ? (progressoAcumulado / metaNum) * 100 : 0;
  const tomCor = (porcentagem / 100) * 120;

  return (
    <div className="container-meta">
      <h2>Minha Meta 🎯</h2>
      
      {/* Botão de Alternância de Modo */}
      <div className="toggle-mode-container">
        <button 
          onClick={() => { setModo(modo === 'somar' ? 'alterar' : 'somar'); setValorObtido(''); }} 
          className="btn-toggle-mode"
        >
          Modo Ativo: <strong>{modo === 'somar' ? '➕ SOMAR' : '✏️ ALTERAR'}</strong>
        </button>
      </div>

      <div className="input-group-meta">
        <label htmlFor="metaTotal">Meta Total:</label>
        <input 
          type="number" 
          id="metaTotal" 
          placeholder="Ex: 1000" 
          min="1"
          value={metaTotal}
          onChange={(e) => setMetaTotal(e.target.value)}
        />
      </div>
      
      <div className="input-group-meta">
        <label htmlFor="valorObtido">
          {modo === 'somar' ? 'Valor Obtido (a somar):' : 'Alterar Progresso Atual Para:'}
        </label>
        <input 
          type="number" 
          id="valorObtido" 
          placeholder={modo === 'somar' ? "Ex: 150" : "Ex: 100"} 
          min="0"
          value={valorObtido}
          onChange={(e) => setValorObtido(e.target.value)}
        />
      </div>
      
      <div className="button-group-meta">
        <button onClick={executarAcao} className={modo === 'somar' ? "btn-somar" : "btn-alterar"}>
          {modo === 'somar' ? 'Somar Valor' : 'Alterar Progresso'}
        </button>
        <button onClick={reiniciarMeta} className="btn-resetar">Resetar</button>
      </div>

      <div className="progress-container-meta">
        <div 
          className="progress-bar-meta"
          style={{ 
            width: `${porcentagem}%`, 
            backgroundColor: `hsl(${tomCor}, 100%, 45%)` 
          }}
        ></div>
      </div>
      
      <div className="status-text-meta">
        Progresso: {progressoAcumulado.toFixed(2)} / {metaNum.toFixed(2)} ({porcentagem.toFixed(1)}%)
      </div>

      <div className="history-section-meta">
        <h3>Histórico de Lançamentos</h3>
        <div className="history-list-meta">
          {historico.length === 0 ? (
            <div className="empty-history-meta">Nenhum lançamento efetuado.</div>
          ) : (
            historico.map((item, index) => {
              const ehPositivo = item.valor >= 0;
              const sinal = ehPositivo ? '+ ' : '- ';
              const valorAbsoluto = Math.abs(item.valor).toFixed(2);
              
              return (
                <div 
                  key={index} 
                  className={`history-item-meta ${ehPositivo ? 'border-positive' : 'border-negative'}`}
                >
                  <span className={`history-value-meta ${ehPositivo ? 'text-positive' : 'text-negative'}`}>
                    {sinal}R$ {valorAbsoluto} {item.ehAlteracao && <small className="tag-ajuste">(Ajuste)</small>}
                  </span>
                  <span className="history-date-meta">{item.dataHora}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}