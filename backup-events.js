#!/usr/bin/env node

/**
 * Script para fazer BACKUP de todos os eventos do Firestore
 * 
 * Este script salva todos os eventos em um arquivo JSON antes de qualquer operação de exclusão
 * 
 * Uso:
 * 1. node backup-events.js
 * 2. O backup será salvo em: backups/eventos_backup_YYYY-MM-DD_HH-mm-ss.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuração do Firebase Admin
const firebaseConfig = {
  projectId: "onde-it-com",
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

const db = admin.firestore();

// Função para criar nome do arquivo de backup
function createBackupFileName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `eventos_backup_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`;
}

// Função para converter Firestore Timestamp para string
function convertFirestoreData(data) {
  const converted = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && value._seconds !== undefined) {
      // É um Firestore Timestamp
      converted[key] = {
        _timestamp: true,
        _seconds: value._seconds,
        _nanoseconds: value._nanoseconds,
        _dateString: new Date(value._seconds * 1000).toISOString()
      };
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // É um objeto, converter recursivamente
      converted[key] = convertFirestoreData(value);
    } else {
      // Valor simples
      converted[key] = value;
    }
  }
  
  return converted;
}

async function backupEvents() {
  try {
    console.log('🔍 Buscando todos os eventos para backup...');
    
    // Buscar todos os documentos da coleção 'evento'
    const snapshot = await db.collection('evento').get();
    
    if (snapshot.empty) {
      console.log('✅ Nenhum evento encontrado na coleção.');
      return null;
    }

    console.log(`📊 Encontrados ${snapshot.size} eventos para backup.`);
    
    // Preparar dados para backup
    const backupData = {
      metadata: {
        collection: 'evento',
        backupDate: new Date().toISOString(),
        totalDocuments: snapshot.size,
        firebaseProject: firebaseConfig.projectId
      },
      events: []
    };
    
    // Processar cada documento
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const convertedData = convertFirestoreData(data);
      
      backupData.events.push({
        id: doc.id,
        data: convertedData
      });
    });
    
    // Criar diretório de backup se não existir
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('📁 Diretório de backup criado: ./backups/');
    }
    
    // Salvar backup
    const backupFileName = createBackupFileName();
    const backupFilePath = path.join(backupDir, backupFileName);
    
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
    
    console.log(`💾 Backup salvo com sucesso!`);
    console.log(`📄 Arquivo: ${backupFilePath}`);
    console.log(`📊 Total de eventos: ${snapshot.size}`);
    console.log(`💿 Tamanho do arquivo: ${(fs.statSync(backupFilePath).size / 1024 / 1024).toFixed(2)} MB`);
    
    return backupFilePath;
    
  } catch (error) {
    console.error('❌ Erro ao fazer backup dos eventos:', error);
    
    if (error.code === 'permission-denied') {
      console.error('🔒 Erro de permissão. Verifique se:');
      console.error('   - Você tem permissão de leitura na coleção "evento"');
      console.error('   - As regras do Firestore permitem esta operação');
    }
    
    throw error;
  }
}

// Função para verificar integridade do backup
async function verifyBackup(backupFilePath) {
  try {
    console.log('🔍 Verificando integridade do backup...');
    
    const backupContent = fs.readFileSync(backupFilePath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    if (!backupData.metadata || !backupData.events) {
      throw new Error('Estrutura do backup inválida');
    }
    
    console.log(`✅ Backup verificado com sucesso!`);
    console.log(`   - Eventos no backup: ${backupData.events.length}`);
    console.log(`   - Data do backup: ${backupData.metadata.backupDate}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro na verificação do backup:', error);
    return false;
  }
}

// Executar o script
if (require.main === module) {
  console.log('🚀 Iniciando backup dos eventos do Firestore...');
  console.log('📝 Este processo pode demorar alguns minutos dependendo da quantidade de eventos');
  console.log('');

  backupEvents()
    .then(async (backupFilePath) => {
      if (backupFilePath) {
        const isValid = await verifyBackup(backupFilePath);
        if (isValid) {
          console.log('');
          console.log('🎉 Backup concluído com sucesso!');
          console.log('💡 Agora você pode executar o script de exclusão com segurança.');
          console.log('');
          console.log('📋 Para restaurar os eventos (se necessário):');
          console.log(`   node restore-events.js "${backupFilePath}"`);
        } else {
          console.log('❌ Backup criado mas com problemas de integridade!');
          process.exit(1);
        }
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal no backup:', error);
      process.exit(1);
    });
}

// Exportar função para uso em outros scripts
module.exports = { backupEvents, verifyBackup };

