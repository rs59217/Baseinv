# StreamHub - Plataforma Moderna de Contenido

Una plataforma web moderna y responsiva para agregar, visualizar y gestionar contenido multimedia tipo YouTube. Construida con HTML5, CSS3 y JavaScript vanilla.

## 🚀 Características

✨ **Interfaz Moderna**
- Tema oscuro/claro personalizable
- Diseño responsivo (móvil, tablet, desktop)
- Animaciones suaves y fluidas
- Gradientes modernos y efectos de vidrio (glassmorphism)

🎥 **Gestión de Contenido**
- Grid dinámico de videos
- Filtrado por categorías
- Búsqueda en tiempo real con debounce
- Modal de reproducción de videos
- Información detallada de cada video

📱 **Experiencia de Usuario**
- Sidebar desplegable en móvil
- Scroll suave
- Botón "Volver al top"
- Lazy loading de imágenes
- Animaciones al entrar en pantalla

♿ **Accesibilidad**
- Atajo Alt+S para búsqueda
- Atajo Alt+M para menú
- Tecla Escape para cerrar modales
- Contraste de colores accesible
- Respeta preferencias de movimiento reducido

🎨 **Diseño**
- Paleta de colores moderna (naranja y cian)
- Tipografía optimizada
- Scrollbar personalizado
- Transiciones suaves

## 📂 Estructura del Proyecto

```
project-automation/
├── public/
│   ├── index.html           # Página principal
│   ├── css/
│   │   ├── styles.css       # Estilos principales
│   │   └── responsive.css   # Estilos responsivos
│   └── js/
│       ├── api.js           # Datos simulados y funciones de API
│       └── main.js          # Lógica principal e interactividad
└── README.md
```

## 🛠️ Instalación y Uso

### Opción 1: Abrir directamente
1. Abre `public/index.html` en tu navegador
2. ¡Listo! No requiere instalación

### Opción 2: Usar un servidor local
```bash
# Con Python 3
python -m http.server 8000

# Con Python 2
python -m SimpleHTTPServer 8000

# Con Node.js (http-server)
npx http-server

# Con Live Server en VS Code
# Instala la extensión "Live Server" y abre el archivo HTML
```

Luego accede a `http://localhost:8000`

## 📋 Categorías

- 🔥 Tendencias
- 🎵 Música
- 🎮 Gaming
- 💻 Tecnología
- 😂 Comedia
- 🎬 Películas

## 🎯 Funcionalidades

### Búsqueda
- Busca por título, canal o descripción
- Búsqueda en tiempo real con debounce
- Atajo: Alt + S

### Filtros
- Filtra contenido por categorías
- Botones de filtro en el header

### Tema
- Cambia entre modo oscuro y claro
- Se guarda la preferencia en localStorage
- Transición suave entre temas

### Reproductor
- Haz clic en cualquier video para verlo
- Modal con información detallada
- Cierra con ESC o clic en X

## 💻 Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos, Grid, Flexbox, animaciones
- **JavaScript Vanilla** - Lógica e interactividad
- **Font Awesome** - Iconos
- **Unsplash API** - Imágenes de alta calidad

## 🎨 Personalización

### Cambiar Colores
Edita las variables en `public/css/styles.css`:

```css
:root {
    --primary-color: #ff6b35;      /* Naranja */
    --secondary-color: #f7931e;    /* Naranja oscuro */
    --accent-color: #00d4ff;       /* Cian */
    --dark-bg: #0f0f0f;           /* Fondo oscuro */
}
```

### Agregar Más Videos
Edita el array `VIDEOS_DATA` en `public/js/api.js`:

```javascript
const VIDEOS_DATA = [
    {
        id: 13,
        title: "Tu Video",
        channel: "Tu Canal",
        thumbnail: "URL-IMAGEN",
        duration: "10:00",
        views: "100K",
        likes: "5K",
        category: "tech",
        description: "Descripción del video",
        videoUrl: "EMBED-URL"
    },
    // ... más videos
];
```

## 📱 Responsividad

- **Desktop (1200px+)**: 4 columnas
- **Tablet (768px-1024px)**: 3 columnas
- **Móvil (576px-768px)**: 2 columnas
- **Móvil pequeño (<576px)**: 2 columnas optimizadas
- **Ultra pequeño (<360px)**: Ajuste máximo

## 🚀 Optimizaciones

- ✅ Lazy loading de imágenes
- ✅ Código minificado
- ✅ Animaciones con GPU acceleration
- ✅ Intersection Observer para eficiencia
- ✅ Debounce en búsqueda
- ✅ LocalStorage para preferencias

## 🔐 Seguridad

El proyecto no utiliza dependencias externas de npm, por lo que es completamente seguro para uso local. Todos los scripts son vanilla JavaScript.

## 📈 Futuras Mejoras

- [ ] Sistema de comentarios
- [ ] Playlist personalizadas
- [ ] Recomendaciones basadas en IA
- [ ] Integración con API real de YouTube
- [ ] Login de usuario
- [ ] Historial de reproducción
- [ ] Modo offline con Service Workers
- [ ] PWA (Progressive Web App)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Siéntete libre de hacer fork, crear branches y enviar pull requests.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Creado con ❤️ en 2026

## 📞 Soporte

Para problemas o preguntas, abre un issue en el repositorio.

---

**¡Disfruta usando StreamHub!** 🎬✨
