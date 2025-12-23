import React, { useState,  useEffect } from 'react';
import { Search, Trash2, Plus, FileText, Loader as LoaderIcon, Scan, X, Upload } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import Loader from '@/components/Loader';
import useGet from '@/hooks/useGet';
import usePost from '@/hooks/usePost';
import { toast } from 'react-toastify';

const PrintBarcode = () => {
  // Data Fetching
  const { data: productsData, loading: productsLoading } = useGet('/api/admin/product');
  const { data: sizesData, loading: sizesLoading } = useGet('/api/admin/label/sizes');
  const { postData: generateLabels, loading: isSubmitting } = usePost('/api/admin/label/generate');

  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedPaperSize, setSelectedPaperSize] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  
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

  // --- 1. Filter Logic ---
  const filteredProducts = products.filter(product => {
    const search = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) || 
      product.ar_name?.toLowerCase().includes(search)
    );
  });

  // --- 2. Camera & File Upload Logic ---
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
        setShowCamera(false);
        scanner.clear();
      }, (error) => { /* Ignore constant scanning errors */ });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [showCamera]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("reader");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleBarcodeScanned(decodedText);
      setShowCamera(false);
    } catch (err) {
      toast.error("No barcode found in the selected image.",err);
    }
  };

  // --- 3. Selection Actions ---
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

  const updateQuantity = (priceId, val) => {
    const quantity = parseInt(val) || 1;
    setSelectedProducts(selectedProducts.map(p => 
      p.productPriceId === priceId ? { ...p, quantity } : p
    ));
  };

  const removeProduct = (priceId) => {
    setSelectedProducts(selectedProducts.filter(p => p.productPriceId !== priceId));
  };

  const handleBarcodeScanned = (scannedCode) => {
    if (!scannedCode) return;
    for (const product of products) {
      const priceMatch = product.prices?.find(p => p.code === scannedCode);
      if (priceMatch) {
        addProduct(product, priceMatch);
        return;
      }
    }
    toast.error(`Product with code "${scannedCode}" not found.`);
  };

  // --- 4. Print Logic ---
  const handleSubmit = async () => {
    if (selectedProducts.length === 0 || !selectedPaperSize) {
      toast.warn('Please select products and a paper size.');
      return;
    }

    const payload = {
      products: selectedProducts.map(p => ({
        productId: p.productId,
        productPriceId: p.productPriceId,
        quantity: p.quantity
      })),
      labelConfig: { 
        ...labelConfig, 
        productNameSize: parseInt(labelConfig.productNameSize),
        priceSize: parseInt(labelConfig.priceSize),
        businessNameSize: parseInt(labelConfig.businessNameSize),
        brandSize: parseInt(labelConfig.brandSize)
      },
      paperSize: selectedPaperSize
    };

    try {
      const responseData = await generateLabels(payload, null, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([responseData]));
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
      <div className="border border-gray-300 rounded bg-white shadow-sm p-2 flex flex-col items-center justify-center text-center overflow-hidden" style={getPreviewStyle()}>
        {labelConfig.showBusinessName && <div className="font-bold uppercase tracking-tighter leading-none mb-1 text-gray-800" style={{ fontSize: `${labelConfig.businessNameSize}px` }}>{businessName}</div>}
        {labelConfig.showProductName && <div className="font-medium leading-none mb-1 line-clamp-1" style={{ fontSize: `${labelConfig.productNameSize}px` }}>{product.productName}</div>}
        <div className="bg-black w-full h-8 mb-1"></div>
        <div className="text-[10px] mb-1 font-mono">{product.code}</div>
        {labelConfig.showPrice && <div className="font-black" style={{ fontSize: `${labelConfig.priceSize}px` }}>${product.price}</div>}
      </div>
    );
  };

  if (productsLoading || sizesLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="ltr">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Print Barcode System</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          {/* Search Section */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Search Product (By Name)</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="flex items-center border-2 border-gray-200 rounded-lg focus-within:border-purple-500 transition-all overflow-hidden">
                  <div className="p-3 bg-gray-50 border-r">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type product name here..."
                    className="flex-1 p-3 outline-none bg-transparent"
                  />
                </div>

                {searchTerm && filteredProducts.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <div key={product._id} className="p-3 hover:bg-purple-50 border-b last:border-0 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">{product.name}</span>
                          <span className="text-xs text-gray-400 uppercase tracking-widest">{product.category?.name}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.prices?.map(pv => (
                            <button 
                              key={pv._id}
                              onClick={() => addProduct(product, pv)}
                              className="text-xs bg-white border border-purple-200 hover:border-purple-500 px-2 py-1 rounded-md flex items-center gap-1 transition-all"
                            >
                              <Plus className="w-3 h-3 text-purple-600" />
                              <span className="font-mono">{pv.code}</span> - <span className="text-purple-700 font-bold">${pv.price}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowCamera(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Scan className="w-5 h-5" /> Scan / Upload
              </button>
            </div>
          </div>

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-2xl">
                <button onClick={() => setShowCamera(false)} className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold bg-red-500/20 px-4 py-2 rounded-full hover:bg-red-500 transition-all">
                  <X className="w-5 h-5" /> Close
                </button>
                <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Scan Product Barcode</h2>
                <div id="reader" className="overflow-hidden rounded-xl bg-gray-100 border-2 border-dashed border-gray-300"></div>
                <div className="mt-6 border-t pt-6">
                  <p className="text-center text-sm font-semibold text-gray-500 mb-3">OR UPLOAD BARCODE IMAGE</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Selected Products Table */}
          {selectedProducts.length > 0 && (
            <div className="mb-8 overflow-hidden border border-gray-200 rounded-xl shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600">Product Details</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600">Barcode Code</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600">Print Quantity</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedProducts.map(product => (
                    <tr key={product.productPriceId} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{product.productName}</td>
                      <td className="px-6 py-4 font-mono text-purple-600">{product.code}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number" min="1"
                          value={product.quantity}
                          onChange={(e) => updateQuantity(product.productPriceId, e.target.value)}
                          className="w-20 border-2 border-gray-100 rounded-lg px-3 py-1.5 focus:border-purple-400 outline-none transition-all font-bold"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => removeProduct(product.productPriceId)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Settings Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
            {['productName', 'price', 'businessName', 'brand'].map((item) => (
              <div key={item} className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    checked={labelConfig[`show${item.charAt(0).toUpperCase() + item.slice(1)}`]}
                    onChange={(e) => setLabelConfig({...labelConfig, [`show${item.charAt(0).toUpperCase() + item.slice(1)}`]: e.target.checked})}
                  />
                  <span className="text-xs font-bold text-gray-700 capitalize group-hover:text-purple-600 transition-colors">{item.replace(/([A-Z])/g, ' $1')}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={labelConfig[`${item}Size`]}
                    onChange={(e) => setLabelConfig({...labelConfig, [`${item}Size`]: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-purple-400 shadow-sm"
                  />
                  <span className="text-[10px] text-gray-400">px</span>
                </div>
              </div>
            ))}
          </div>

          {/* Paper Selection and Preview */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" /> Paper Format Selection
            </h3>
            <select
              value={selectedPaperSize}
              onChange={(e) => setSelectedPaperSize(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white hover:border-purple-300 transition-all outline-none font-medium mb-6 shadow-sm"
            >
              <option value="">Select Paper Size (e.g. 50mm x 30mm)</option>
              {labelSizes.map(size => (
                <option key={size.id} value={size.id}>{size.name} — ({size.labelSize})</option>
              ))}
            </select>

            {selectedPaperSize && selectedProducts.length > 0 && (
              <div className="p-8 bg-gray-100/50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-center text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-4">Live Preview</p>
                <div className="flex flex-wrap gap-6 justify-center">
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
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-purple-200 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none flex items-center justify-center gap-3"
          >
            {isSubmitting ? <LoaderIcon className="animate-spin" /> : <FileText className="w-6 h-6" />}
            {isSubmitting ? 'GENERATING PRINT FILE...' : 'GENERATE & PRINT LABELS'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintBarcode;