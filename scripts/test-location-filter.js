#!/usr/bin/env node

/**
 * Script para testar o filtro de localização
 */

// Simular o evento atual
const evento = {
  id: "pV04td1F1eFvnuUCHzXr",
  name: "Evento-01",
  locationName: "Av. Mártires da Mueda n. 790",
  location: "A Casa da Maria"
};

console.log('🧪 Teste do Filtro de Localização');
console.log('=' .repeat(40));
console.log('');

console.log('📍 Dados do evento:');
console.log(`   Nome: ${evento.name}`);
console.log(`   LocationName: "${evento.locationName}"`);
console.log(`   Location: "${evento.location}"`);
console.log('');

// Testar filtros
const provinces = ["Maputo", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambezia", "Nampula", "Cabo Delgado", "Niassa"];

console.log('🔍 Testando filtros por província:');
console.log('');

provinces.forEach(province => {
  // Simular o filtro da aplicação
  const matches = evento.locationName.toLowerCase().includes(province.toLowerCase());
  
  console.log(`   ${province}: ${matches ? '✅ PASSA' : '❌ NÃO PASSA'}`);
  
  if (matches) {
    console.log(`      → "${evento.locationName}" contém "${province}"`);
  }
});

console.log('');
console.log('💡 Soluções:');
console.log('   1. Adicionar "Maputo" ao locationName');
console.log('   2. Modificar o filtro para usar outros campos');
console.log('   3. Usar coordenadas geográficas para determinar província');
console.log('');

// Testar possíveis correções
console.log('🔧 Testando possíveis correções:');
const corrections = [
  "Av. Mártires da Mueda n. 790, Maputo",
  "A Casa da Maria, Maputo", 
  "Maputo - Av. Mártires da Mueda n. 790",
  "Maputo"
];

corrections.forEach((correction, index) => {
  const matches = correction.toLowerCase().includes('maputo');
  console.log(`   ${index + 1}. "${correction}": ${matches ? '✅ FUNCIONARIA' : '❌ NÃO FUNCIONARIA'}`);
});

console.log('');
console.log('📊 Coordenadas do evento:');
console.log('   Latitude: -25.978232972267953');
console.log('   Longitude: 32.58650600910187');
console.log('   💡 Estas coordenadas estão em Maputo!');

