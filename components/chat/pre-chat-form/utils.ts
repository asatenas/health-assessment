import type { FormConfiguration } from '@/lib/types/clinic-config';

export function formatPacienteInfo(paciente: any) {
  const {
    idade,
    peso,
    altura,
    nomeCirurgia,
    dataCirurgia,
    horaCirurgia,
    problemasSaude,
    alergiaLatex,
    alergias,
    marcaPasso,
    cdi,
    bombaMedicamentos,
    dispositivosOutros,
    itensUso,
    itensUsoOutros,
    drogasRecreativas,
    drogasRecreativasOutros,
    exames,
  } = paciente;

  const formatBool = (value: boolean) => (value ? 'Sim' : 'Não');
  const sections: string[] = [];

  // Basic Info
  const basicInfoParts: string[] = [];
  if (idade !== undefined) basicInfoParts.push(`Idade: ${idade || '—'} anos`);
  if (peso !== undefined) basicInfoParts.push(`Peso: ${peso || '—'} kg`);
  if (altura !== undefined) basicInfoParts.push(`Altura: ${altura || '—'} m`);
  if (basicInfoParts.length > 0) {
    sections.push(basicInfoParts.join(' | '));
  }

  // Surgery Info
  const surgeryInfoParts: string[] = [];
  if (nomeCirurgia !== undefined && nomeCirurgia)
    surgeryInfoParts.push(`Cirurgia: ${nomeCirurgia}`);
  if (dataCirurgia !== undefined && dataCirurgia)
    surgeryInfoParts.push(`Data: ${dataCirurgia}`);
  if (horaCirurgia !== undefined && horaCirurgia)
    surgeryInfoParts.push(`Hora: ${horaCirurgia}`);
  if (surgeryInfoParts.length > 0) {
    sections.push(surgeryInfoParts.join(' | '));
  }

  // Health Problems
  if (problemasSaude) {
    const problemasSaudeLabels: any = {
      cardiologicos: 'Problemas no coração',
      respiratorios: 'Problemas respiratórios',
      renais: 'Problemas renais',
      figado: 'Problemas no fígado',
      vasculares: 'Problemas vasculares',
      ortopedicos: 'Problemas ortopédicos',
      digestivos: 'Problemas digestivos',
    };

    const problemasSaudeParts = Object.entries(problemasSaude)
      .filter(([, value]) => value !== undefined)
      .map(
        ([key, value]) =>
          `• ${problemasSaudeLabels[key]}: ${formatBool(value as boolean)}`,
      );

    if (problemasSaudeParts.length > 0) {
      sections.push(`Problemas de saúde: ${problemasSaudeParts.join(' | ')}`);
    }
  }

  // Allergies
  const alergiasTexts: string[] = [];
  if (alergiaLatex !== undefined) {
    alergiasTexts.push(`Alergia a látex: ${formatBool(alergiaLatex)}`);
  }
  if (alergias !== undefined && alergias) {
    alergiasTexts.push(`Outras: ${alergias}`);
  }
  if (alergiasTexts.length > 0) {
    sections.push(`Alergias: ${alergiasTexts.join(' | ')}`);
  }

  // Medical Devices
  const dispositivos: string[] = [];
  let firstDevice = true;
  if (marcaPasso !== undefined) {
    dispositivos.push(
      `${firstDevice ? 'Dispositivos: ' : ''}Marca-passo: ${formatBool(marcaPasso)}`,
    );
    firstDevice = false;
  }
  if (cdi !== undefined) {
    dispositivos.push(`CDI: ${formatBool(cdi)}`);
    firstDevice = false;
  }
  if (bombaMedicamentos !== undefined) {
    dispositivos.push(
      `Bomba de medicamentos: ${formatBool(bombaMedicamentos)}`,
    );
    firstDevice = false;
  }
  if (dispositivosOutros !== undefined && dispositivosOutros) {
    dispositivos.push(`Outros: ${dispositivosOutros}`);
  }
  if (dispositivos.length > 0) {
    if (firstDevice) {
      dispositivos[0] = `Dispositivos: ${dispositivos[0]}`;
    }
    sections.push(dispositivos.join(' | '));
  }

  // Aesthetic Items
  if (itensUso) {
    const itensLabels: any = {
      megaHair: 'Mega Hair',
      apliques: 'Apliques',
      unhaGel: 'Unha de Gel',
      ciliosPosticos: 'Cílios Postiços',
      piercings: 'Piercings',
      lenteContato: 'Lente de contato',
    };

    const itensUsoParts = Object.entries(itensUso)
      .filter(([, value]) => value !== undefined)
      .map(
        ([key, value]) =>
          `• ${itensLabels[key]}: ${formatBool(value as boolean)}`,
      );

    if (itensUsoOutros !== undefined && itensUsoOutros) {
      itensUsoParts.push(`• Outros: ${itensUsoOutros}`);
    }

    if (itensUsoParts.length > 0) {
      sections.push(`Itens de uso: ${itensUsoParts.join(' | ')}`);
    }
  }

  // Habits and Vices
  if (drogasRecreativas) {
    const drogasLabels: any = {
      alcool: 'Bebidas Alcoólicas',
      tabaco: 'Tabaco',
      cocaina: 'Cocaína',
      maconha: 'Maconha',
      crack: 'Crack',
      opiaceos: 'Opiáceos',
      metanfetamina: 'Metanfetamina',
    };

    const drogasOrder = [
      'alcool',
      'tabaco',
      'cocaina',
      'maconha',
      'crack',
      'opiaceos',
      'metanfetamina',
    ];

    const drogasRecreativasParts = drogasOrder
      .filter(
        (key) =>
          drogasRecreativas[key as keyof typeof drogasRecreativas] !==
          undefined,
      )
      .map(
        (key) =>
          `• ${drogasLabels[key]}: ${formatBool(drogasRecreativas[key as keyof typeof drogasRecreativas] as boolean)}`,
      );

    if (drogasRecreativasOutros !== undefined && drogasRecreativasOutros) {
      drogasRecreativasParts.push(`• Outros: ${drogasRecreativasOutros}`);
    }

    if (drogasRecreativasParts.length > 0) {
      sections.push(`Hábitos e vícios: ${drogasRecreativasParts.join(' | ')}`);
    }
  }

  // Exams
  if (exames) {
    const unidades: Record<string, string> = {
      hemoglobina: 'g/dL',
      creatinina: 'mg/dL',
      ecocardiograma: '',
    };

    const examesParts = Object.entries(exames)
      .filter(([, dados]) => dados !== undefined)
      .map(([key, dados]) => {
        const nome = key.charAt(0).toUpperCase() + key.slice(1);
        const dadosTyped = dados as { valor?: string; tipo: string };
        return `${nome}: ${dadosTyped.valor || '—'} ${unidades[key]}`;
      });

    if (examesParts.length > 0) {
      sections.push(`Exames: ${examesParts.join(' | ')}`);
    }
  }

  return sections.join(' | ');
}

// Helper to build initial form data based on enabled fields
export function buildInitialFormData(config: FormConfiguration): any {
  const data: any = {};

  // Basic Info
  if (config.sections.basicInfo?.enabled) {
    if (config.sections.basicInfo.fields.idade?.enabled) data.idade = '';
    if (config.sections.basicInfo.fields.peso?.enabled) data.peso = '';
    if (config.sections.basicInfo.fields.altura?.enabled) data.altura = '';
  }

  // Surgery
  if (config.sections.surgery?.enabled) {
    if (config.sections.surgery.fields.nomeCirurgia?.enabled)
      data.nomeCirurgia = '';
    if (config.sections.surgery.fields.dataCirurgia?.enabled)
      data.dataCirurgia = '';
    if (config.sections.surgery.fields.horaCirurgia?.enabled)
      data.horaCirurgia = '';
  }

  // Health Problems
  if (config.sections.healthProblems?.enabled) {
    const problemasSaude: any = {};
    if (config.sections.healthProblems.fields.cardiologicos?.enabled)
      problemasSaude.cardiologicos = false;
    if (config.sections.healthProblems.fields.respiratorios?.enabled)
      problemasSaude.respiratorios = false;
    if (config.sections.healthProblems.fields.renais?.enabled)
      problemasSaude.renais = false;
    if (config.sections.healthProblems.fields.figado?.enabled)
      problemasSaude.figado = false;
    if (config.sections.healthProblems.fields.vasculares?.enabled)
      problemasSaude.vasculares = false;
    if (config.sections.healthProblems.fields.ortopedicos?.enabled)
      problemasSaude.ortopedicos = false;
    if (config.sections.healthProblems.fields.digestivos?.enabled)
      problemasSaude.digestivos = false;
    if (Object.keys(problemasSaude).length > 0) {
      data.problemasSaude = problemasSaude;
    }
  }

  // Allergies
  if (config.sections.allergies?.enabled) {
    if (config.sections.allergies.fields.alergiaLatex?.enabled)
      data.alergiaLatex = false;
    if (config.sections.allergies.fields.alergias?.enabled) data.alergias = '';
  }

  // Medical Devices
  if (config.sections.medicalDevices?.enabled) {
    if (config.sections.medicalDevices.fields.marcaPasso?.enabled)
      data.marcaPasso = false;
    if (config.sections.medicalDevices.fields.cdi?.enabled) data.cdi = false;
    if (config.sections.medicalDevices.fields.bombaMedicamentos?.enabled)
      data.bombaMedicamentos = false;
    if (config.sections.medicalDevices.fields.dispositivosOutros?.enabled)
      data.dispositivosOutros = '';
  }

  // Aesthetic Items
  if (config.sections.aestheticItems?.enabled) {
    const itensUso: any = {};
    if (config.sections.aestheticItems.fields.megaHair?.enabled)
      itensUso.megaHair = false;
    if (config.sections.aestheticItems.fields.apliques?.enabled)
      itensUso.apliques = false;
    if (config.sections.aestheticItems.fields.unhaGel?.enabled)
      itensUso.unhaGel = false;
    if (config.sections.aestheticItems.fields.ciliosPosticos?.enabled)
      itensUso.ciliosPosticos = false;
    if (config.sections.aestheticItems.fields.piercings?.enabled)
      itensUso.piercings = false;
    if (config.sections.aestheticItems.fields.lenteContato?.enabled)
      itensUso.lenteContato = false;
    if (Object.keys(itensUso).length > 0) {
      data.itensUso = itensUso;
    }
    if (config.sections.aestheticItems.fields.itensUsoOutros?.enabled)
      data.itensUsoOutros = '';
  }

  // Habits and Vices
  if (config.sections.habitsAndVices?.enabled) {
    const drogasRecreativas: any = {};
    if (config.sections.habitsAndVices.fields.cocaina?.enabled)
      drogasRecreativas.cocaina = false;
    if (config.sections.habitsAndVices.fields.maconha?.enabled)
      drogasRecreativas.maconha = false;
    if (config.sections.habitsAndVices.fields.crack?.enabled)
      drogasRecreativas.crack = false;
    if (config.sections.habitsAndVices.fields.opiaceos?.enabled)
      drogasRecreativas.opiaceos = false;
    if (config.sections.habitsAndVices.fields.metanfetamina?.enabled)
      drogasRecreativas.metanfetamina = false;
    if (config.sections.habitsAndVices.fields.alcool?.enabled)
      drogasRecreativas.alcool = false;
    if (config.sections.habitsAndVices.fields.tabaco?.enabled)
      drogasRecreativas.tabaco = false;
    if (Object.keys(drogasRecreativas).length > 0) {
      data.drogasRecreativas = drogasRecreativas;
    }
    if (config.sections.habitsAndVices.fields.drogasRecreativasOutros?.enabled)
      data.drogasRecreativasOutros = '';
  }

  // Exams
  if (config.sections.exams?.enabled) {
    const exames: any = {};
    if (config.sections.exams.fields.hemoglobina?.enabled)
      exames.hemoglobina = { tipo: 'texto', valor: '' };
    if (config.sections.exams.fields.creatinina?.enabled)
      exames.creatinina = { tipo: 'texto', valor: '' };
    if (Object.keys(exames).length > 0) {
      data.exames = exames;
    }
  }

  return data;
}
