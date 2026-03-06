// ========================
// MAIN.JS - BarCode Pro
// ========================

// Elementos del DOM
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const closeSidebar = document.getElementById('closeSidebar');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeEventListeners();
    updateDashboard();
    loadProducts();
});

// ========================
// TEMA OSCURO/CLARO
// ========================

const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
};

const applyTheme = (theme) => {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('lightThemeBtn')?.classList.add('active');
    } else {
        document.body.classList.remove('light-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('darkThemeBtn')?.classList.add('active');
    }
    localStorage.setItem('theme', theme);
};

// ========================
// NAVEGACIÓN
// ========================

const initializeEventListeners = () => {
    // Tema
    themeToggle?.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // Sidebar
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    closeSidebar?.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Navegación por páginas
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            switchPage(page);
            
            document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
            link.parentElement.classList.add('active');
            
            sidebar.classList.remove('active');
        });
    });

    // Formulario de producto
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleAddProduct);
    }

    // Formulario de edición de producto
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleEditProductSubmit);
    }

    // Cerrar modal de edición
    document.getElementById('editProductModalClose')?.addEventListener('click', closeEditProductModal);

    // Handle image upload
    const productImage = document.getElementById('productImage');
    if (productImage) {
        productImage.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const preview = document.getElementById('imagePreview');
                    preview.src = event.target.result;
                    document.getElementById('imagePreviewContainer').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Búsqueda
    searchBtn?.addEventListener('click', performSearch);
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Escaneo
    const scanInput = document.getElementById('scanInput');
    if (scanInput) {
        scanInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleScan(e.target.value);
        });
    }

    // Restaurar archivo
    document.getElementById('restoreFile')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (restoreBackup(event.target.result)) {
                    alert('✅ Datos restaurados exitosamente');
                    location.reload();
                } else {
                    alert('❌ Error al restaurar los datos');
                }
            };
            reader.readAsText(file);
        }
    });
};

const switchPage = (page) => {
    // Ocultar todas las páginas
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.remove('active');
    });

    // Mostrar página seleccionada
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }

    // Cargar contenido específico
    if (page === 'dashboard') {
        updateDashboard();
    } else if (page === 'products') {
        loadProducts();
    } else if (page === 'new-product') {
        generateNewSKU();
    } else if (page === 'sales') {
        loadSalesPage();
    }
};

window.switchPage = switchPage;

// ========================
// DASHBOARD
// ========================

const updateDashboard = () => {
    const stats = getStats();

    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalBarcodes').textContent = stats.totalBarcodes;
    document.getElementById('totalScans').textContent = stats.totalScans;
    document.getElementById('totalValue').textContent = '$' + stats.totalValue.toFixed(2);

    // Productos recientes
    const recentList = document.getElementById('recentProductsList');
    recentList.innerHTML = stats.recentProducts.map(p => `
        <div class="product-item">
            <div>
                <strong>${p.name}</strong>
                <small>${p.sku}</small>
            </div>
            <span>$${p.price}</span>
        </div>
    `).join('');

    // Actividades recientes
    const activitiesList = document.getElementById('activitiesList');
    activitiesList.innerHTML = stats.recentActivities.map(a => `
        <div class="activity-item">
            <span><strong>${a.description}</strong></span>
            <span>${new Date(a.timestamp).toLocaleString()}</span>
        </div>
    `).join('');
};

// ========================
// PRODUCTOS
// ========================

const generateNewSKU = () => {
  const newSKU = generateSKU();
  const input = document.getElementById('productSku');
  if (input) input.value = newSKU;
};

const loadProducts = () => {
    const products = getProducts();
    const tbody = document.getElementById('productsTableBody');

    tbody.innerHTML = products.map(p => `
        <tr>
            <td>
                <div class="table-image">
                    <img src="${p.image}" alt="${p.name}" title="${p.name}">
                </div>
            </td>
            <td>${p.sku}</td>
            <td>${p.name}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="showEditProduct(${p.id})" title="Editar producto">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="showBarcode(${p.id})" title="Ver código">
                        <i class="fas fa-barcode"></i>
                    </button>
                    <button class="action-btn" onclick="deleteProductConfirm(${p.id})" title="Eliminar" style="color: var(--danger-color);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

const validateNumericSKU = (v) => /^\d+$/.test(String(v));

// Comprimir imagen para reducir tamaño
const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Reducir tamaño si es muy grande
            const maxWidth = 1200;
            const maxHeight = 1200;
            
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir a base64 con compresión
            canvas.toBlob((blob) => {
                const compressedReader = new FileReader();
                compressedReader.onload = () => {
                    callback(compressedReader.result);
                };
                compressedReader.readAsDataURL(blob);
            }, 'image/jpeg', 0.8); // Calidad 80%
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

const handleAddProduct = (e) => {
    e.preventDefault();

    // Validar campos requeridos
    const productName = document.getElementById('productName').value.trim();
    const productPrice = document.getElementById('productPrice').value;
    const productStock = document.getElementById('productStock').value;

    if (!productName) {
        alert('El nombre del producto es obligatorio');
        return;
    }

    if (!productPrice || productPrice <= 0) {
        alert('El precio debe ser mayor a 0');
        return;
    }

    if (!productStock || productStock < 0) {
        alert('El stock no puede ser negativo');
        return;
    }

    const imageFile = document.getElementById('productImage').files[0];
    
    const handleImage = (imageData) => {
        try {
            const productData = {
                sku: '', // Se generará automáticamente en api.js
                name: productName,
                category: document.getElementById('productCategory').value,
                price: parseFloat(productPrice),
                stock: parseInt(productStock),
                description: document.getElementById('productDescription').value.trim(),
                image: imageData
            };

            addProduct(productData);
            e.target.reset();
            document.getElementById('imagePreviewContainer').style.display = 'none';
            alert('✅ Producto agregado exitosamente');
            updateDashboard();
            switchPage('products');
        } catch (error) {
            console.error('Error al agregar producto:', error);
            alert('Error al guardar el producto. El almacenamiento podría estar lleno.');
        }
    };

    if (imageFile) {
        // Validar tamaño máximo de archivo original (19MB)
        const maxSize = 19 * 1024 * 1024; // 19MB
        if (imageFile.size > maxSize) {
            alert('La imagen es demasiado grande. Máximo 19MB.');
            return;
        }

        // Comprimir imagen
        compressImage(imageFile, (compressedImage) => {
            handleImage(compressedImage);
        });
    } else {
        handleImage(null);
    }
};

window.deleteProductConfirm = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        deleteProduct(id);
        loadProducts();
        updateDashboard();
    }
};

window.showEditProduct = (id) => {
    const product = getProductById(id);
    if (!product) return;
    
    // Llenar el formulario con los datos del producto
    document.getElementById('editProductSku').value = product.sku;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductStock').value = product.stock;
    document.getElementById('editProductDescription').value = product.description;
    
    // Guardar el ID del producto para usarlo en el envío
    document.getElementById('editProductForm').setAttribute('data-product-id', id);
    
    // Abrir la modal
    document.getElementById('editProductModal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeEditProductModal = () => {
    document.getElementById('editProductModal').classList.remove('active');
    document.body.style.overflow = '';
};

window.handleEditProductSubmit = (e) => {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('editProductForm').getAttribute('data-product-id'));
    
    const updatedData = {
        name: document.getElementById('editProductName').value,
        category: document.getElementById('editProductCategory').value,
        price: parseFloat(document.getElementById('editProductPrice').value),
        stock: parseInt(document.getElementById('editProductStock').value),
        description: document.getElementById('editProductDescription').value
    };
    
    if (updateProduct(productId, updatedData)) {
        alert('✅ Producto actualizado exitosamente');
        closeEditProductModal();
        loadProducts();
        updateDashboard();
    } else {
        alert('❌ Error al actualizar el producto');
    }
};

// ========================
// CÓDIGOS DE BARRAS
// ========================

const showBarcode = (productId) => {
    const product = getProductById(productId);
    if (!product) return;

    document.getElementById('modalProductName').textContent = `${product.name} (${product.sku})`;

    // Usar canvas para dibujar nombre + código de barras
    const canvas = document.getElementById('barcodeCanvas');
    const ctx = canvas.getContext('2d');
    
    // Dimensiones
    canvas.width = 600;
    canvas.height = 300;
    
    // Fondo blanco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar nombre del producto
    ctx.fillStyle = '#333';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, canvas.width / 2, 40);
    
    // Separador
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 55);
    ctx.lineTo(canvas.width - 20, 55);
    ctx.stroke();
    
    // Crear SVG temporal para generar el barcode
    const tempSvgContainer = document.createElement('div');
    tempSvgContainer.style.display = 'none';
    tempSvgContainer.innerHTML = '<svg id="tempBarcode"></svg>';
    document.body.appendChild(tempSvgContainer);
    
    // Generar código de barras
    JsBarcode("#tempBarcode", product.sku, {
        format: "CODE128",
        width: 2,
        height: 80,
        displayValue: true,
        text: product.sku
    });
    
    // Pequeño retraso para asegurar que se dibuje el SVG
    setTimeout(() => {
        const svgElement = document.getElementById('tempBarcode');
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const urlImage = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = () => {
            // Dibujar la imagen del código de barras en el centro del canvas
            const x = (canvas.width - img.width) / 2;
            const y = 80;
            ctx.drawImage(img, x, y);
            URL.revokeObjectURL(urlImage);
        };
        img.onerror = () => {
            console.error('Error cargando imagen del código de barras');
            URL.revokeObjectURL(urlImage);
        };
        img.src = urlImage;
        
        // Limpiar después
        setTimeout(() => {
            tempSvgContainer.remove();
        }, 500);
    }, 100);

    document.getElementById('barcodeModal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

document.getElementById('barcodeModalClose')?.addEventListener('click', () => {
    document.getElementById('barcodeModal').classList.remove('active');
    document.body.style.overflow = '';
});

window.downloadBarcode = () => {
    const productName = document.getElementById('modalProductName').textContent.split(' (')[0];
    const canvas = document.getElementById('barcodeCanvas');
    
    if (!canvas || canvas.width === 0) {
        alert('No hay código de barras para descargar');
        return;
    }
    
    // Descargar la imagen del canvas
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = productName.replace(/\s+/g, '_') + '_barcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.printBarcode = () => {
    const canvas = document.getElementById('barcodeCanvas');
    
    if (!canvas || canvas.width === 0) {
        alert('No hay código de barras para imprimir');
        return;
    }
    
    // Crear ventana de impresión
    const printWindow = window.open('', '', 'width=800,height=600');
    const img = canvas.toDataURL('image/png');
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Imprimir Código de Barras</title>
            <style>
                body { text-align: center; padding: 20px; }
                img { max-width: 100%; }
            </style>
        </head>
        <body>
            <img src="${img}" />
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
};

// ========================
// ESCANEO
// ========================

const handleScan = (code) => {
  code = String(code).replace(/\D+/g, '');
    const product = getProductBySku(code);
    const resultDiv = document.getElementById('scanResult');

    if (product) {
        recordScan(product.id);
        resultDiv.innerHTML = `
            <div class="scan-product-info">
                <h3><i class="fas fa-check-circle"></i> Producto Encontrado</h3>
                <p><strong>Nombre:</strong> <span>${product.name}</span></p>
                <p><strong>SKU:</strong> <span>${product.sku}</span></p>
                <p><strong>Precio:</strong> <span>$${product.price.toFixed(2)}</span></p>
                <p><strong>Stock:</strong> <span>${product.stock} unidades</span></p>
                <p><strong>Descripción:</strong></p>
                <p>${product.description}</p>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="scan-product-info" style="border-color: var(--danger-color);">
                <h3 style="color: var(--danger-color);"><i class="fas fa-times-circle"></i> Producto No Encontrado</h3>
                <p>El código "<strong>${code}</strong>" no existe en el sistema.</p>
            </div>
        `;
    }

    document.getElementById('scanInput').value = '';
};

window.handleScan = handleScan;

// ========================
// BÚSQUEDA
// ========================

const performSearch = () => {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Por favor, ingresa un término de búsqueda');
        return;
    }

    const results = searchProducts(query);
    const tbody = document.getElementById('productsTableBody');

    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">No se encontraron productos</td></tr>';
        return;
    }

    tbody.innerHTML = results.map(p => `
        <tr>
            <td>
                <div class="table-image">
                    <img src="${p.image}" alt="${p.name}" title="${p.name}">
                </div>
            </td>
            <td>${p.sku}</td>
            <td>${p.name}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="showBarcode(${p.id})" title="Ver código">
                        <i class="fas fa-barcode"></i>
                    </button>
                    <button class="action-btn" onclick="deleteProductConfirm(${p.id})" title="Eliminar" style="color: var(--danger-color);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    switchPage('products');
};

// ========================
// REPORTES
// ========================

window.generateReport = (type) => {
    const products = getProducts();
    let content = '';
    let filename = '';

    switch (type) {
        case 'inventory':
            content = exportToCSV(products);
            filename = 'inventario.csv';
            break;
        case 'sales':
            content = 'SKU,Nombre,Precio,Stock,Valor Total\n';
            products.forEach(p => {
                content += `"${p.sku}","${p.name}",${p.price},${p.stock},${p.price * p.stock}\n`;
            });
            filename = 'ventas.csv';
            break;
        case 'barcodes':
            content = 'Código de Barras,SKU,Producto\n';
            products.forEach(p => {
                content += `"${p.barcode}","${p.sku}","${p.name}"\n`;
            });
            filename = 'codigos.csv';
            break;
        case 'history':
            content = 'Fecha,Descripción,Tipo\n';
            getActivities().forEach(a => {
                content += `"${new Date(a.timestamp).toLocaleString()}","${a.description}","${a.type}"\n`;
            });
            filename = 'historial.csv';
            break;
    }

    downloadFile(content, filename);
    alert('✅ Reporte descargado exitosamente');
};

const downloadFile = (content, filename) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

// ========================
// CONFIGURACIÓN
// ========================

window.setTheme = (theme) => {
    applyTheme(theme);
};

window.backupData = () => {
    const backup = createBackup();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(backup));
    element.setAttribute('download', `barcode-backup-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    alert('✅ Backup descargado exitosamente');
};

window.clearAllData = () => {
    if (confirm('⚠️ ¿Estás seguro? Esto eliminará TODOS los datos. Esta acción NO se puede deshacer.')) {
        if (confirm('⚠️ Última confirmación: ¿Deseas continuar?')) {
            localStorage.clear();
            alert('✅ Todos los datos han sido eliminados');
            location.reload();
        }
    }
};

// ========================
// VENTAS
// ========================

const loadSalesPage = () => {
    const saleProductSelect = document.getElementById('saleProduct');
    const products = getProducts();
    
    saleProductSelect.innerHTML = '<option value="">-- Seleccionar producto --</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (Stock: ${product.stock})`;
        saleProductSelect.appendChild(option);
    });
    
    // Establecer fecha de hoy por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('saleDate').value = today;
    
    // Registrar eventos del formulario
    const saleForm = document.getElementById('saleForm');
    if (saleForm) {
        saleForm.removeEventListener('submit', handleSaleSubmit);
        saleForm.addEventListener('submit', handleSaleSubmit);
        console.log('Event listener registrado en saleForm');
    }
    
    const saleQuantity = document.getElementById('saleQuantity');
    if (saleQuantity) {
        saleQuantity.removeEventListener('input', recalculateSaleTotal);
        saleQuantity.addEventListener('input', recalculateSaleTotal);
    }
    
    // Actualizar historial de ventas
    loadSalesTable();
    updateSalesSummary();
};

window.loadSalesPage = loadSalesPage;

const updateSalesSummary = () => {
    const sales = getSales();
    const totalCount = sales.length;
    const totalUnits = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalAmount = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    
    console.log('updateSalesSummary:', { totalCount, totalUnits, totalAmount, sales });
    
    const countElement = document.getElementById('totalSalesCount');
    const unitsElement = document.getElementById('totalUnitsSold');
    const amountElement = document.getElementById('totalSalesAmount');
    
    if (countElement) countElement.textContent = totalCount;
    if (unitsElement) unitsElement.textContent = totalUnits;
    if (amountElement) amountElement.textContent = '$' + totalAmount.toFixed(2);
};

const updateProductDetails = () => {
    const saleProductSelect = document.getElementById('saleProduct');
    const productId = parseInt(saleProductSelect.value);
    
    if (!productId) {
        document.getElementById('salePriceUnit').value = '';
        document.getElementById('saleStockAvailable').value = '';
        document.getElementById('saleTotalPrice').value = '$0.00';
        document.getElementById('saleQuantity').value = '';
        return;
    }
    
    const product = getProductById(productId);
    if (!product) return;
    
    // Guardar precio como atributo de datos para cálculos precisos
    document.getElementById('saleProduct').setAttribute('data-price', product.price);
    document.getElementById('salePriceUnit').value = `$${product.price.toFixed(2)}`;
    document.getElementById('saleStockAvailable').value = product.stock;
    document.getElementById('saleQuantity').value = '';
    document.getElementById('saleTotalPrice').value = '$0.00';
    
    recalculateSaleTotal();
};

window.updateProductDetails = updateProductDetails;

const recalculateSaleTotal = () => {
    const priceStr = document.getElementById('salePriceUnit').value || '0';
    const price = parseFloat(priceStr.replace('$', '')) || 0;
    const quantity = parseInt(document.getElementById('saleQuantity').value) || 0;
    const stockAvailable = parseInt(document.getElementById('saleStockAvailable').value) || 0;
    
    // Validar cantidad disponible
    const quantityInput = document.getElementById('saleQuantity');
    if (quantity > stockAvailable && quantity > 0) {
        quantityInput.style.borderColor = '#f5576c';
    } else {
        quantityInput.style.borderColor = 'var(--border-color)';
    }
    
    // Cálculo preciso
    const total = Math.round((price * quantity) * 100) / 100;
    document.getElementById('saleTotalPrice').value = `$${total.toFixed(2)}`;
};

window.recalculateSaleTotal = recalculateSaleTotal;

const handleSaleSubmit = (e) => {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('saleProduct').value);
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    const date = document.getElementById('saleDate').value;
    const notes = document.getElementById('saleNotes').value;
    
    if (!productId || !quantity || !date) {
        alert('Por favor, completa todos los campos requeridos');
        return;
    }
    
    const product = getProductById(productId);
    if (!product || product.stock < quantity) {
        alert('❌ Stock insuficiente para esta cantidad');
        return;
    }
    
    const result = addSale({
        productId: productId,
        quantity: quantity,
        date: date,
        notes: notes
    });
    
    console.log('Resultado addSale:', result);
    console.log('Ventas guardadas:', getSales());
    
    if (result.success) {
        alert('✅ Venta registrada exitosamente\n\nProducto: ' + result.sale.productName + '\nSKU: ' + result.sale.productSku + '\nCantidad: ' + result.sale.quantity + ' unidades\nPrecio Unitario: $' + result.sale.priceUnit.toFixed(2) + '\nTotal: $' + result.sale.totalPrice.toFixed(2));
        document.getElementById('saleForm').reset();
        document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('salePriceUnit').value = '';
        document.getElementById('saleStockAvailable').value = '';
        document.getElementById('saleTotalPrice').value = '$0.00';
        document.getElementById('saleQuantity').style.borderColor = 'var(--border-color)';
        
        setTimeout(() => {
            loadSalesTable();
            updateSalesSummary();
            updateDashboard();
            loadProducts();
        }, 100);
    } else {
        alert('❌ ' + result.message);
    }
};

window.handleSaleSubmit = handleSaleSubmit;

const loadSalesTable = () => {
    const sales = getSales();
    const tbody = document.getElementById('salesTableBody');
    
    console.log('loadSalesTable - Ventas cargadas:', sales);
    console.log('loadSalesTable - tbody encontrado:', tbody);
    
    if (!tbody) return;
    
    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">No hay ventas registradas</td></tr>';
        return;
    }
    
    // Ordenar ventas por fecha descendente (más recientes primero)
    const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedSales.map((sale, index) => `
        <tr>
            <td><strong>${new Date(sale.date).toLocaleDateString('es-ES')}</strong></td>
            <td><strong>${sale.productName}</strong></td>
            <td><code style="background: rgba(102,126,234,0.1); padding: 4px 8px; border-radius: 4px; font-weight: bold;">${sale.productSku}</code></td>
            <td style="text-align: center;"><strong>${sale.quantity}</strong></td>
            <td style="text-align: right;">$${sale.priceUnit.toFixed(2)}</td>
            <td style="text-align: right; font-weight: bold; color: #43e97b; font-size: 16px;">$${sale.totalPrice.toFixed(2)}</td>
            <td style="text-align: center;">
                <button class="action-btn-danger" onclick="deleteSaleRecord(${sale.id})" title="Eliminar venta">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

window.loadSalesTable = loadSalesTable;
window.updateSalesSummary = updateSalesSummary;

window.deleteSaleRecord = (saleId) => {
    if (confirm('¿Está seguro de que desea eliminar esta venta? Se devolverá el stock.')) {
        if (deleteSale(saleId)) {
            alert('✅ Venta eliminada y stock devuelto');
            loadSalesTable();
            updateSalesSummary();
            updateDashboard();
            loadProducts();
        } else {
            alert('❌ Error al eliminar la venta');
        }
    }
};

console.log('✨ BarCode Pro iniciado exitosamente');

// ========================
// ESCÁNER DE BARRAS (html5-qrcode) — versión final y única
// Requiere: <script src="https://unpkg.com/html5-qrcode@2.3.10/minified/html5-qrcode.min.js"></script>
// Requiere en HTML: <div id="reader" class="scanner"></div> (ya existe en tu index.html)
// ========================

let __html5qrcode = null;
let __scanning = false;
let __lastCodeAt = 0;
const __DUP_MS = 1200; // evita disparar el mismo código varias veces seguidas

function __onDetected(decodedText /*, decodedResult */) {
  const now = Date.now();
  if (!decodedText || now - __lastCodeAt < __DUP_MS) return;
  __lastCodeAt = now;

  // Beep (algunos navegadores móviles bloquean audio sin gesto del usuario)
  const beep = document.getElementById('beepAudio');
  if (beep) { try { beep.currentTime = 0; beep.play().catch(()=>{}); } catch(_) {} }

  // Usa tu lógica existente (renderiza en #scanResult, limpia input, etc.)
  try {
    handleScan(decodedText);
  } catch (e) {
    console.error('Error en handleScan:', e);
  }
}

async function __startScanner() {
  if (__scanning) return;

  const containerId = "reader";
  const formats = [
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.CODE_39
  ];

  if (!__html5qrcode) {
    __html5qrcode = new Html5Qrcode(containerId, { formatsToSupport: formats });
  }

  const config = {
    fps: 12,                                 // rendimiento
    qrbox: { width: 300, height: 140 },      // “panorámico” para 1D (barras)
    aspectRatio: 1.7778,                     // 16:9
    experimentalFeatures: { useBarCodeDetectorIfSupported: true } // usa API nativa si existe
  };

  try {
    await __html5qrcode.start(
      { facingMode: "environment" },         // prioriza cámara trasera
      config,
      __onDetected,
      () => {}                               // onScanFailure opcional
    );
    __scanning = true;
  } catch (err) {
    console.error('No se pudo iniciar la cámara:', err);
    const help = document.getElementById('scanResult');
    if (help) {
      help.innerHTML = `
        <div class="scan-product-info" style="border-color: var(--warning-color);">
          <h3 style="color: var(--warning-color);">
            <i class="fas fa-exclamation-triangle"></i> Cámara no disponible
          </h3>
          <p>Permite el acceso a la cámara o usa la barra inferior para ingresar el código manualmente.</p>
        </div>`;
    }
    document.getElementById('scanInput')?.focus();
  }
}

async function __stopScanner() {
  if (!__html5qrcode || !__scanning) return;
  try {
    await __html5qrcode.stop();
    await __html5qrcode.clear();
  } catch (e) {
    console.warn('Error al detener la cámara:', e);
  } finally {
    __scanning = false;
  }
}

// ------- Modal de permisos (UX) -------
function __openPermissionModal() {
  document.getElementById('cameraPermissionModal')?.classList.add('active');
}
function __closePermissionModal() {
  document.getElementById('cameraPermissionModal')?.classList.remove('active');
}

/**
 * Dispara el prompt nativo de permisos y, si conceden, arranca el lector real.
 * Si el usuario deniega, muestra fallback al ingreso manual.
 */
async function requestCameraPermissionAndStart() {
  try {
    // Prompt nativo de permisos (stream temporal)
    const tmpStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    tmpStream.getTracks().forEach(t => t.stop()); // cerramos stream temporal
    __closePermissionModal();
    await __startScanner();
  } catch (err) {
    console.warn('Permiso denegado o error al solicitar cámara:', err);
    __closePermissionModal();
    const help = document.getElementById('scanResult');
    if (help) {
      help.innerHTML = `
        <div class="scan-product-info" style="border-color: var(--danger-color);">
          <h3 style="color: var(--danger-color);">
            <i class="fas fa-times-circle"></i> No se pudo usar la cámara
          </h3>
          <p>Puedes ingresar el código manualmente en la barra inferior.</p>
        </div>`;
    }
    document.getElementById('scanInput')?.focus();
  }
}

/**
 * Al entrar en la pestaña "Escanear":
 * - Si el permiso está concedido → inicia directo.
 * - Si está denegado → muestra aviso y deja el input manual.
 * - Si requiere prompt → abre el modal para pedir permiso.
 */
async function __prepareScanPage() {
  // Enlaza botones del modal (si existen en el DOM)
  document.getElementById('permGrantBtn')?.addEventListener('click', requestCameraPermissionAndStart);
  document.getElementById('permCancelBtn')?.addEventListener('click', () => { __closePermissionModal(); document.getElementById('scanInput')?.focus(); });
  document.getElementById('permCloseBtn')?.addEventListener('click', () => { __closePermissionModal(); document.getElementById('scanInput')?.focus(); });

  try {
    if (navigator.permissions && navigator.permissions.query) {
      const status = await navigator.permissions.query({ name: 'camera' });
      if (status.state === 'granted') {
        await __startScanner();
        return;
      }
      if (status.state === 'denied') {
        const help = document.getElementById('scanResult');
        if (help) {
          help.innerHTML = `
            <div class="scan-product-info" style="border-color: var(--warning-color);">
              <h3 style="color: var(--warning-color);">
                <i class="fas fa-exclamation-circle"></i> Acceso a cámara denegado
              </h3>
              <p>Activa el permiso en los ajustes del navegador o ingresa el código manualmente.</p>
            </div>`;
        }
        document.getElementById('scanInput')?.focus();
        return;
      }
      // state === 'prompt'
      __openPermissionModal();
      return;
    }
    // Sin Permissions API → muestra modal para solicitar permiso
    __openPermissionModal();
  } catch (e) {
    console.warn('Permissions API no disponible o con error:', e);
    __openPermissionModal();
  }
}

// Enlaza el ciclo de vida del escáner al cambio de pestañas de tu app
(function () {
  const originalSwitchPage = window.switchPage;
  window.switchPage = function (page) {
    originalSwitchPage(page);
    if (page === 'scan') {
      __prepareScanPage();   // Entrando a "Escanear" → pedir/gestionar permisos y arrancar
    } else {
      __stopScanner();       // Saliendo de "Escanear" → liberar la cámara
    }
  };
})();
