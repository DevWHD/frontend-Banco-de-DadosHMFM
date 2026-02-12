// Senhas de 6 dígitos para cada pasta (por nome)
// Nome da Pasta -> Senha (nomes exatos do banco de dados)
export const folderPasswordsByName: Record<string, string> = {
  "ALMOXARIFADO": "914275",
  "CCIH": "582634",
  "CENTRO DE ESTUDOS": "739148",
  "CGA": "463729",
  "CHEFIA DE ANESTESIA": "825196",
  "CHEFIA DE CLÍNICA MÉDICA": "637482",
  "CHEFIA DE ENFERMAGEM NEONATAL": "491837",
  "CHEFIA DE GINECOLOGIA": "758294",
  "CHEFIA DE NEONATOLOGIA": "384659",
  "CHEFIA DE OBSTETRÍCIA": "926571",
  "CHEFIA DE PACIENTES EXTERNOS": "571938",
  "CHEFIA DE PACIENTES INTERNOS": "648273",
  "CHEFIAS DE ENFERMAGEM": "395827",
  "CMA": "817462",
  "COMITÊ DE ÉTICA DE ENFERMAGEM": "264951",
  "COMITÊ DE ÉTICA MÉDICA": "751839",
  "COMITÊ DE ÓBITO MATERNO": "438697",
  "COMPRAS": "621875",
  "DIREÇÃO GERAL": "983456",
  "DOCUMENTAÇÃO MÉDICA": "526948",
  "DSADT": "749183",
  "FARMÁCIA": "762149",
  "FATURAMENTO": "314826",
  "LABORATÓRIOS": "894536",
  "MANUTENÇÃO": "681359",
  "NATS": "927543",
  "NSP": "453719",
  "NUTRIÇÃO": "598274",
  "RADIOLOGIA": "316478",
  "RH": "485932",
  "SERVIÇO SOCIAL": "729465",
};

// Senha padrão para novas pastas
export const DEFAULT_PASSWORD = "111111";

// Verifica se a senha está correta para uma pasta (por nome)
export function checkFolderPassword(folderName: string, password: string): boolean {
  const correctPassword = folderPasswordsByName[folderName] || DEFAULT_PASSWORD;
  return password === correctPassword;
}

// Obtém a senha de uma pasta (apenas para referência)
export function getFolderPassword(folderName: string): string {
  return folderPasswordsByName[folderName] || DEFAULT_PASSWORD;
}

// Lista todas as senhas configuradas
export function getAllPasswords(): Array<{ folderName: string; password: string }> {
  return Object.entries(folderPasswordsByName).map(([name, password]) => ({
    folderName: name,
    password,
  }));
}

// Verifica se uma pasta requer senha
export function requiresPassword(folderName: string): boolean {
  return folderName in folderPasswordsByName || true; // Todas requerem senha (padrão se não estiver listada)
}
