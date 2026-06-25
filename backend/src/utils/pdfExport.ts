import PDFDocument from 'pdfkit';

function fmtDate(d: any): string {
  if (!d) return '-';
  const date = new Date(d);
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

function fmtCPF(cpf?: string): string {
  if (!cpf) return '-';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function addSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.5);
  doc.rect(doc.x, doc.y, 515, 22).fill('#1e3a5f');
  doc.fill('#ffffff').fontSize(11).font('Helvetica-Bold').text(`  ${title}`, doc.x + 8, doc.y - 17, { continued: false });
  doc.fill('#000000').font('Helvetica').fontSize(9);
  doc.moveDown(0.3);
}

function addRow(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.font('Helvetica-Bold').fontSize(9).text(` ${label}:`, { continued: true, width: 140 });
  doc.font('Helvetica').fontSize(9).text(` ${value || '-'}`, { width: 360 });
}

function checkPage(doc: PDFKit.PDFDocument) {
  if (doc.y > 700) {
    doc.addPage();
    addFooter(doc);
  }
}

function addFooter(doc: PDFKit.PDFDocument) {
  for (let i = 0; i <= doc.bufferedPageRange().count; i++) {
    doc.switchToPage(i);
    doc.fontSize(7).fillColor('#999999');
    doc.text(
      `SISPNAIST - Relatório de Dados Pessoais - Gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i + 1}`,
      30,
      750,
      { align: 'center', width: 535 }
    );
    doc.fillColor('#000000');
  }
  doc.switchToPage(doc.bufferedPageRange().count - 1);
}

export function generateExportPDF(data: any): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  addFooter(doc);

  const u = data.dadosCadastrais || {};
  const t = data.trabalhador || null;

  doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e3a5f').text('SISPNAIST', { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#555555').text('Relatório de Dados Pessoais (LGPD - Art. 9º)', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(8).fillColor('#888888').text(`Solicitado em: ${fmtDate(data.dataSolicitacao)}`, { align: 'center' });
  doc.moveDown(0.5);

  doc.moveTo(30, doc.y).lineTo(565, doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(0.5);

  // ─── DADOS CADASTRAIS ───
  addSectionTitle(doc, 'DADOS CADASTRAIS');
  addRow(doc, 'Nome', u.nome);
  addRow(doc, 'CPF', fmtCPF(u.cpf));
  addRow(doc, 'E-mail', u.email);
  addRow(doc, 'Data de Nascimento', fmtDate(u.dataNascimento));
  addRow(doc, 'Sexo', u.sexo || '-');
  addRow(doc, 'Telefone', u.telefone || '-');
  if (u.endereco) {
    const end = u.endereco;
    const endStr = [end.logradouro, end.numero, end.complemento, end.bairro, end.cidade, end.estado, end.cep].filter(Boolean).join(', ');
    addRow(doc, 'Endereço', endStr || '-');
  }

  if (t) {
    addRow(doc, 'Nome Social', t.nomeSocial || '-');
    addRow(doc, 'Nome da Mãe', t.nomeMae || '-');
    addRow(doc, 'Estado Civil', t.estadoCivil || '-');
    addRow(doc, 'Raça/Cor', t.racaCor || '-');
    addRow(doc, 'Escolaridade', t.escolaridade || '-');
  }

  // ─── DADOS PROFISSIONAIS ───
  checkPage(doc);
  addSectionTitle(doc, 'DADOS PROFISSIONAIS');
  addRow(doc, 'Matrícula', u.matricula || (t?.matricula) || '-');
  addRow(doc, 'Empresa', u.empresa?.nome || t?.empresa || '-');
  addRow(doc, 'Unidade', u.unidade?.nome || t?.unidade || '-');
  addRow(doc, 'Departamento', u.departamento || '-');
  addRow(doc, 'Cargo', u.cargo || (t?.cargoFuncao) || '-');
  addRow(doc, 'Data de Admissão', fmtDate(u.dataAdmissao));
  addRow(doc, 'Perfil de Acesso', u.perfil || '-');

  // ─── LGPD ───
  checkPage(doc);
  addSectionTitle(doc, 'CONSENTIMENTO LGPD');
  addRow(doc, 'Consentimento', u.consentimentoLGPD ? 'Ativo' : 'Pendente');
  addRow(doc, 'Data do Aceite', fmtDate(u.dataAceiteLGPD));
  addRow(doc, 'Versão do Termo', u.versaoTermo || '1.0');

  // ─── DEPENDENTES ───
  const deps = data.dependentes || [];
  if (deps.length > 0) {
    checkPage(doc);
    addSectionTitle(doc, `DEPENDENTES (${deps.length})`);
    for (const dep of deps) {
      doc.font('Helvetica-Bold').fontSize(9).text(`  ${dep.nome}`);
      doc.font('Helvetica').fontSize(8).text(`     CPF: ${fmtCPF(dep.cpf)}  |  Parentesco: ${dep.parentesco}  |  Nascimento: ${fmtDate(dep.dataNascimento)}`);
    }
  }

  // ─── ACIDENTES DE TRABALHO ───
  const acidentes = data.acidentes || [];
  if (acidentes.length > 0) {
    checkPage(doc);
    addSectionTitle(doc, `ACIDENTES DE TRABALHO (${acidentes.length})`);
    for (const a of acidentes) {
      doc.font('Helvetica-Bold').fontSize(9).text(`  ${fmtDate(a.dataAcidente)} - ${a.tipoAcidente || '-'}`);
      doc.font('Helvetica').fontSize(8).text(`     Tipo de Trauma: ${a.tipoTrauma || '-'}  |  Agente: ${a.agenteCausador || '-'}  |  Local: ${a.localAcidente || '-'}`);
    }
  }

  // ─── DOENÇAS OCUPACIONAIS ───
  const doencas = data.doencas || [];
  if (doencas.length > 0) {
    checkPage(doc);
    addSectionTitle(doc, `DOENÇAS OCUPACIONAIS (${doencas.length})`);
    for (const d of doencas) {
      doc.font('Helvetica-Bold').fontSize(9).text(`  ${d.nomeDoenca || '-'} (${d.codigoDoenca || '-'})`);
      doc.font('Helvetica').fontSize(8).text(`     Início: ${fmtDate(d.dataInicio)}  |  Fim: ${fmtDate(d.dataFim)}`);
    }
  }

  // ─── VACINAÇÕES ───
  const vacs = data.vacinacoes || [];
  if (vacs.length > 0) {
    checkPage(doc);
    addSectionTitle(doc, `VACINAÇÕES (${vacs.length})`);
    for (const v of vacs) {
      doc.font('Helvetica-Bold').fontSize(9).text(`  ${v.vacina || '-'}`);
      doc.font('Helvetica').fontSize(8).text(`     Data: ${fmtDate(v.dataVacinacao)}  |  Próxima Dose: ${fmtDate(v.proximoDose)}  |  Unidade: ${v.unidadeSaude || '-'}`);
    }
  }

  // ─── AFASTAMENTOS ───
  const afast = data.afastamentos || [];
  if (afast.length > 0) {
    checkPage(doc);
    addSectionTitle(doc, `AFASTAMENTOS (${afast.length})`);
    for (const a of afast) {
      doc.font('Helvetica-Bold').fontSize(9).text(`  ${a.tipoAfastamento || '-'} (${fmtDate(a.dataInicio)} a ${fmtDate(a.dataFim || a.dataRetorno)})`);
      doc.font('Helvetica').fontSize(8).text(`     Motivo: ${a.motivoAfastamento || '-'}  |  CID: ${a.cid || '-'}  |  Desfecho: ${a.desfecho || '-'}`);
    }
  }

  // ─── READEQUAÇÕES FUNCIONAIS ───
  const readaps = data.readaptacoes || [];
  if (readaps.length > 0) {
    checkPage(doc);
    addSectionTitle(doc, `READEQUAÇÕES FUNCIONAIS (${readaps.length})`);
    for (const r of readaps) {
      doc.font('Helvetica-Bold').fontSize(9).text(`  ${fmtDate(r.dataReadaptacao)} - ${r.motivo || '-'}`);
      doc.font('Helvetica').fontSize(8).text(`     Origem: ${r.setorOrigem || '-'}  →  Destino: ${r.setorReadaptacao || '-'}  |  Restrição: ${r.restricao || '-'}`);
    }
  }

  // ─── OCORRÊNCIAS DE VIOLÊNCIA ───
  const violencias = data.ocorrenciasViolencia || [];
  if (violencias.length > 0) {
    checkPage(doc);
    addSectionTitle(doc, `OCORRÊNCIAS DE VIOLÊNCIA (${violencias.length})`);
    for (const v of violencias) {
      doc.font('Helvetica-Bold').fontSize(9).text(`  ${fmtDate(v.dataOcorrencia)} - ${v.tipoViolencia || '-'}`);
      doc.font('Helvetica').fontSize(8).text(`     Local: ${v.localOcorrencia || '-'}  |  Agressor: ${v.tipoAutorViolencia || '-'}  |  Meio: ${v.meioAgressao || '-'}`);
    }
  }

  // ─── RISCOS OCUPACIONAIS ───
  const riscos = data.riscosOcupacionais || [];
  if (riscos.length > 0) {
    checkPage(doc);
    addSectionTitle(doc, `RISCOS OCUPACIONAIS (${riscos.length})`);
    for (const r of riscos) {
      doc.font('Helvetica-Bold').fontSize(9).text(`  ${r.tipoRisco || '-'} (${r.categoria || '-'})`);
      doc.font('Helvetica').fontSize(8).text(`     Presente: ${r.presente ? 'Sim' : 'Não'}  |  Intensidade: ${r.intensidade || '-'}  |  Fonte Geradora: ${r.fonteGeradora || '-'}`);
      doc.font('Helvetica').fontSize(8).text(`     EPC: ${r.epcUtilizado ? 'Sim' : 'Não'}  |  EPI: ${r.epiUtilizado ? 'Sim' : 'Não'}  |  Medidas: ${r.medidasControle || '-'}`);
    }
  }

  // ─── INFORMAÇÕES DE SAÚDE ───
  const saude = data.informacaoSaude;
  if (saude) {
    checkPage(doc);
    addSectionTitle(doc, 'INFORMAÇÕES DE SAÚDE');
    addRow(doc, 'Tipo Sanguíneo', saude.tipoSanguineo || '-');
    addRow(doc, 'Doença de Base', saude.doencaBase || '-');
    addRow(doc, 'Estado Vacinal', saude.estadoVacinal || '-');
    addRow(doc, 'Medicamentos', saude.medicamentos || '-');
    addRow(doc, 'Alergias', saude.alergias || '-');
    addRow(doc, 'Doador de Sangue', saude.doadorSangue ? 'Sim' : 'Não');
    addRow(doc, 'Doador de Órgãos', saude.doadorOrgaos ? 'Sim' : 'Não');
  }

  // ─── VÍNCULOS TRABALHISTAS ───
  const vinculos = data.vinculos || [];
  if (vinculos.length > 0) {
    checkPage(doc);
    addSectionTitle(doc, `VÍNCULOS TRABALHISTAS (${vinculos.length})`);
    for (const v of vinculos) {
      doc.font('Helvetica-Bold').fontSize(9).text(`  ${v.empresa || '-'}`);
      doc.font('Helvetica').fontSize(8).text(`     Cargo: ${v.cargo || '-'}  |  Função: ${v.funcao || '-'}  |  Setor: ${v.setor || '-'}  |  Período: ${fmtDate(v.dataInicio)} a ${fmtDate(v.dataFim) || 'atual'}`);
    }
  }

  // ─── HISTÓRICO PPP ───
  const ppps = data.historicosPPP || [];
  if (ppps.length > 0) {
    checkPage(doc);
    addSectionTitle(doc, `HISTÓRICO PPP (${ppps.length})`);
    for (const p of ppps) {
      doc.font('Helvetica-Bold').fontSize(9).text(`  ${p.empresa || '-'} - ${p.cargo || '-'}`);
      doc.font('Helvetica').fontSize(8).text(`     Período: ${fmtDate(p.dataInicio)} a ${fmtDate(p.dataFim) || 'atual'}  |  Setor: ${p.setor || '-'}`);
    }
  }

  // ─── FINAL ───
  checkPage(doc);
  doc.moveDown(1);
  doc.moveTo(30, doc.y).lineTo(565, doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(0.5);
  doc.fontSize(8).fillColor('#888888').text('Este relatório foi gerado automaticamente com base nos dados registrados no sistema SISPNAIST, em atendimento ao direito de portabilidade previsto no Art. 18 da Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).', { align: 'center', width: 535 });
  doc.fillColor('#000000');

  doc.end();
  return doc;
}
