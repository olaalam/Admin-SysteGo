import React, { useState, useRef, useEffect } from 'react';
import { Search, Trash2, Plus, FileText, Loader as LoaderIcon, Scan, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode'; // المكتبة الجديدة
import Loader from '@/components/Loader';
import useGet from '@/hooks/useGet';
import usePost from '@/hooks/usePost';

const PrintBarcode = () => {
  // جلب البيانات من الـ API
  const { data: productsData, loading: productsLoading, error: productsError } = useGet('/api/admin/product');
  const { data: sizesData, loading: sizesLoading, error: sizesError } = useGet('/api/admin/label/sizes');
  const { postData: generateLabels, loading: isSubmitting } = usePost('/api/admin/label/generate');

  // حالات الـ State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedPaperSize, setSelectedPaperSize] = useState('');
  const [isScanning, setIsScanning] = useState(false); // للكيبورد/الفوكس
  const [showCamera, setShowCamera] = useState(false); // لفتح الكاميرا
  const scanInputRef = useRef(null);
  const [labelConfig, setLabelConfig] = useState({
    showProductName: true,
    showPrice: true,
    showPromotionalPrice: true,
    showBusinessName: true,
    showBrand: true,
    productNameSize: 15,
    priceSize: 15,
    businessNameSize: 15,
    brandSize: 15
  });

  const products = productsData?.products || [];
  const labelSizes = sizesData?.labelSizes || [];

  // --- منطق الكاميرا (Scanner) ---
  useEffect(() => {
    let scanner = null;
    if (showCamera) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      });

      scanner.render((decodedText) => {
        handleBarcodeScanned(decodedText);
        setShowCamera(false); // اغلاق الكاميرا بعد المسح الناجح
        scanner.clear();
      }, (error) => {
        // خطأ البحث المستمر - نتجاهله
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [showCamera]);

  // --- البحث اليدوي ---
  const filteredProducts = products.filter(product => {
    const search = searchTerm.toLowerCase();
    const matchesName = product.name?.toLowerCase().includes(search) || 
                        product.ar_name?.toLowerCase().includes(search);
    const matchesCode = product.prices?.some(price => 
      price.code?.toLowerCase().includes(search)
    );
    return matchesName || matchesCode;
  });

  const addProduct = (product, priceVariation) => {
    const exists = selectedProducts.find(
      p => p.productId === product._id && p.productPriceId === priceVariation._id
    );
    
    if (!exists) {
      setSelectedProducts([...selectedProducts, {
        productId: product._id,
        productPriceId: priceVariation._id,
        quantity: 1,
        productName: product.name,
        code: priceVariation.code,
        price: priceVariation.price
      }]);
    }
    setSearchTerm('');
  };

  const handleBarcodeScanned = (scannedCode) => {
    if (!scannedCode) return;
    for (const product of products) {
      const priceMatch = product.prices?.find(p => p.code === scannedCode);
      if (priceMatch) {
        addProduct(product, priceMatch);
        setIsScanning(false);
        return;
      }
    }
    alert(`Product with code "${scannedCode}" not found`);
  };

  useEffect(() => {
    if (isScanning && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [isScanning]);

  const handleScanKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBarcodeScanned(searchTerm.trim());
    }
  };

  const removeProduct = (productPriceId) => {
    setSelectedProducts(selectedProducts.filter(p => p.productPriceId !== productPriceId));
  };

  const updateQuantity = (productPriceId, quantity) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.productPriceId === productPriceId ? { ...p, quantity: parseInt(quantity) || 1 } : p
    ));
  };

  // --- دالة الـ Submit (الطباعة) ---
  const handleSubmit = async () => {
    if (selectedProducts.length === 0 || !selectedPaperSize) {
      alert('الرجاء اختيار المنتجات وحجم الورقة');
      return;
    }

    const payload = {
      products: selectedProducts.map(p => ({
        productId: p.productId,
        productPriceId: p.productPriceId,
        quantity: p.quantity
      })),
      labelConfig: { ...labelConfig, 
        productNameSize: parseInt(labelConfig.productNameSize),
        priceSize: parseInt(labelConfig.priceSize),
        businessNameSize: parseInt(labelConfig.businessNameSize),
        brandSize: parseInt(labelConfig.brandSize)
      },
      paperSize: selectedPaperSize
    };

    try {
      const responseData = await generateLabels(payload, null, { responseType: 'blob' });
      const url = window.URL.createObjectURL(responseData);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 1200);
      };
    } catch (error) {
      console.error('Error generating labels:', error);
    }
  };

  // --- Barcode Preview Component ---
  const BarcodePreview = ({ product, size, labelConfig, businessName }) => {
    const getPreviewStyle = () => {
      const dimensions = size.labelSize.match(/(\d+\.?\d*)mm\s*×\s*(\d+\.?\d*)mm/);
      if (!dimensions) return { width: '150px', height: '80px' };
      const width = parseFloat(dimensions[1]) * 3.5;
      const height = parseFloat(dimensions[2]) * 3.5;
      return { width: `${Math.min(width, 250)}px`, height: `${Math.min(height, 150)}px` };
    };

    return (
      <div className="border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center bg-white overflow-hidden shadow-md mx-auto p-1" style={getPreviewStyle()}>
        <div className="text-center w-full">
          {labelConfig.showBusinessName && <div className="font-bold leading-tight" style={{ fontSize: `${labelConfig.businessNameSize}px` }}>{businessName}</div>}
          {labelConfig.showProductName && <div className="font-semibold leading-tight mt-1" style={{ fontSize: `${labelConfig.productNameSize}px` }}>{product.productName}</div>}
          <svg className="mx-auto my-1" width="90%" height="30" viewBox="0 0 100 35">
            {[2,1,3,1,2,4,1,2,1,3,2,1,4,1,2,3].map((w, i) => <rect key={i} x={i*5 + 5} y="0" width={w} height="35" fill="black"/>)}
          </svg>
          <div className="text-[10px] tracking-wider">{product.code}</div>
          {labelConfig.showPrice && <div className="font-bold mt-1" style={{ fontSize: `${labelConfig.priceSize}px` }}>${product.price}</div>}
        </div>
      </div>
    );
  };

  if (productsLoading || sizesLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Print Barcode</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Add Product Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Add Product *</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsScanning(!isScanning)}
                    className={`p-3 ${isScanning ? 'bg-purple-600' : 'bg-gray-400'}`}
                    title="Manual Scanner Mode (Keyboard)"
                  >
                    <Scan className="w-5 h-5 text-white" />
                  </button>
                  <input
                    ref={scanInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={isScanning ? handleScanKeyDown : undefined}
                    placeholder={isScanning ? "Waiting for barcode..." : "Search product..."}
                    className="flex-1 p-3 outline-none"
                  />
                </div>

                {/* Search Results Dropdown */}
                {searchTerm && !isScanning && filteredProducts.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {filteredProducts.map(product => (
                      product.prices?.map(priceVar => (
                        <div key={priceVar._id} onClick={() => addProduct(product, priceVar)} className="p-3 hover:bg-purple-50 cursor-pointer border-b flex justify-between">
                          <div>
                            <div className="font-medium">{priceVar.code}</div>
                            <div className="text-xs text-gray-500">{product.name}</div>
                          </div>
                          <div className="text-purple-600 font-bold">${priceVar.price}</div>
                        </div>
                      ))
                    ))}
                  </div>
                )}
              </div>

              {/* Camera Button */}
              <button
                onClick={() => setShowCamera(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg flex items-center gap-2"
              >
                <Scan className="w-5 h-5" />
                Open Camera
              </button>
            </div>
          </div>

          {/* Camera Scanner Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-4 w-full max-w-lg relative">
                <button 
                  onClick={() => setShowCamera(false)}
                  className="absolute -top-10 right-0 text-white flex items-center gap-1"
                >
                  <X /> Close
                </button>
                <div id="reader" className="overflow-hidden rounded-lg"></div>
                <p className="text-center text-sm text-gray-500 mt-2">Point the camera at the barcode</p>
              </div>
            </div>
          )}

          {/* Selected Products Table */}
          {selectedProducts.length > 0 && (
            <div className="mb-6 overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map(product => (
                    <tr key={product.productPriceId} className="border-t">
                      <td className="px-4 py-3">{product.productName}</td>
                      <td className="px-4 py-3">{product.code}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number" min="1"
                          value={product.quantity}
                          onChange={(e) => updateQuantity(product.productPriceId, e.target.value)}
                          className="w-16 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeProduct(product.productPriceId)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 mx-auto" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
            {['productName', 'price', 'businessName', 'brand'].map((item) => (
              <div key={item}>
                <label className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={labelConfig[`show${item.charAt(0).toUpperCase() + item.slice(1)}`]}
                    onChange={(e) => setLabelConfig({...labelConfig, [`show${item.charAt(0).toUpperCase() + item.slice(1)}`]: e.target.checked})}
                  />
                  <span className="text-sm font-medium capitalize">{item.replace(/([A-Z])/g, ' $1')}</span>
                </label>
                <input
                  type="number"
                  value={labelConfig[`${item}Size`]}
                  onChange={(e) => setLabelConfig({...labelConfig, [`${item}Size`]: e.target.value})}
                  className="w-full border rounded p-1 text-sm"
                  placeholder="Size"
                />
              </div>
            ))}
          </div>

          {/* Paper Size & Preview */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Paper Size *</label>
            <select
              value={selectedPaperSize}
              onChange={(e) => setSelectedPaperSize(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-4"
            >
              <option value="">Choose size...</option>
              {labelSizes.map(size => (
                <option key={size.id} value={size.id}>{size.name} ({size.labelSize})</option>
              ))}
            </select>

            {selectedPaperSize && selectedProducts.length > 0 && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <div className="flex flex-wrap gap-4 justify-center">
                  {selectedProducts.slice(0, 3).map((prod, i) => (
                    <BarcodePreview 
                      key={i} product={prod} 
                      size={labelSizes.find(s => s.id === selectedPaperSize)} 
                      labelConfig={labelConfig} 
                      businessName="WegoStation"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedProducts.length === 0 || !selectedPaperSize}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {isSubmitting ? <LoaderIcon className="animate-spin" /> : <FileText />}
            {isSubmitting ? 'Generating PDF...' : 'Generate & Print Labels'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintBarcode;