import React, { useState } from 'react';
import './App.css';
import Sala from './Components/Sala';
import Cozinha from './Components/Cozinha';
import Quarto from './Components/Quarto';

const App: React.FC = () => {
  const [comodoSelecionado, setComodoSelecionado] = useState('Sala');

  const Footer: React.FC = () => {
    return (
      <footer className="footer">
        <p>© 2024 Casa Inteligente. Todos os direitos reservados.</p>
        <p>
          Desenvolvido por <a href="https://github.com/Emerson-Okopnik" target='_blank'>Emerson Okopnik</a>
        </p>
      </footer>
    );
  }

  return (
    <div className="casa">
      <nav>
        <button onClick={() => setComodoSelecionado('Sala')}>Sala</button>
        <button onClick={() => setComodoSelecionado('Cozinha')}>Cozinha</button>
        <button onClick={() => setComodoSelecionado('Quarto')}>Quarto</button>
      </nav>

      <h1>Casa Inteligente</h1>

      {comodoSelecionado === 'Sala' && <Sala />}
      {comodoSelecionado === 'Cozinha' && <Cozinha />}
      {comodoSelecionado === 'Quarto' && <Quarto />}

      <Footer />
    </div>
  );
}

export default App;
