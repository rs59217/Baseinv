// ========================
// API.JS - Gestión de Datos
// ========================

// SOPORTE HYBRID: Firebase + localStorage
// Si Firebase está disponible, usa Firestore; si no, usa localStorage

const PRODUCTS_STORAGE_KEY = 'barcode_products';
const ACTIVITIES_STORAGE_KEY = 'barcode_activities';
const SCANS_STORAGE_KEY = 'barcode_scans';
const SALES_STORAGE_KEY = 'barcode_sales';

// ========================
// FUNCIONES AUXILIARES FIREBASE
// ========================

const syncToFirebase = async (collectionName, data) => {
    if (!isFirebaseReady()) return false;
    try {
        await firebase.firestore().collection(collectionName).add({
            ...data,
            syncedAt: new Date(),
            syncSource: 'barcode-pro'
        });
        console.log(`✅ Sincronizado con Firebase: ${collectionName}`, data);
        return true;
    } catch (error) {
        console.error('Error sincronizando con Firebase:', error);
        return false;
    }
};

const updateInFirebase = async (collectionName, docId, data) => {
    if (!isFirebaseReady()) return false;
    try {
        // Buscar documento por ID local
        const querySnapshot = await firebase.firestore()
            .collection(collectionName)
            .where('id', '==', docId)
            .get();
        
        if (querySnapshot.empty) {
            // Si no existe, crearlo
            return await syncToFirebase(collectionName, { id: docId, ...data });
        }
        
        // Actualizar primer documento encontrado
        const docRef = querySnapshot.docs[0].ref;
        await docRef.update({
            ...data,
            updatedAt: new Date(),
            syncedAt: new Date()
        });
        console.log(`✅ Actualizado en Firebase: ${collectionName}/${docId}`);
        return true;
    } catch (error) {
        console.error('Error actualizando Firebase:', error);
        return false;
    }
};

const deleteFromFirebase = async (collectionName, docId) => {
    if (!isFirebaseReady()) return false;
    try {
        // Buscar documento por ID local
        const querySnapshot = await firebase.firestore()
            .collection(collectionName)
            .where('id', '==', docId)
            .get();
        
        if (!querySnapshot.empty) {
            // Eliminar primer documento encontrado
            await querySnapshot.docs[0].ref.delete();
            console.log(`✅ Eliminado de Firebase: ${collectionName}/${docId}`);
            return true;
        }
        return true;
    } catch (error) {
        console.error('Error eliminando de Firebase:', error);
        return false;
    }
};

const getFromFirebase = async (collectionName) => {
    if (!isFirebaseReady()) return null;
    try {
        const querySnapshot = await firebase.firestore().collection(collectionName).get();
        return querySnapshot.docs.map(doc => ({
            _firebaseId: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error obteniendo de Firebase:', error);
        return null;
    }
};

// Productos por defecto de demo
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        sku: '000001',
        name: 'Laptop Dell XPS 13',
        category: 'Electrónica',
        price: 1299.99,
        stock: 15,
        description: 'Laptop ultralight con procesador Intel i7',
        barcode: '000001',
        image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23667eea%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22 fill=%22white%22 font-weight=%22bold%22%3ELaptop%3C/text%3E%3C/svg%3E',
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        sku: '000002',
        name: 'iPhone 15 Pro',
        category: 'Electrónica',
        price: 999.99,
        stock: 25,
        description: 'Smartphone premium con cámara avanzada',
        barcode: '000002',
        image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f093fb%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22 fill=%22white%22 font-weight=%22bold%22%3EiPhone%3C/text%3E%3C/svg%3E',
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        sku: '000003',
        name: 'Camiseta Cotton Premium',
        category: 'Ropa',
        price: 29.99,
        stock: 100,
        description: 'Camiseta de algodón de alta calidad',
        barcode: '000003',
        image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%2243e97b%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22 fill=%22white%22 font-weight=%22bold%22%3ECamiseta%3C/text%3E%3C/svg%3E',
        createdAt: new Date().toISOString()
    }
];

// Generar SKU automático (solo números)
const normalizeSKU = (sku, length = 6) => {
  const digits = String(sku || '').replace(/\D+/g, '');
  return digits.padStart(length, '0').slice(-length);
};

const generateSKU = () => {
  // Genera un número de 6 dígitos y garantiza que no exista en productos actuales
  const existing = new Set(getProducts().map(p => String(p.sku)));
  let sku;
  do {
    sku = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  } while (existing.has(sku));
  return sku;
};

// Obtener todos los productos
const getProducts = () => {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
    }
    return JSON.parse(stored);
};

// Guardar products
const saveProducts = (products) => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
};

// Agregar producto
const addProduct = (productData) => {
    const products = getProducts();
    const newProduct = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        sku: (productData.sku ? normalizeSKU(productData.sku) : generateSKU()),
        name: productData.name,
        category: productData.category,
        price: productData.price,
        stock: productData.stock,
        description: productData.description,
        image: productData.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ccc%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2218%22 fill=%22%23999%22%3ESin imagen%3C/text%3E%3C/svg%3E',
        barcode: (productData.sku ? normalizeSKU(productData.sku) : generateSKU()),
        createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    saveProducts(products);
    
    // Sincronizar con Firebase
    if (isFirebaseReady()) {
        syncToFirebase('barcode_products', newProduct).catch(err => {
            console.warn('No se sincronizó con Firebase, pero se guardó localmente:', err);
        });
    }
    
    addActivity(`Producto "${productData.name}" creado`);
    return newProduct;
};

// Actualizar producto
const updateProduct = (id, updatedData) => {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    const product = products[index];
    const oldName = product.name;
    
    // Actualizar campos
    product.name = updatedData.name;
    product.category = updatedData.category;
    product.price = updatedData.price;
    product.stock = updatedData.stock;
    product.description = updatedData.description;
    product.updatedAt = new Date().toISOString();
    
    // Si se proporciona una nueva imagen, actualizar
    if (updatedData.image) {
        product.image = updatedData.image;
    }
    
    products[index] = product;
    saveProducts(products);
    
    // Sincronizar con Firebase
    if (isFirebaseReady()) {
        updateInFirebase('barcode_products', product.id, product).catch(err => {
            console.warn('No se sincronizó actualización con Firebase:', err);
        });
    }
    
    addActivity(`Producto "${oldName}" actualizado`);
    
    return true;
};

// Eliminar producto
const deleteProduct = (id) => {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
    
    // Sincronizar con Firebase
    if (isFirebaseReady() && product) {
        deleteFromFirebase('barcode_products', id).catch(err => {
            console.warn('No se sincronizó eliminación con Firebase:', err);
        });
    }
    
    if (product) {
        addActivity(`Producto "${product.name}" eliminado`);
    }
};

// Obtener producto por ID
const getProductById = (id) => {
    const products = getProducts();
    return products.find(p => p.id === id);
};

// Buscar productos
const searchProducts = (query) => {
    const products = getProducts();
    const lower = query.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(lower) ||
        p.sku.toLowerCase().includes(lower) ||
        p.barcode.toLowerCase().includes(lower)
    );
};

// Obtener producto por SKU
const getProductBySku = (sku) => {
    const products = getProducts();
    return products.find(p => p.sku === sku || p.barcode === sku);
};

// ========================
// ACTIVIDADES
// ========================

const getActivities = () => {
    const stored = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const saveActivities = (activities) => {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
};

const addActivity = (description, type = 'info') => {
    const activity = {
        id: Date.now(),
        description,
        type,
        timestamp: new Date().toISOString()
    };
    
    const activities = getActivities();
    activities.unshift(activity);
    
    // Mantener solo las últimas 50 actividades
    if (activities.length > 50) {
        activities.length = 50;
    }
    
    saveActivities(activities);
    
    // Sincronizar con Firebase
    if (isFirebaseReady()) {
        syncToFirebase('barcode_activities', activity).catch(err => {
            console.warn('No se sincronizó actividad con Firebase:', err);
        });
    }
};

// ========================
// ESCANEOS
// ========================

const getScans = () => {
    const stored = localStorage.getItem(SCANS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const saveScans = (scans) => {
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scans));
};

const recordScan = (productId) => {
    const scans = getScans();
    const product = getProductById(productId);
    
    if (product) {
        scans.unshift({
            id: Date.now(),
            productId,
            productName: product.name,
            sku: product.sku,
            timestamp: new Date().toISOString()
        });
        
        // Mantener solo los últimos 100 escaneos
        if (scans.length > 100) {
            scans.length = 100;
        }
        
        saveScans(scans);
        addActivity(`Código escaneado: ${product.name}`, 'scan');
    }
};

// ========================
// ESTADÍSTICAS
// ========================

const getStats = () => {
    const products = getProducts();
    const activities = getActivities();
    const scans = getScans();
    
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    return {
        totalProducts: products.length,
        totalBarcodes: products.length,
        totalScans: scans.length,
        totalValue: totalValue,
        totalSales: getTotalSales(),
        recentProducts: products.slice(-5).reverse(),
        recentActivities: activities.slice(0, 10)
    };
};

// ========================
// BACKUP Y RESTORE
// ========================

const createBackup = () => {
    const backup = {
        products: getProducts(),
        activities: getActivities(),
        scans: getScans(),
        date: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
};

const restoreBackup = (backupData) => {
    try {
        const backup = JSON.parse(backupData);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(backup.products));
        localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(backup.activities));
        localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(backup.scans));
        addActivity('Datos restaurados desde backup', 'info');
        return true;
    } catch (e) {
        console.error('Error al restaurar backup:', e);
        return false;
    }
};

// ========================
// EXPORTAR DATOS
// ========================

const exportToCSV = (products) => {
    let csv = 'SKU,Nombre,Categoría,Precio,Stock,Descripción\n';
    
    products.forEach(p => {
        csv += `"${p.sku}","${p.name}","${p.category}",${p.price},${p.stock},"${p.description}"\n`;
    });
    
    return csv;
};

// ========================
// VENTAS
// ========================

const getSales = () => {
    const sales = localStorage.getItem(SALES_STORAGE_KEY);
    return sales ? JSON.parse(sales) : [];
};

const addSale = (saleData) => {
    const sales = getSales();
    const product = getProductById(saleData.productId);
    
    if (!product || product.stock < saleData.quantity) {
        return { success: false, message: 'Stock insuficiente' };
    }
    
    // Reducir stock
    product.stock -= saleData.quantity;
    const products = getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
        products[index] = product;
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        
        // Sincronizar cambio de stock con Firebase
        if (isFirebaseReady()) {
            updateInFirebase('barcode_products', product.id, { stock: product.stock }).catch(err => {
                console.warn('No se sincronizó stock con Firebase:', err);
            });
        }
    }
    
    // Registrar venta
    const sale = {
        id: Date.now(),
        productId: saleData.productId,
        productName: product.name,
        productSku: product.sku,
        quantity: saleData.quantity,
        priceUnit: product.price,
        totalPrice: product.price * saleData.quantity,
        date: saleData.date,
        notes: saleData.notes || '',
        createdAt: new Date().toISOString()
    };
    
    sales.push(sale);
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    
    // Sincronizar venta con Firebase
    if (isFirebaseReady()) {
        syncToFirebase('barcode_sales', sale).catch(err => {
            console.warn('No se sincronizó venta con Firebase:', err);
        });
    }
    
    // Registrar actividad
    addActivity(`Venta registrada: ${product.name} (${saleData.quantity} unidades)`, 'sale');
    
    return { success: true, sale: sale };
};

const deleteSale = (saleId) => {
    const sales = getSales();
    const sale = sales.find(s => s.id === saleId);
    
    if (!sale) return false;
    
    // Devolver stock
    const product = getProductBySku(sale.productSku);
    if (product) {
        product.stock += sale.quantity;
        const products = getProducts();
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = product;
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        }
    }
    
    // Eliminar venta
    const newSales = sales.filter(s => s.id !== saleId);
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(newSales));
    addActivity(`Venta eliminada: ${sale.productName}`, 'delete');
    
    return true;
};

const getSalesByDate = (startDate, endDate) => {
    const sales = getSales();
    return sales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });
};

const getTotalSales = () => {
    const sales = getSales();
    return sales.reduce((total, sale) => total + sale.totalPrice, 0);
};

// Exportar función getSales para debugging
window.getSales = getSales;
window.addSale = addSale;
window.deleteSale = deleteSale;
window.updateProduct = updateProduct;

