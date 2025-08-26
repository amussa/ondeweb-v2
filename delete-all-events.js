#!/usr/bin/env node

/**
 * Script para apagar TODOS os eventos do Firestore
 * 
 * ATENÇÃO: Esta operação é IRREVERSÍVEL!
 * 
 * Uso:
 * 1. Configure suas credenciais Firebase no arquivo src/base.js
 * 2. Execute: node delete-all-events.js
 */

const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');

// Configuração do Firebase com suas credenciais reais
const firebaseConfig = {
  apiKey: "AIzaSyAf2ss3j8KzxOokqKVtKD1pCrMsIISjJ50",
  authDomain: "onde-it-com.firebaseapp.com",
  projectId: "onde-it-com",
  storageBucket: "onde-it-com.appspot.com",
  messagingSenderId: "58024286019",
  appId: "1:58024286019:web:e21ed462578247fa1941f6",
  measurementId: "G-SMD30RGFWS"
};

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

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
      console.error('   - Suas credenciais Firebase estão corretas');
      console.error('   - Você tem permissão de escrita na coleção "evento"');
      console.error('   - As regras do Firestore permitem esta operação');
    }
    
    process.exit(1);
  }
}

// Executar o script
console.log('🚀 Iniciando script para apagar todos os eventos...');
console.log('📝 Certifique-se de que suas credenciais Firebase estão configuradas corretamente!');
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
