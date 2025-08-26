#!/usr/bin/env node

/**
 * Script para testar a busca de eventos e diagnosticar problemas
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, Timestamp } = require('firebase/firestore');

// Configuração do Firebase
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

async function testEventsFetch() {
  try {
    console.log('🔍 Testando busca de eventos...');
    console.log('');
    
    // 1. Buscar TODOS os eventos (sem filtro de data)
    console.log('📋 1. Buscando TODOS os eventos (sem filtros):');
    const allSnapshot = await getDocs(collection(db, 'evento'));
    console.log(`   Total encontrado: ${allSnapshot.size} eventos`);
    
    allSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Nome: ${data.name}`);
      console.log(`     Data: ${data.data ? new Date(data.data.seconds * 1000).toISOString() : 'N/A'}`);
      console.log(`     Deleted: ${data.deleted}`);
      console.log('');
    });
    
    // 2. Buscar eventos futuros (como a aplicação faz)
    console.log('📋 2. Buscando eventos futuros (filtro da aplicação):');
    const today = Timestamp.fromDate(new Date());
    console.log(`   Data de referência: ${new Date().toISOString()}`);
    console.log(`   Timestamp: ${today.seconds}`);
    
    const futureQuery = query(
      collection(db, 'evento'),
      where('data', '>=', today)
    );
    
    const futureSnapshot = await getDocs(futureQuery);
    console.log(`   Eventos futuros encontrados: ${futureSnapshot.size}`);
    
    futureSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Nome: ${data.name}`);
      console.log(`     Data: ${new Date(data.data.seconds * 1000).toISOString()}`);
      console.log(`     Deleted: ${data.deleted}`);
      console.log('');
    });
    
    // 3. Aplicar filtro de deleted
    console.log('📋 3. Aplicando filtro de eventos não deletados:');
    const nonDeletedEvents = futureSnapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id }))
      .filter(event => !event.deleted);
    
    console.log(`   Eventos não deletados: ${nonDeletedEvents.length}`);
    
    nonDeletedEvents.forEach(event => {
      console.log(`   - ID: ${event.id}`);
      console.log(`     Nome: ${event.name}`);
      console.log(`     Data: ${new Date(event.data.seconds * 1000).toISOString()}`);
      console.log('');
    });
    
    // 4. Verificar evento específico
    console.log('📋 4. Verificando evento específico "pV04td1F1eFvnuUCHzXr":');
    const specificEvent = allSnapshot.docs.find(doc => doc.id === 'pV04td1F1eFvnuUCHzXr');
    
    if (specificEvent) {
      const data = specificEvent.data();
      console.log('   ✅ Evento encontrado!');
      console.log(`   Nome: ${data.name}`);
      console.log(`   Data: ${new Date(data.data.seconds * 1000).toISOString()}`);
      console.log(`   Deleted: ${data.deleted}`);
      console.log(`   Categoria: ${data.categoria}`);
      
      // Verificar se passa nos filtros
      const eventDate = Timestamp.fromDate(new Date(data.data.seconds * 1000));
      const isFuture = eventDate.seconds >= today.seconds;
      const isNotDeleted = !data.deleted;
      
      console.log('');
      console.log('   🔍 Verificação de filtros:');
      console.log(`   - É futuro? ${isFuture} (${eventDate.seconds} >= ${today.seconds})`);
      console.log(`   - Não está deletado? ${isNotDeleted}`);
      console.log(`   - Deveria aparecer na aplicação? ${isFuture && isNotDeleted ? '✅ SIM' : '❌ NÃO'}`);
    } else {
      console.log('   ❌ Evento não encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
console.log('🚀 Iniciando diagnóstico de eventos...');
console.log('');

testEventsFetch()
  .then(() => {
    console.log('✨ Diagnóstico concluído.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });

