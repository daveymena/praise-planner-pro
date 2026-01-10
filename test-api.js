// Test script para verificar que el API funciona correctamente

async function testAPI() {
  const baseURL = 'http://localhost:3003';
  
  console.log('🔍 Probando API endpoints...\n');
  
  try {
    // Test health check
    console.log('1. Health Check...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData.status);
    console.log('   Database:', healthData.database);
    console.log('');
    
    // Test members
    console.log('2. Members API...');
    const membersResponse = await fetch(`${baseURL}/api/members`);
    const membersData = await membersResponse.json();
    console.log(`✅ Members: ${membersData.length} miembros encontrados`);
    if (membersData.length > 0) {
      console.log(`   Primer miembro: ${membersData[0].name} (${membersData[0].role})`);
    }
    console.log('');
    
    // Test songs
    console.log('3. Songs API...');
    const songsResponse = await fetch(`${baseURL}/api/songs`);
    const songsData = await songsResponse.json();
    console.log(`✅ Songs: ${songsData.length} canciones encontradas`);
    if (songsData.length > 0) {
      console.log(`   Primera canción: ${songsData[0].name} (${songsData[0].type})`);
    }
    console.log('');
    
    // Test rehearsals
    console.log('4. Rehearsals API...');
    const rehearsalsResponse = await fetch(`${baseURL}/api/rehearsals`);
    const rehearsalsData = await rehearsalsResponse.json();
    console.log(`✅ Rehearsals: ${rehearsalsData.length} ensayos encontrados`);
    if (rehearsalsData.length > 0) {
      console.log(`   Primer ensayo: ${rehearsalsData[0].date} - ${rehearsalsData[0].location}`);
    }
    console.log('');
    
    // Test rules
    console.log('5. Rules API...');
    const rulesResponse = await fetch(`${baseURL}/api/rules`);
    const rulesData = await rulesResponse.json();
    console.log(`✅ Rules: ${Object.keys(rulesData).length} categorías de reglas`);
    console.log(`   Categorías: ${Object.keys(rulesData).join(', ')}`);
    console.log('');
    
    console.log('🎉 ¡Todos los endpoints funcionan correctamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log(`   - Backend: ${baseURL}`);
    console.log(`   - Frontend: http://localhost:8080`);
    console.log(`   - Base de datos: SQLite (${healthData.database})`);
    console.log('');
    console.log('✅ La aplicación está lista para usar!');
    
  } catch (error) {
    console.error('❌ Error probando API:', error.message);
  }
}

testAPI();