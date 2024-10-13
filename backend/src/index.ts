import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

// Criar Servidor HTTP
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // URL do front-End React
    methods: ["GET", "POST"],
  },
});

let dispositivosCozinha = {
    luzOn: false,
    geladeiraOn: false,
    geladeiraTemp: 0,
    alertaGeladeira: false,
    fogaoOn: false,
    fogaoPotencia: 1,
  };

let dispositivosSala = {
    luzOn: false,
    tvOn: false,
    arOn: false,
    arTemp: 24,
    numeroCanal: 'Globo', 
  };

const canaisDisponiveis = ['Globo', 'SBT', 'Record', 'RedeTv', 'Tv Cultura'];

let dispositivosQuarto = {
    luzOn: false,
    ventiladorOn: false,
    ventiladorVelocidade: 1,
    portaAberta: false,
};



// Quando um cliente se conecta
io.on('connection', (socket) => {
  console.log('Cliente conectado', socket.id);

  // Enviar o estado inicial dos dispositivos para o cliente
  socket.emit('estadoInicialCozinha', dispositivosCozinha);
  socket.emit('estadoInicialSala', dispositivosSala);

  // --- Sala ---
  socket.on('acenderLuzSala', () => {
    dispositivosSala.luzOn = !dispositivosSala.luzOn;
    io.emit('acenderLuzSala', { luzOn: dispositivosSala.luzOn });
  });

  // Ligar/Desligar TV da sala
  socket.on('ligarTvSala', () => {
    dispositivosSala.tvOn = !dispositivosSala.tvOn; 
    io.emit('ligarTvSala', { tvOn: dispositivosSala.tvOn });
  });

  // Mudar de canal
  socket.on('mudarCanalSala', (novoCanal) => {
    if (canaisDisponiveis.includes(novoCanal)) {
      dispositivosSala.numeroCanal = novoCanal;
      io.emit('atualizarCanalSala', { numeroCanal: dispositivosSala.numeroCanal });
    }
  });

  // Ligar/Desligar o ar-condicionado
  socket.on('ligarArSala', () => {
    dispositivosSala.arOn = !dispositivosSala.arOn; 
    io.emit('ligarArSala', { arOn: dispositivosSala.arOn });
  });

  // Ajustar a temperatura do ar-condicionado
  socket.on('ajustarTemperaturaArSala', (novaTemperatura) => {
    if (novaTemperatura >= 18 && novaTemperatura <= 30) {
      dispositivosSala.arTemp = novaTemperatura;
      io.emit('atualizarTemperaturaArSala', { arTemp: dispositivosSala.arTemp });
    }
  });

  // --- Cozinha ---
  // Ligar/Desligar luzes da cozinha
  socket.on('acenderLuzCozinha', () => {
    dispositivosCozinha.luzOn = !dispositivosCozinha.luzOn;
    io.emit('acenderLuzCozinha', { luzOn: dispositivosCozinha.luzOn });
  });

  // Ligar/Desligar geladeira
  socket.on('ligarGeladeira', () => {
    dispositivosCozinha.geladeiraOn = !dispositivosCozinha.geladeiraOn;
    io.emit('ligarGeladeira', { geladeiraOn: dispositivosCozinha.geladeiraOn });
  });

  // Ajustar temperatura da geladeira
  socket.on('ajustarTempGeladeira', (novaTemp) => {
    if (novaTemp >= -5 && novaTemp <= 6) {
      dispositivosCozinha.geladeiraTemp = novaTemp;
      dispositivosCozinha.alertaGeladeira = novaTemp > 5;
      io.emit('atualizarTempGeladeira', {
        geladeiraTemp: dispositivosCozinha.geladeiraTemp,
        alertaGeladeira: dispositivosCozinha.alertaGeladeira,
      });
    }
  });

  // Ligar/Desligar fogão
  socket.on('ligarFogao', () => {
    dispositivosCozinha.fogaoOn = !dispositivosCozinha.fogaoOn;
    io.emit('ligarFogao', { fogaoOn: dispositivosCozinha.fogaoOn });
  });

  // Ajustar potência do fogão
  socket.on('ajustarPotenciaFogao', (novaPotencia) => {
    if (novaPotencia >= 1 && novaPotencia <= 5) {
      dispositivosCozinha.fogaoPotencia = novaPotencia;
      io.emit('ajustarPotenciaFogao', { fogaoPotencia: dispositivosCozinha.fogaoPotencia });
    }
  });

  // --- Quarto ---

  // Ligar/Desligar luzes do quarto
  socket.on('acenderLuzQuarto', () => {
    dispositivosQuarto.luzOn = !dispositivosQuarto.luzOn;
    io.emit('acenderLuzQuarto', { luzOn: dispositivosQuarto.luzOn });
  });

  // Ligar/Desligar ventilador
  socket.on('ligarVentiladorQuarto', () => {
    dispositivosQuarto.ventiladorOn = !dispositivosQuarto.ventiladorOn;
    io.emit('ligarVentiladorQuarto', { ventiladorOn: dispositivosQuarto.ventiladorOn });
  });

  // Ajustar velocidade do ventilador
  socket.on('ajustarVelocidadeVentiladorQuarto', (novaVelocidade) => {
    if (novaVelocidade >= 1 && novaVelocidade <= 3) {
      dispositivosQuarto.ventiladorVelocidade = novaVelocidade;
      io.emit('ajustarVelocidadeVentiladorQuarto', { ventiladorVelocidade: dispositivosQuarto.ventiladorVelocidade });
    }
  });

  // Abrir/Fechar porta
  socket.on('abrirFecharPortaQuarto', () => {
    dispositivosQuarto.portaAberta = !dispositivosQuarto.portaAberta;
    io.emit('abrirFecharPortaQuarto', { portaAberta: dispositivosQuarto.portaAberta });
  });


  // Desconexão do cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado', socket.id);
  });
});

// Iniciar Servidor
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
