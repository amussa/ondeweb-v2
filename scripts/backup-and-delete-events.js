#!/usr/bin/env node

/**
 * Script SEGURO para fazer BACKUP e depois APAGAR todos os eventos do Firestore
 * 
 * PROCESSO:
 * 1. Faz backup completo de todos os eventos
 * 2. Verifica integridade do backup
 * 3. Pergunta confirmação do usuário
 * 4. Apaga todos os eventos
 * 
 * ATENÇÃO: A exclusão é IRREVERSÍVEL, mas você terá o backup!
 * 
 * Uso: node backup-and-delete-events.js
 */

const admin = require('firebase-admin');
const { backupEvents, verifyBackup } = require('./backup-events');

// Configuração do Firebase Admin
const firebaseConfig = {
  projectId: "onde-it-com",
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

const db = admin.firestore();

async function deleteAllEvents() {
  try {
    console.log('🗑️  Iniciando processo de exclusão...');
    
    // Buscar todos os documentos da coleção 'evento'
    const snapshot = await db.collection('evento').get();
    
    if (snapshot.empty) {
      console.log('✅ Nenhum evento encontrado na coleção para apagar.');
      return 0;
    }

    console.log(`📊 Apagando ${snapshot.size} eventos...`);
    
    // Processar em lotes (máximo 500 por batch)
    const batchSize = 500;
    let deletedCount = 0;
    
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      deletedCount += batchDocs.length;
      
      console.log(`✅ Apagados ${deletedCount}/${docs.length} eventos...`);
    }
    
    return deletedCount;
    
  } catch (error) {
    console.error('❌ Erro ao apagar eventos:', error);
    throw error;
  }
}

async function backupAndDeleteEvents() {
  try {
    console.log('🚀 PROCESSO SEGURO: Backup + Exclusão de Eventos');
    console.log('=' .repeat(50));
    console.log('');
    
    // ETAPA 1: Fazer backup
    console.log('📋 ETAPA 1/4: Fazendo backup dos eventos...');
    const backupFilePath = await backupEvents();
    
    if (!backupFilePath) {
      console.log('ℹ️  Nenhum evento encontrado para backup. Processo finalizado.');
      return;
    }
    
    console.log('');
    
    // ETAPA 2: Verificar backup
    console.log('📋 ETAPA 2/4: Verificando integridade do backup...');
    const isBackupValid = await verifyBackup(backupFilePath);
    
    if (!isBackupValid) {
      throw new Error('Backup inválido! Processo interrompido por segurança.');
    }
    
    console.log('');
    
    // ETAPA 3: Confirmação do usuário
    console.log('📋 ETAPA 3/4: Confirmação do usuário...');
    console.log('✅ Backup criado e verificado com sucesso!');
    console.log(`📂 Local do backup: ${backupFilePath}`);
    console.log('');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question(`⚠️  CONFIRMAÇÃO FINAL: Deseja APAGAR TODOS os eventos agora?\n   (O backup está seguro, mas a exclusão é IRREVERSÍVEL)\n   Digite 'SIM' para confirmar: `, resolve);
    });
    
    rl.close();

    if (answer !== 'SIM') {
      console.log('❌ Exclusão cancelada pelo usuário.');
      console.log('✅ Backup mantido em: ' + backupFilePath);
      console.log('💡 Você pode executar apenas o backup quando quiser.');
      return;
    }
    
    console.log('');
    
    // ETAPA 4: Apagar eventos
    console.log('📋 ETAPA 4/4: Apagando eventos...');
    const deletedCount = await deleteAllEvents();
    
    console.log('');
    console.log('🎉 PROCESSO CONCLUÍDO COM SUCESSO!');
    console.log('=' .repeat(50));
    console.log(`✅ Eventos apagados: ${deletedCount}`);
    console.log(`💾 Backup salvo em: ${backupFilePath}`);
    console.log('');
    console.log('📋 Para restaurar os eventos (se necessário):');
    console.log(`   node restore-events.js "${backupFilePath}"`);
    console.log('');
    
  } catch (error) {
    console.error('💥 ERRO NO PROCESSO:', error);
    
    if (error.code === 'permission-denied') {
      console.error('🔒 Erro de permissão. Verifique se:');
      console.error('   - Você tem permissões de leitura/escrita na coleção "evento"');
      console.error('   - As regras do Firestore permitem estas operações');
    }
    
    console.error('');
    console.error('🛡️  SEGURANÇA: Se o backup foi criado, seus dados estão seguros!');
    console.error('   Verifique a pasta ./backups/ para arquivos de backup.');
    
    process.exit(1);
  }
}

// Executar o script
if (require.main === module) {
  console.log('🛡️  SCRIPT SEGURO: Backup + Exclusão de Eventos do Firestore');
  console.log('📝 Este script fará backup ANTES de apagar qualquer coisa');
  console.log('⏱️  O processo pode demorar alguns minutos...');
  console.log('');

  backupAndDeleteEvents()
    .then(() => {
      console.log('✨ Script finalizado com sucesso.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { backupAndDeleteEvents };

