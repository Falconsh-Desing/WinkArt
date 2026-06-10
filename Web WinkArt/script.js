// ==================== WINKART - SISTEMA COMPLETO ====================
const API_URL = "https://script.google.com/macros/s/AKfycbyRUCw_6pVrNm_WTu8fFHj2zAAz2to29u5ZtgFTJihGIidMP-Yu4bBlkev-5hVknL_S/exec";
const WHATSAPP_NUMBER = "5358536942";

// ==================== DATOS DE SERVICIOS ====================
const serviciosInfo = {
    clasicas: {
        titulo: "Clásicas",
        descripcion: "Las extensiones clásicas son la técnica más natural. Se aplica una extensión por cada pestaña natural, logrando un alargamiento sutil y elegante.",
        precio: "1000 CUP",
        favorece: "Todos los tipos de ojo, especialmente ojos pequeños o rasgados",
        imagen: "clasicas.png"
    },
    volumen2d: {
        titulo: "Volumen 2D",
        descripcion: "Se aplican 2 extensiones ultrafinas por cada pestaña natural, creando un abanico suave que aporta densidad sin perder ligereza.",
        precio: "1200 CUP",
        favorece: "Ojos almendrados, busca volumen sin exceso",
        imagen: "volumen2d.png"
    },
    volumen345d: {
        titulo: "Volumen 3D · 4D · 5D",
        descripcion: "Ideal para quien busca un impacto glamuroso. Se aplican de 3 a 5 extensiones ultrafinas por pestaña natural.",
        precio: "1500 CUP",
        favorece: "Ojos grandes, redondos o separados",
        imagen: "volumen3d.png"
    },
    megavolumen: {
        titulo: "Megavolumen",
        descripcion: "La máxima expresión del volumen. Se aplican más de 6 extensiones ultrafinas por pestaña natural. Un efecto dramático.",
        precio: "2000 CUP",
        favorece: "Ojos pequeños o hundidos, busca efecto lifting",
        imagen: "megavolumen.png"
    },
    puntos: {
        titulo: "Pestañas por puntos",
        descripcion: "Diseño personalizado donde se colocan extensiones en puntos estratégicos para crear efectos específicos.",
        precio: "1200 CUP",
        favorece: "Personalizable según la forma del ojo",
        imagen: "punto.png"
    },
    anime: {
        titulo: "Estilo Anime",
        descripcion: "Inspirado en el estilo de personajes de anime, este diseño crea una mirada hipnótica y extremadamente expresiva, con un efecto doll eye muy marcado.",
        precio: "1800 CUP",
        favorece: "Ojos redondos o grandes, busca un efecto extremo y llamativo",
        imagen: "amine.jpg"
    }
};

// ==================== MODAL ====================
const modal = document.getElementById('modalServicio');
const modalClose = document.querySelector('.modal-close');

function abrirModal(tipo) {
    const info = serviciosInfo[tipo];
    if (!info) return;
    
    const modalImg = document.getElementById('modalImagen');
    if (modalImg) {
        modalImg.src = info.imagen;
        const modalImageContainer = document.querySelector('.modal-flex-image');
        if (modalImageContainer) {
            modalImageContainer.style.setProperty('--bg-image', `url(${info.imagen})`);
        }
    }
    
    const modalBody = document.getElementById('modalBody');
    if (modalBody) {
        modalBody.innerHTML = `
            <h2><i class="fas fa-star"></i> ${info.titulo}</h2>
            <p><i class="fas fa-file-alt"></i> <strong>Descripción:</strong> <span class="descripcion-texto">${info.descripcion}</span></p>
            <p><i class="fas fa-tag"></i> <strong>Precio:</strong> ${info.precio}</p>
            <p><i class="fas fa-eye"></i> <strong>Favorece:</strong> ${info.favorece}</p>
            <button id="reservarDesdeModal" class="btn-reservar-modal">
                <i class="fas fa-calendar-check"></i> Reservar cita
            </button>
        `;
    }
    
    modal.style.display = 'block';
    bloquearScroll();
    
    document.getElementById('reservarDesdeModal')?.addEventListener('click', () => {
        modal.style.display = 'none';
        activarScroll();
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
}

// Asignar evento a cada tarjeta
document.querySelectorAll('.service-card').forEach(card => {
    const tipo = card.dataset.servicio;
    if (tipo) {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-ver-mas')) return;
            abrirModal(tipo);
        });
    }
    
    const btn = card.querySelector('.btn-ver-mas');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModal(card.dataset.servicio);
        });
    }
});

// Cerrar modal
if (modalClose) {
    modalClose.onclick = () => {
        modal.style.display = 'none';
        activarScroll();
    };
}

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        activarScroll();
    }
};

// ==================== FUNCIONES SCROLL ====================
function bloquearScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '15px';
}

function activarScroll() {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// ==================== NAVBAR HIDDEN ON SCROLL ====================
let lastScrollTop = 0;
const navbar = document.getElementById('navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop;
    });
}

// ==================== FORMULARIO DE RESERVAS CON GOOGLE SHEETS ====================
document.addEventListener('DOMContentLoaded', function() {
    const reservaForm = document.getElementById('reservaForm');
    const mensajeDiv = document.getElementById('mensajeConfirmacion');
    
    if (reservaForm) {
        reservaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombre')?.value || '';
            const telefono = document.getElementById('telefono')?.value || '';
            const servicio = document.getElementById('servicio')?.value || '';
            const fecha = document.getElementById('fecha')?.value || '';
            const hora = document.getElementById('hora')?.value || '';
            const comentarios = document.getElementById('comentarios')?.value || 'Sin comentarios';
            
            if (!nombre || !telefono || !servicio || !fecha || !hora) {
                alert('Por favor, completa todos los campos obligatorios');
                return;
            }
            
            if (mensajeDiv) {
                mensajeDiv.innerHTML = '<p class="confirmacion-ok">Procesando tu reserva...</p>';
            }
            
            // ENVIAR A GOOGLE SHEETS
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        fecha: fecha,
                        hora: hora,
                        nombre: nombre,
                        telefono: telefono,
                        servicio: servicio,
                        comentarios: comentarios
                    })
                });
                console.log('✅ Reserva guardada en Google Sheets');
            } catch (error) {
                console.log('❌ Error al guardar en Google Sheets:', error);
            }
            
            const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES');
            const mensajeWhatsApp = `* * * NUEVA RESERVA EN WINKART * * *

► Cliente: ${nombre}
► Teléfono: ${telefono}
► Servicio: ${servicio}
► Fecha: ${fechaFormateada}
► Hora: ${hora}
► Comentarios: ${comentarios}

► Estado: Pendiente de confirmación

¡Gracias por confiar en Winkart!`;
            
            const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeWhatsApp)}`;
            
            if (mensajeDiv) {
                mensajeDiv.innerHTML = '<p class="confirmacion-ok">¡Cita solicitada! Redirigiendo a WhatsApp...</p>';
            }
            
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
                reservaForm.reset();
                setTimeout(() => {
                    if (mensajeDiv) mensajeDiv.innerHTML = '';
                }, 5000);
            }, 1000);
        });
    }
    
    // Fecha mínima
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        fechaInput.min = `${yyyy}-${mm}-${dd}`;
    }
    
    // ==================== SCROLL SUAVE ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});