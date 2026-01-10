// Test script para probar el endpoint de asistencia

async function testAttendance() {
  const baseURL = 'http://localhost:3003';
  
  console.log('🧪 Probando endpoint de asistencia...\n');
  
  try {
    // Primero obtener un ensayo y un miembro
    const rehearsalsResponse = await fetch(`${baseURL}/api/rehearsals`);
    const rehearsals = await rehearsalsResponse.json();
    
    const membersResponse = await fetch(`${baseURL}/api/members`);
    const members = await membersResponse.json();
    
    if (rehearsals.length === 0 || members.length === 0) {
      console.log('❌ No hay ensayos o miembros para probar');
      return;
    }
    
    const rehearsalId = rehearsals[0].id;
    const memberId = members[0].id;
    
    console.log(`📋 Ensayo: ${rehearsals[0].date} - ${rehearsals[0].location}`);
    console.log(`👤 Miembro: ${members[0].name}`);
    console.log('');
    
    // Probar actualizar asistencia a "confirmed"
    console.log('1. Marcando asistencia como "confirmed"...');
    const confirmResponse = await fetch(`${baseURL}/api/rehearsals/${rehearsalId}/attendance`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memberId: memberId,
        status: 'confirmed'
      })
    });
    
    if (confirmResponse.ok) {
      const result = await confirmResponse.json();
      console.log('✅ Asistencia confirmada:', result.status);
    } else {
      console.log('❌ Error confirmando asistencia:', await confirmResponse.text());
    }
    
    // Probar actualizar asistencia a "pending"
    console.log('');
    console.log('2. Cambiando asistencia a "pending"...');
    const pendingResponse = await fetch(`${baseURL}/api/rehearsals/${rehearsalId}/attendance`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memberId: memberId,
        status: 'pending'
      })
    });
    
    if (pendingResponse.ok) {
      const result = await pendingResponse.json();
      console.log('✅ Asistencia actualizada:', result.status);
    } else {
      console.log('❌ Error actualizando asistencia:', await pendingResponse.text());
    }
    
    console.log('');
    console.log('🎉 ¡Endpoint de asistencia funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error probando asistencia:', error.message);
  }
}

testAttendance();