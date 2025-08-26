#!/usr/bin/env node

/**
 * Script para apagar TODOS os eventos do Firestore usando Firebase Admin SDK
 * 
 * ATENÇÃO: Esta operação é IRREVERSÍVEL!
 * 
 * Uso:
 * 1. npm install firebase-admin
 * 2. node delete-all-events-admin.js
 */

const admin = require('firebase-admin');

// Configuração do Firebase Admin
const firebaseConfig = {
  projectId: "onde-it-com",
  // Para produção, use uma service account key
  // credential: admin.credential.cert(require('./path/to/serviceAccountKey.json'))
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

const db = admin.firestore();

async function deleteAllEvents() {
  try {
    console.log('🔍 Buscando todos os eventos...');
    
    // Buscar todos os documentos da coleção 'evento'
    const snapshot = await db.collection('evento').get();
    
    if (snapshot.empty) {
      console.log('✅ Nenhum evento encontrado na coleção.');
      return;
    }

    console.log(`📊 Encontrados ${snapshot.size} eventos para apagar.`);
    
    // Confirmar antes de apagar
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question(`⚠️  ATENÇÃO: Você está prestes a apagar ${snapshot.size} eventos PERMANENTEMENTE!\nTem certeza? (digite 'SIM' para confirmar): `, resolve);
    });
    
    rl.close();

    if (answer !== 'SIM') {
      console.log('❌ Operação cancelada pelo usuário.');
      return;
    }

    console.log('🗑️  Iniciando processo de exclusão...');
    
    // Criar batch para operações em lote (máximo 500 por batch)
    const batchSize = 500;
    let deletedCount = 0;
    
    // Processar em lotes
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
    
    console.log(`🎉 Sucesso! Todos os ${deletedCount} eventos foram apagados do Firestore.`);
    
  } catch (error) {
    console.error('❌ Erro ao apagar eventos:', error);
    
    if (error.code === 'permission-denied') {
      console.error('🔒 Erro de permissão. Verifique se:');
      console.error('   - Você tem permissão de escrita na coleção "evento"');
      console.error('   - As regras do Firestore permitem esta operação');
      console.error('   - Você está autenticado corretamente');
    }
    
    process.exit(1);
  }
}

// Executar o script
console.log('🚀 Iniciando script para apagar todos os eventos (Firebase Admin SDK)...');
console.log('📝 Usando Firebase Admin SDK para operações administrativas');
console.log('');

deleteAllEvents()
  .then(() => {
    console.log('✨ Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });

