import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import './style.css';
import Luz from "./Luz";

const socket = io('http://localhost:4000');

export default function Sala() {
    interface EstadoInicial {
        luzOn: boolean,
        tvOn: boolean,
        arTemp: number,
        arOn: boolean,
        numeroCanal: number
    }

    interface EstadoLuz {
        luzOn: boolean,
    }

    interface EstadoTv {
        tvOn: boolean,
        numeroCanal: number
    }

    interface EstadoAr {
        arOn: boolean,
        arTemp: number
    }

    const [estadoInicial, setEstadoInicial] = useState<EstadoInicial>({
        luzOn: false,
        tvOn: false,
        arTemp: 24,
        arOn: false,
        numeroCanal: 1
    });

    const [estadoLuz, setEstadoLuz] = useState<EstadoLuz>({
        luzOn: false
    });

    const [estadoTv, setEstadoTv] = useState<EstadoTv>({
        tvOn: false,
        numeroCanal: 1
    });

    const [estadoAr, setEstadoAr] = useState<EstadoAr>({
        arOn: false,
        arTemp: 24
    });

    const canaisDisponiveis = ['Globo', 'SBT', 'Record', 'RedeTv', 'Tv Cultura']; 

    // Conectar ao backend e receber o estado inicial
    useEffect(() => {
        socket.on('estadoInicialSala', (estadoInicial: EstadoInicial) => {
            setEstadoInicial(estadoInicial);
            setEstadoLuz({ luzOn: estadoInicial.luzOn });
            setEstadoTv({ tvOn: estadoInicial.tvOn, numeroCanal: estadoInicial.numeroCanal });
            setEstadoAr({ arOn: estadoInicial.arOn, arTemp: estadoInicial.arTemp });
        });

        socket.on('acenderLuzSala', (novoEstado: EstadoLuz) => {
            setEstadoLuz(novoEstado);
        });

        socket.on('ligarTvSala', (novoEstado: EstadoTv) => {
            setEstadoTv({ ...estadoTv, tvOn: novoEstado.tvOn });
        });

        socket.on('atualizarCanalSala', (novoEstado: EstadoTv) => {
            setEstadoTv({ ...estadoTv, numeroCanal: novoEstado.numeroCanal });
        });

        socket.on('ligarArSala', (novoEstado: EstadoAr) => {
            setEstadoAr({ ...estadoAr, arOn: novoEstado.arOn });
        });

        socket.on('atualizarTemperaturaArSala', (novoEstado: EstadoAr) => {
            setEstadoAr({ ...estadoAr, arTemp: novoEstado.arTemp });
        });

        return () => {
            socket.off('estadoInicialSala');
            socket.off('acenderLuzSala');
            socket.off('ligarTvSala');
            socket.off('atualizarCanalSala');
            socket.off('ligarArSala');
            socket.off('atualizarTemperaturaArSala');
        };
    }, [estadoTv, estadoAr]);

    // Funções para alterar o estado dos dispositivos
    const acenderLuz = () => {
        socket.emit('acenderLuzSala');
    }

    const ligarTv = () => {
        socket.emit('ligarTvSala');
    }

    const mudarCanal = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const novoCanal = event.target.value;
        socket.emit('mudarCanalSala', novoCanal);
    }

    const ligarAr = () => {
        socket.emit('ligarArSala');
    }

    const ajustarTemperatura = (event: React.ChangeEvent<HTMLInputElement>) => {
        const novaTemp = parseInt(event.target.value);
        socket.emit('ajustarTemperaturaArSala', novaTemp);
    }

    return (
        <div className='sala'>
            <Luz />
            <div className='tv'>
                <p>Sala de Estar - TV</p>
                <button onClick={ligarTv}>
                    {estadoTv.tvOn ? 'Desligar TV' : 'Ligar TV'}
                </button>
                <label>Canal:</label>
                <select
                    value={estadoTv.numeroCanal}
                    onChange={mudarCanal}
                    disabled={!estadoTv.tvOn}
                    >
                    {canaisDisponiveis.map(canal => (
                        <option key={canal} value={canal}>
                        {canal}
                        </option>
                    ))}
                </select>
                <img src='tv.png' className={`status ${estadoTv.tvOn ? 'on' : 'off'}`} />
            </div>
            <div className='ar'>
                <p>Sala de Estar - AR Condicionado</p>
                <button onClick={ligarAr}>
                    {estadoAr.arOn ? 'Desligar Ar' : 'Ligar Ar'}
                </button>
                <label>Temperatura:</label>
                <input
                    type="number"
                    value={estadoAr.arTemp}
                    onChange={ajustarTemperatura}
                    disabled={!estadoAr.arOn}
                    min={18}
                    max={30}
                />
                <img src='ar.png' className={`status ${estadoAr.arOn ? 'on' : 'off'}`} />
            </div>
        </div>
    );
}
