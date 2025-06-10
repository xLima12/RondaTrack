"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import dynamic from "next/dynamic";

type Location = { lat: number; lng: number };

const Map = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

interface LocationLog {
  id: number;
  dateTime: string;
  latitude: number;
  longitude: number;
  deviceCode: string;
}

interface Device {
  code: string;
  name: string;
}

export default function Dashboard() {
  const auth = useAuth();
  
  if (!auth) return <div>Carregando...</div>;
  
  const { token, logout } = auth;
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationLogs, setLocationLogs] = useState<LocationLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LocationLog[]>([]);
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para o modal de adicionar dispositivo
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newDevice, setNewDevice] = useState({
    code: "",
    name: "",
    email: ""
  });

  // Fetch devices
  const fetchDevices = async () => {
    if (!token) return;
    
    try {
      const res = await axios.get("http://localhost:8080/api/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data);
    } catch (error) {
      console.error("Erro ao buscar dispositivos:", error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [token]);

  // Fetch location and logs for selected device
  useEffect(() => {
    if (!selected || !token) return;
    
    setIsLoading(true);
    
    const fetchLocation = () => {
      axios.get(`http://localhost:8080/api/location-logs/${selected}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        const logs = res.data;
            
        setLocationLogs(logs);
        
        const latest = logs.at(-1);
        if (latest) {
          setLocation({ lat: latest.latitude, lng: latest.longitude });
        }
        setIsLoading(false);
      });
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 30000);
    return () => clearInterval(interval);
  }, [selected, token]);

  useEffect(() => {
    if (!dateFilter) {
      setFilteredLogs(locationLogs);
      return;
    }

    console.log('🔍 DEBUG FILTRO:');
    console.log('dateFilter selecionado:', dateFilter);
    console.log('locationLogs completos:', locationLogs);
    
    if (locationLogs.length > 0) {
      console.log('Estrutura do primeiro log:', Object.keys(locationLogs[0]));
      console.log('Primeiro log completo:', locationLogs[0]);
    }

    const filtered = locationLogs.filter(log => {
      try {
        if (!log || !log.dateTime) {
          console.warn('Log sem dateTime:', log);
          return false;
        }

        const logDate = log.dateTime.split('T')[0]; // Pega apenas a parte da data
        
        console.log('Log individual:', {
          id: log.id,
          dateTime_original: log.dateTime,
          date_extraida: logDate,
          dateFilter: dateFilter,
          match: logDate === dateFilter
        });
        
        return logDate === dateFilter;
      } catch (error) {
        console.error('Erro ao filtrar log:', log, error);
        return false;
      }
    });
    
    console.log('Logs filtrados resultado:', filtered);
    setFilteredLogs(filtered);
  }, [locationLogs, dateFilter]);

  // Função para adicionar novo dispositivo
  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDevice.code.trim() || !newDevice.name.trim() || !newDevice.email.trim()) {
      alert("Todos os campos são obrigatórios");
      return;
    }

    setIsCreating(true);

    try {
      await axios.post("http://localhost:8080/api/devices", {
        code: newDevice.code.trim(),
        name: newDevice.name.trim(),
        email: newDevice.email.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Limpar formulário
      setNewDevice({ code: "", name: "", email: "" });
      setShowAddModal(false);
      
      // Recarregar lista de dispositivos
      await fetchDevices();
      
      alert("Dispositivo criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar dispositivo:", error);
      alert("Erro ao criar dispositivo. Tente novamente.");
    } finally {
      setIsCreating(false);
    }
  };

  const formatDateTime = (dateTime: string | undefined) => {
    try {
      if (!dateTime || typeof dateTime !== 'string') {
        console.warn('Data inválida recebida:', dateTime);
        return 'Data inválida';
      }
      
      const jsDate = new Date(dateTime);
      
      if (isNaN(jsDate.getTime())) {
        console.warn('Data não pôde ser convertida:', dateTime);
        return dateTime;
      }
      
      return jsDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', dateTime, error);
      return 'Erro na data';
    }
  };

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Monitoramento de Dispositivos</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 hover:bg-white/70 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Devices Selection */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Dispositivos Disponíveis
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Adicionar Dispositivo</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {devices.map((device) => (
              <button
                key={device.code}
                onClick={() => {
                  setSelected(device.code);
                  setDeviceName(device.name);
                }}
                className={`p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                  selected === device.code
                    ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'border-gray-200 bg-white/50 hover:bg-white/70 text-gray-700'
                }`}
              >
                <div className="text-sm font-medium">{device.name}</div>
                <div className="text-xs opacity-75">{device.code}</div>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Map Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Localização Atual - {deviceName}
              </h2>
              <div className="h-96 w-full rounded-xl overflow-hidden shadow-inner bg-gray-100">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-500">Carregando localização...</p>
                    </div>
                  </div>
                ) : location ? (
                  <Map position={location} name={`${deviceName}`} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Nenhuma localização disponível
                  </div>
                )}
              </div>
            </div>

            {/* Location Logs Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Histórico de Localizações
                </h2>
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white text-sm"
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter("")}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Limpar filtro"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {filteredLogs.length > 0 ? (
                  <div className="space-y-2">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-100 hover:bg-white/80 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {formatDateTime(log.dateTime)}
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-600 mr-1">Lat:</span>
                                {formatCoordinate(log.latitude)}
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium text-gray-600 mr-1">Lng:</span>
                                {formatCoordinate(log.longitude)}
                              </div>
                            </div>
                          </div>
                          <div className="ml-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              #{log.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <svg className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p>Nenhum registro encontrado</p>
                      {dateFilter && (
                        <p className="text-sm mt-1">para a data selecionada</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {filteredLogs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{filteredLogs.length} registro(s) encontrado(s)</span>
                    {dateFilter && (
                      <span>Filtrado para: {new Date(dateFilter).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!selected && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-12 text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecione um Dispositivo</h3>
            <p className="text-gray-600">Escolha um dispositivo acima para visualizar sua localização e histórico</p>
          </div>
        )}
      </div>

      {/* Modal para Adicionar Dispositivo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar Dispositivo
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddDevice} className="space-y-4">
                <div>
                  <label htmlFor="deviceCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Código do Dispositivo
                  </label>
                  <input
                    id="deviceCode"
                    type="text"
                    value={newDevice.code}
                    onChange={(e) => setNewDevice({ ...newDevice, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white"
                    placeholder="Ex: DEV001"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Dispositivo
                  </label>
                  <input
                    id="deviceName"
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white"
                    placeholder="Ex: Sensor de Localização 1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="deviceEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="deviceEmail"
                    type="email"
                    value={newDevice.email}
                    onChange={(e) => setNewDevice({ ...newDevice, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white"
                    placeholder="Ex: admin@empresa.com"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 hover:bg-white/70 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Criando...
                      </>
                    ) : (
                      'Criar Dispositivo'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}