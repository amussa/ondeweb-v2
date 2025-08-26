#!/usr/bin/env node

/**
 * Script para corrigir a localização do evento para incluir "Maputo"
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

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

async function fixEventLocation() {
  try {
    console.log('🔧 Corrigindo localização do evento...');
    
    const eventId = 'pV04td1F1eFvnuUCHzXr';
    
    // Opções de correção
    const options = {
      1: "Av. Mártires da Mueda n. 790, Maputo",
      2: "A Casa da Maria, Maputo", 
      3: "Maputo - Av. Mártires da Mueda n. 790",
      4: "Maputo"
    };
    
    console.log('📍 Opções de localização:');
    Object.entries(options).forEach(([key, value]) => {
      console.log(`   ${key}. ${value}`);
    });
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const choice = await new Promise((resolve) => {
      rl.question('Escolha uma opção (1-4): ', resolve);
    });
    
    rl.close();

    const newLocationName = options[choice];
    
    if (!newLocationName) {
      console.log('❌ Opção inválida');
      return;
    }
    
    console.log(`🔄 Atualizando locationName para: "${newLocationName}"`);
    
    // Atualizar o documento
    const eventRef = doc(db, 'evento', eventId);
    await updateDoc(eventRef, {
      locationName: newLocationName
    });
    
    console.log('✅ Evento atualizado com sucesso!');
    console.log('💡 Agora o evento deve aparecer quando filtrar por "Maputo"');
    console.log('🔄 Limpe o cache da aplicação e recarregue');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar evento:', error);
  }
}

// Executar script
console.log('🚀 Script para corrigir localização do evento');
console.log('📍 Problema: O evento não contém "Maputo" no campo locationName');
console.log('');

fixEventLocation()
  .then(() => {
    console.log('✨ Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });

