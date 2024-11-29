const endpoint = 'https://demo.tesserapass.es/api/company/la-zona-larry/events/3/';
const urlPost='https://demo.tesserapass.es/api/company/la-zona-larry/events/3/orders';

async function eventsData() {
  const response = await fetch(endpoint);
  const data = await response.json();
  console.log(data);

  // Rellenar datos del evento
  document.querySelector('#banner').setAttribute('src', data.event.image);
  document.querySelector("#enventname").innerHTML = data.event.name;
  document.querySelector("#companyname").innerHTML = data.company.name;
  document.querySelector('#descripti').innerHTML = data.event.description;
  document.querySelector('#adressEvent').innerHTML = data.event.address;

  // Fecha
  const fecha = document.querySelector('#dateEvent');
  const mesesEnEspañol = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const today = new Date(data.event.start_at);
  const todayEnd = new Date(data.event.ends_at);
  const start = `${today.getDate().toString().padStart(2, '0')} - ${mesesEnEspañol[today.getMonth()]} - ${today.getFullYear()}`;
  const end = `${todayEnd.getHours()}:${todayEnd.getMinutes().toString().padStart(2, '0')} - Cierre`;
  fecha.innerHTML = `${start} - ${end}`;

// Rellenar el select.
const tickets = data.event.max_tickets_for_order;
const selectElement = document.getElementById('tickes');
selectElement.innerHTML = ''; // Limpiar

const defaultOption = document.createElement('option');
defaultOption.value = '';
defaultOption.innerHTML = 'entradas';
selectElement.appendChild(defaultOption);

for (let i = 1; i <= tickets; i++) {
const option = document.createElement('option');
option.value = i; // El valor del option
option.innerHTML = `${i} entrada${i > 1 ? 's' : ''}`; // Texto dinámico
selectElement.appendChild(option);
}

  // Manejo del formulario
  document.getElementById('orderForm').addEventListener('submit', async (event) => {
      event.preventDefault();

      const fullName = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const confirmedEmail = document.getElementById('confirmedEmail').value;
      const product = parseInt(document.getElementById('tickes').value);

      if (email !== confirmedEmail) {
          document.querySelector('#responseMessage').innerHTML = 'Los correos electrónicos no coinciden.';
          return;
      }

      try {
          const orderData = {
              order: {
                  full_name: fullName,
                  email: email,
                  rrpp: "",
                  total_price: 0,
                  confirmed_email: confirmedEmail
              },
              tickets: Array.from({ length: product }, () => ({
                  product_id: '4',
                  full_name: fullName,
                  email: email
              }))
          };

          const responsePost = await fetch(urlPost, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + 'larry@demo.com:password'
              },
              body: JSON.stringify(orderData)
          });

          if (responsePost.ok) {
              const responseData = await responsePost.json();
              if (responseData.checkout && responseData.checkout.payment_intent === 'FREE_EVENT') {
                  document.querySelector('#responseMessage').innerHTML = '¡Pedido creado exitosamente! Este evento es gratuito.';
              } else if (responseData.checkout && responseData.checkout.url) {
                  document.querySelector('#responseMessage').innerHTML = `Pedido creado. Completa el pago en: ${responseData.checkout.url}`;
              } else {
                  document.querySelector('#responseMessage').innerHTML = 'Pedido creado exitosamente: ' + JSON.stringify(responseData);
              }
          } else {
              const errorText = await responsePost.text();
              document.querySelector('#responseMessage').innerHTML = 'Error al crear el pedido: ' + errorText;
          }
      } catch (error) {
          console.error('Error:', error);
          document.querySelector('#responseMessage').textContent = 'Error en la solicitud: ' + error.message;
      }
  });
}

eventsData();