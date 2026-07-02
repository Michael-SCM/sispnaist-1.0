import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { DocumentTitle } from '../../hooks/useDocumentTitle.js';
import { videoAulaService } from '../../services/videoAulaService.js';
import { quizService } from '../../services/quizService.js';
import { IVideoAula, IQuiz, IQuestao } from '../../types/index.js';
import { TextInput, Select, TextArea } from '../../components/FormFields';
import { ArrowLeft, Save, Video, PlayCircle, ClipboardCheck, Plus, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const CINCO_OPCOES = ['A', 'B', 'C', 'D', 'E'];

export const FormVideoAula: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<IVideoAula>>({
    titulo: '',
    descricao: '',
    url: '',
    thumbnail: '',
    duracao: '',
    categoria: '',
    ativo: true,
    tags: []
  });

  const [quizHabilitado, setQuizHabilitado] = useState(false);
  const [pontuacaoMinima, setPontuacaoMinima] = useState(70);
  const [tentativasPermitidas, setTentativasPermitidas] = useState(3);
  const [questoes, setQuestoes] = useState<IQuestao[]>([]);

  useEffect(() => {
    if (isEditing) {
      carregarVideo();
    }
  }, [id]);

  const carregarVideo = async () => {
    try {
      setIsLoading(true);
      const resp: any = await videoAulaService.obter(id!);
      const data: any = resp?.data ?? resp;

      if (!data) {
        toast.error('Vídeo não encontrado');
        navigate('/video-aulas');
        return;
      }

      setFormData({
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : []
      });

      const quizResp = await quizService.obterPorVideo(id!).catch(() => null);
      if (quizResp) {
        setQuizHabilitado(true);
        setPontuacaoMinima(quizResp.pontuacaoMinima);
        setTentativasPermitidas(quizResp.tentativasPermitidas);
        setQuestoes(quizResp.questoes || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do vídeo');
      console.error(error);
      navigate('/video-aulas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(t => t.trim()).filter(t => t);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const adicionarQuestao = () => {
    if (questoes.length >= 50) {
      toast.error('Máximo de 50 perguntas');
      return;
    }
    const nova: IQuestao = {
      pergunta: '',
      opcoes: ['', '', '', '', ''],
      opcaoCorreta: 0,
      ordem: questoes.length
    };
    setQuestoes(prev => [...prev, nova]);
  };

  const removerQuestao = (index: number) => {
    if (questoes.length <= 10) {
      toast.error('Mínimo de 10 perguntas obrigatórias');
      return;
    }
    setQuestoes(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarPergunta = (index: number, valor: string) => {
    setQuestoes(prev => prev.map((q, i) => i === index ? { ...q, pergunta: valor } : q));
  };

  const atualizarOpcao = (qIndex: number, oIndex: number, valor: string) => {
    setQuestoes(prev => prev.map((q, i) =>
      i === qIndex
        ? { ...q, opcoes: q.opcoes.map((o, j) => j === oIndex ? valor : o) }
        : q
    ));
  };

  const atualizarCorreta = (qIndex: number, oIndex: number) => {
    setQuestoes(prev => prev.map((q, i) => i === qIndex ? { ...q, opcaoCorreta: oIndex } : q));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.url) {
      toast.error('Preencha os campos obrigatórios (Título e URL)');
      return;
    }

    if (quizHabilitado) {
      const invalidas = questoes.filter(q => !q.pergunta.trim() || q.opcoes.some(o => !o.trim()));
      if (invalidas.length > 0) {
        toast.error('Preencha todas as perguntas e opções do quiz');
        return;
      }
      if (questoes.length < 10) {
        toast.error(`Mínimo de 10 perguntas para a prova. Atual: ${questoes.length}`);
        return;
      }
    }

    try {
      setIsLoading(true);

      const videoData = { ...formData };
      let videoSalvo: any;

      if (isEditing) {
        await videoAulaService.atualizar(id!, videoData);
        videoSalvo = { _id: id };
        toast.success('Vídeo atualizado com sucesso!');
      } else {
        const resp = await videoAulaService.criar(videoData) as any;
        videoSalvo = resp;
        toast.success('Vídeo cadastrado com sucesso!');
      }

      const videoId = videoSalvo?._id || id;

      if (quizHabilitado && videoId) {
        await quizService.salvar(videoId, {
          titulo: `Quiz: ${formData.titulo}`,
          videoAulaId: videoId,
          questoes,
          pontuacaoMinima,
          tentativasPermitidas,
          ativo: true
        });
      }

      navigate('/video-aulas');
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar' : 'Erro ao cadastrar');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalLetras = CINCO_OPCOES.length;

  return (
    <MainLayout>
      <DocumentTitle title={isEditing ? 'Editar Vídeo Aula' : 'Nova Vídeo Aula'} />
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/video-aulas')}
              className="p-3 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-sm border border-slate-100"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {isEditing ? 'Editar Vídeo Aula' : 'Nova Vídeo Aula'}
              </h1>
              <p className="text-slate-500 font-medium">Preencha as informações do material de capacitação</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-3 text-lg font-bold text-slate-800 pb-4 border-b border-slate-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Video size={20} />
                </div>
                Informações Principais
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  label="Título do Vídeo"
                  name="titulo"
                  value={formData.titulo || ''}
                  onChange={handleChange}
                  placeholder="Ex: Treinamento de EPI"
                  required
                />
                <Select
                  label="Categoria"
                  name="categoria"
                  value={formData.categoria || ''}
                  onChange={handleChange}
                  options={[
                    { value: 'sst', label: 'Saúde e Segurança do Trabalho (SST)' },
                    { value: 'integracao', label: 'Integração de Novos Funcionários' },
                    { value: 'seguranca', label: 'Segurança da Informação' },
                    { value: 'saude', label: 'Saúde Ocupacional' },
                    { value: 'outros', label: 'Outros' }
                  ]}
                />
                <div className="md:col-span-2">
                  <TextArea
                    label="Descrição"
                    name="descricao"
                    value={formData.descricao || ''}
                    onChange={handleChange}
                    placeholder="Descreva brevemente o conteúdo deste vídeo"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-lg font-bold text-slate-800 pb-4 border-b border-slate-100 mt-8">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <PlayCircle size={20} />
                </div>
                Mídia e Configurações
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <TextInput
                    label="URL do Vídeo (YouTube, Vimeo, etc)"
                    name="url"
                    value={formData.url || ''}
                    onChange={handleChange}
                    placeholder="Ex: https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <TextInput
                    label="URL da Capa (Thumbnail)"
                    name="thumbnail"
                    value={formData.thumbnail || ''}
                    onChange={handleChange}
                    placeholder="Link para a imagem de capa (opcional)"
                  />
                </div>

                <TextInput
                  label="Duração"
                  name="duracao"
                  value={formData.duracao || ''}
                  onChange={handleChange}
                  placeholder="Ex: 10:45"
                />

                <TextInput
                  label="Tags (separadas por vírgula)"
                  name="tags"
                  value={(formData.tags || []).join(', ')}
                  onChange={handleTagsChange}
                  placeholder="Ex: epi, segurança, nr32"
                />

                <div className="flex items-center gap-3 mt-4 md:col-span-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                  />
                  <label htmlFor="ativo" className="font-bold text-slate-700 cursor-pointer">
                    Vídeo Ativo (Visível para os usuários)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz / Prova Section */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Prova de Conhecimento</h2>
                    <p className="text-sm text-slate-500">Crie perguntas para avaliar o aprendizado após o vídeo</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quizHabilitado}
                    onChange={(e) => setQuizHabilitado(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ms-3 text-sm font-bold text-slate-600">{quizHabilitado ? 'Ativo' : 'Inativo'}</span>
                </label>
              </div>

              {quizHabilitado && (
                <div className="space-y-6">
                  {/* Config */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Pontuação Mínima (%)</label>
                      <input
                        type="number"
                        value={pontuacaoMinima}
                        onChange={(e) => setPontuacaoMinima(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Tentativas Permitidas</label>
                      <input
                        type="number"
                        value={tentativasPermitidas}
                        onChange={(e) => setTentativasPermitidas(Math.max(1, Number(e.target.value)))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                        min={1}
                        max={10}
                      />
                    </div>
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between bg-amber-50 rounded-2xl px-5 py-4 border border-amber-100">
                    <div>
                      <p className="font-bold text-amber-900">
                        Perguntas ({questoes.length}{questoes.length >= 10 ? ' ✓' : ''})
                      </p>
                      <p className="text-sm text-amber-700">
                        {questoes.length < 10
                          ? `Mínimo de 10 perguntas obrigatórias (faltam ${10 - questoes.length})`
                          : 'Mínimo atingido. O sistema sorteará 10 perguntas aleatoriamente na prova.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={adicionarQuestao}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-amber-700 font-bold rounded-xl hover:bg-amber-100 border border-amber-200 transition-all active:scale-95"
                    >
                      <Plus size={18} />
                      Pergunta
                    </button>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-4">
                    {questoes.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <ClipboardCheck className="mx-auto h-12 w-12 text-slate-200 mb-3" />
                        <p className="font-medium">Nenhuma pergunta cadastrada</p>
                        <p className="text-sm">Clique em "Adicionar Pergunta" para começar</p>
                      </div>
                    )}

                    {questoes.map((questao, qIndex) => (
                      <div key={qIndex} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-black text-sm shrink-0">
                              {qIndex + 1}
                            </span>
                            <textarea
                              value={questao.pergunta}
                              onChange={(e) => atualizarPergunta(qIndex, e.target.value)}
                              placeholder="Digite a pergunta..."
                              rows={2}
                              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium resize-none text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removerQuestao(qIndex)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                            title="Remover pergunta"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* 5 Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {CINCO_OPCOES.map((letra, oIndex) => (
                            <label
                              key={oIndex}
                              className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                                questao.opcaoCorreta === oIndex
                                  ? 'border-emerald-400 bg-emerald-50'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correta-${qIndex}`}
                                checked={questao.opcaoCorreta === oIndex}
                                onChange={() => atualizarCorreta(qIndex, oIndex)}
                                className="sr-only"
                              />
                              <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold shrink-0 ${
                                questao.opcaoCorreta === oIndex
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {letra}
                              </span>
                              <input
                                type="text"
                                value={questao.opcoes[oIndex] || ''}
                                onChange={(e) => atualizarOpcao(qIndex, oIndex, e.target.value)}
                                placeholder={`Opção ${letra}`}
                                className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                              />
                              {questao.opcaoCorreta === oIndex && (
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider shrink-0">Correta</span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/video-aulas')}
              className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-200/50 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              <Save size={20} />
              {isEditing ? 'Atualizar Vídeo' : 'Salvar Vídeo'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default FormVideoAula;
