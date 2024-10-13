import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import './style.css';

const socket = io('http://localhost:4000');

export default function Quarto() {
    interface EstadoInicial {
        luzOn: boolean,
        ventiladorOn: boolean,
        ventiladorVelocidade: number,
        portaAberta: boolean
    }

    interface EstadoLuz {
        luzOn: boolean,
    }

    const [estadoInicial, setEstadoInicial] = useState<EstadoInicial>({
        luzOn: false,
        ventiladorOn: false,
        ventiladorVelocidade: 1,
        portaAberta: false
    });

    const [estadoLuz, setEstadoLuz] = useState<EstadoLuz>({
        luzOn: false
    });

    const [ventiladorOn, setVentiladorOn] = useState<boolean>(false);
    const [ventiladorVelocidade, setVentiladorVelocidade] = useState<number>(1);
    const [portaAberta, setPortaAberta] = useState<boolean>(false);

    // Conectar ao backend e receber o estado inicial
    useEffect(() => {
        socket.on('estadoInicialQuarto', (estadoInicial: EstadoInicial) => {
            setEstadoInicial(estadoInicial);
            setEstadoLuz({ luzOn: estadoInicial.luzOn });
            setVentiladorOn(estadoInicial.ventiladorOn);
            setVentiladorVelocidade(estadoInicial.ventiladorVelocidade);
            setPortaAberta(estadoInicial.portaAberta);
        });

        // Atualizar estados conforme os eventos do backend
        socket.on('acenderLuzQuarto', (novoEstado: EstadoLuz) => {
            setEstadoLuz(novoEstado);
        });

        socket.on('ligarVentiladorQuarto', (novoEstado) => {
            setVentiladorOn(novoEstado.ventiladorOn);
        });

        socket.on('ajustarVelocidadeVentiladorQuarto', (novoEstado) => {
            setVentiladorVelocidade(novoEstado.ventiladorVelocidade);
        });

        socket.on('abrirFecharPortaQuarto', (novoEstado) => {
            setPortaAberta(novoEstado.portaAberta);
        });

        return () => {
            socket.off('estadoInicialQuarto');
            socket.off('acenderLuzQuarto');
            socket.off('ligarVentiladorQuarto');
            socket.off('ajustarVelocidadeVentiladorQuarto');
            socket.off('abrirFecharPortaQuarto');
        };
    }, []);

    // Funções para alterar o estado dos dispositivos
    const acenderLuz = () => {
        socket.emit('acenderLuzQuarto');
    }

    const ligarVentilador = () => {
        socket.emit('ligarVentiladorQuarto');
    }

    const ajustarVelocidadeVentilador = (event: React.ChangeEvent<HTMLInputElement>) => {
        const novaVelocidade = parseInt(event.target.value);
        socket.emit('ajustarVelocidadeVentiladorQuarto', novaVelocidade);
    }

    const abrirFecharPorta = () => {
        socket.emit('abrirFecharPortaQuarto');
    }

    return (
        <div className='quarto'>
            {/* Controle de Luzes */}
            <div className='luz'>
                <p>Quarto - Luz</p>
                <button onClick={acenderLuz}>
                    {estadoLuz.luzOn ? 'Desligar Luz' : 'Ligar Luz'}
                </button>
                <img src='luz.png' className={`status ${estadoLuz.luzOn ? 'on' : 'off'}`} />
            </div>

            {/* Controle do Ventilador */}
            <div className='ventilador'>
                <p>Quarto - Ventilador</p>
                <button onClick={ligarVentilador}>
                    {ventiladorOn ? 'Desligar Ventilador' : 'Ligar Ventilador'}
                </button>
                <label>Velocidade: {ventiladorVelocidade}</label>
                <input
                    type="number"
                    value={ventiladorVelocidade}
                    onChange={ajustarVelocidadeVentilador}
                    min={1}
                    max={3}
                    disabled={!ventiladorOn}
                />
                <img src='ventilador.png' className={`status ${ventiladorOn ? 'on' : 'off'}`} />
            </div>

            {/* Controle da Porta */}
            <div className='porta'>
                <p>Quarto - Porta Automática</p>
                <button onClick={abrirFecharPorta}>
                    {portaAberta ? 'Fechar Porta' : 'Abrir Porta'}
                </button>
                <img src={portaAberta ? 'porta-aberta.png' : 'porta-fechada.png'} className={`status ${portaAberta ? 'aberto' : 'fechado'}`} />
            </div>
        </div>
    );
}
