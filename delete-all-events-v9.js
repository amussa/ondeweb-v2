#!/usr/bin/env node

/**
 * Script para apagar TODOS os eventos do Firestore (Firebase v9+)
 * 
 * ATENÇÃO: Esta operação é IRREVERSÍVEL!
 * 
 * Uso:
 * 1. Configure suas credenciais Firebase
 * 2. Execute: node delete-all-events-v9.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllEvents() {
  try {
    console.log('🔍 Buscando todos os eventos...');
    
    // Buscar todos os documentos da coleção 'evento'
    const eventsRef = collection(db, 'evento');
    const snapshot = await getDocs(eventsRef);
    
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
    
    // Processar em lotes (máximo 500 operações por batch)
    const batchSize = 500;
    let deletedCount = 0;
    
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(docSnapshot => {
        batch.delete(doc(db, 'evento', docSnapshot.id));
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
console.log('🚀 Iniciando script para apagar todos os eventos (Firebase v9+)...');
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
