import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import './style.css';

const socket = io('http://localhost:4000');

export default function Cozinha() {
    interface EstadoInicial {
        luzOn: boolean,
        geladeiraOn: boolean,
        geladeiraTemp: number,
        alertaGeladeira: boolean,
        fogaoOn: boolean,
        fogaoPotencia: number
    }

    interface EstadoLuz {
        luzOn: boolean,
    }

    const [estadoInicial, setEstadoInicial] = useState<EstadoInicial>({
        luzOn: false,
        geladeiraOn: false,
        geladeiraTemp: 0,
        alertaGeladeira: false,
        fogaoOn: false,
        fogaoPotencia: 1
    });

    const [estadoLuz, setEstadoLuz] = useState<EstadoLuz>({
        luzOn: false
    });

    const [geladeiraOn, setGeladeiraOn] = useState<boolean>(false);
    const [geladeiraTemp, setGeladeiraTemp] = useState<number>(0);
    const [alertaGeladeira, setAlertaGeladeira] = useState<boolean>(false);
    const [fogaoOn, setFogaoOn] = useState<boolean>(false);
    const [fogaoPotencia, setFogaoPotencia] = useState<number>(1);

    // Conectar ao backend e receber o estado inicial
    useEffect(() => {
        socket.on('estadoInicialCozinha', (estadoInicial: EstadoInicial) => {
            setEstadoInicial(estadoInicial);
            setEstadoLuz({ luzOn: estadoInicial.luzOn });
            setGeladeiraOn(estadoInicial.geladeiraOn);
            setGeladeiraTemp(estadoInicial.geladeiraTemp);
            setAlertaGeladeira(estadoInicial.alertaGeladeira);
            setFogaoOn(estadoInicial.fogaoOn);
            setFogaoPotencia(estadoInicial.fogaoPotencia);
        });

        // Atualizar estados conforme os eventos do backend
        socket.on('acenderLuzCozinha', (novoEstado: EstadoLuz) => {
            setEstadoLuz(novoEstado);
        });

        socket.on('atualizarTempGeladeira', ({ geladeiraTemp, alertaGeladeira }) => {
            setGeladeiraTemp(geladeiraTemp);
            setAlertaGeladeira(alertaGeladeira);
        });

        socket.on('ligarGeladeira', (novoEstado) => {
            setGeladeiraOn(novoEstado.geladeiraOn);
        });

        socket.on('ligarFogao', (novoEstado) => {
            setFogaoOn(novoEstado.fogaoOn);
        });

        socket.on('ajustarPotenciaFogao', (novoEstado) => {
            setFogaoPotencia(novoEstado.fogaoPotencia);
        });

        return () => {
            socket.off('estadoInicialCozinha');
            socket.off('acenderLuzCozinha');
            socket.off('atualizarTempGeladeira');
            socket.off('ligarGeladeira');
            socket.off('ligarFogao');
            socket.off('ajustarPotenciaFogao');
        };
    }, []);

    // Funções para alterar o estado dos dispositivos
    const acenderLuz = () => {
        socket.emit('acenderLuzCozinha');
    }

    const ligarGeladeira = () => {
        socket.emit('ligarGeladeira');
    }

    const ajustarTempGeladeira = (event: React.ChangeEvent<HTMLInputElement>) => {
        const novaTemp = parseFloat(event.target.value);
        socket.emit('ajustarTempGeladeira', novaTemp);
    }

    const ligarFogao = () => {
        socket.emit('ligarFogao');
    }

    const ajustarPotenciaFogao = (event: React.ChangeEvent<HTMLInputElement>) => {
        const novaPotencia = parseInt(event.target.value);
        socket.emit('ajustarPotenciaFogao', novaPotencia);
    }

    return (
        <div className='cozinha'>
            {/* Controle de Luzes */}
            <div className='luz'>
                <p>Cozinha - Luz</p>
                <button onClick={acenderLuz}>
                    {estadoLuz.luzOn ? 'Desligar Luz' : 'Ligar Luz'}
                </button>
                <img src='luz.png' className={`status ${estadoLuz.luzOn ? 'on' : 'off'}`} />
            </div>
            {/* Controle da Geladeira */}
            <div className='geladeira'>
                <p>Cozinha - Geladeira</p>
                <button onClick={ligarGeladeira}>
                    {geladeiraOn ? 'Desligar Geladeira' : 'Ligar Geladeira'}
                </button>
                {geladeiraOn && (
                    <>
                        <label>Temperatura Interna: {geladeiraTemp}°C</label>
                        <input
                            type="number"
                            value={geladeiraTemp}
                            onChange={ajustarTempGeladeira}
                            min={-5}
                            max={6}
                        />
                        <img
                            src='geladeira.png'
                            className={`status ${geladeiraTemp > 5 ? 'alarme' : ''}`}
                        />
                    </>
                )}
                {alertaGeladeira && <p style={{ color: 'red' }}>Alerta: Temperatura alta!</p>}
            </div>

            {/* Controle do Fogão Elétrico */}
            <div className='fogao'>
                <p>Cozinha - Fogão Elétrico</p>
                <button onClick={ligarFogao}>
                    {fogaoOn ? 'Desligar Fogão' : 'Ligar Fogão'}
                </button>
                <label>Potência: {fogaoPotencia}</label>
                <input
                    type="number"
                    value={fogaoPotencia}
                    onChange={ajustarPotenciaFogao}
                    min={1}
                    max={5}
                    disabled={!fogaoOn}
                />
                <img src='fogao.png' className={`status ${fogaoOn ? 'on' : 'off'}`} />
            </div>
        </div>
    );
}
