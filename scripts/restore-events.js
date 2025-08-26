#!/usr/bin/env node

/**
 * Script para RESTAURAR eventos do Firestore a partir de um backup
 * 
 * Uso:
 * node restore-events.js "caminho/para/backup.json"
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

// Função para converter dados do backup de volta para Firestore
function convertBackupData(data) {
  const converted = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && value._timestamp === true) {
      // É um Timestamp do Firestore
      converted[key] = new admin.firestore.Timestamp(value._seconds, value._nanoseconds);
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !value._timestamp) {
      // É um objeto, converter recursivamente
      converted[key] = convertBackupData(value);
    } else {
      // Valor simples
      converted[key] = value;
    }
  }
  
  return converted;
}

async function restoreEvents(backupFilePath) {
  try {
    console.log('📂 Carregando arquivo de backup...');
    
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Arquivo de backup não encontrado: ${backupFilePath}`);
    }
    
    const backupContent = fs.readFileSync(backupFilePath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    if (!backupData.metadata || !backupData.events) {
      throw new Error('Estrutura do backup inválida');
    }
    
    console.log(`📊 Backup carregado:`);
    console.log(`   - Data do backup: ${backupData.metadata.backupDate}`);
    console.log(`   - Total de eventos: ${backupData.events.length}`);
    console.log(`   - Projeto Firebase: ${backupData.metadata.firebaseProject}`);
    
    // Confirmar antes de restaurar
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question(`⚠️  Deseja restaurar ${backupData.events.length} eventos no Firestore?\n(digite 'SIM' para confirmar): `, resolve);
    });
    
    rl.close();

    if (answer !== 'SIM') {
      console.log('❌ Operação cancelada pelo usuário.');
      return;
    }

    console.log('📥 Iniciando processo de restauração...');
    
    // Processar em lotes (máximo 500 por batch)
    const batchSize = 500;
    let restoredCount = 0;
    
    const events = backupData.events;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = db.batch();
      const batchEvents = events.slice(i, i + batchSize);
      
      batchEvents.forEach(event => {
        const docRef = db.collection('evento').doc(event.id);
        const convertedData = convertBackupData(event.data);
        batch.set(docRef, convertedData);
      });
      
      await batch.commit();
      restoredCount += batchEvents.length;
      
      console.log(`✅ Restaurados ${restoredCount}/${events.length} eventos...`);
    }
    
    console.log(`🎉 Sucesso! Todos os ${restoredCount} eventos foram restaurados no Firestore.`);
    
  } catch (error) {
    console.error('❌ Erro ao restaurar eventos:', error);
    
    if (error.code === 'permission-denied') {
      console.error('🔒 Erro de permissão. Verifique se:');
      console.error('   - Você tem permissão de escrita na coleção "evento"');
      console.error('   - As regras do Firestore permitem esta operação');
    }
    
    process.exit(1);
  }
}

// Executar o script
if (require.main === module) {
  const backupFilePath = process.argv[2];
  
  if (!backupFilePath) {
    console.error('❌ Erro: Caminho do arquivo de backup não fornecido');
    console.log('');
    console.log('Uso: node restore-events.js "caminho/para/backup.json"');
    console.log('');
    console.log('Exemplo:');
    console.log('  node restore-events.js "./backups/eventos_backup_2024-01-15_14-30-45.json"');
    process.exit(1);
  }

  console.log('🚀 Iniciando restauração dos eventos do Firestore...');
  console.log(`📂 Arquivo de backup: ${backupFilePath}`);
  console.log('');

  restoreEvents(backupFilePath)
    .then(() => {
      console.log('✨ Restauração finalizada.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal na restauração:', error);
      process.exit(1);
    });
}

module.exports = { restoreEvents };

