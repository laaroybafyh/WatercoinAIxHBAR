'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../../styles/pos.module.css';
import { usePOSStore } from '../../../lib/store';

export default function SettingsPage() {
  const store = usePOSStore();
  const [name, setName] = useState('');
  const [itemName, setItemName] = useState('');
  const [priceInput, setPriceInput] = useState(''); // Changed to string
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    setName(store.partnerName);
  }, [store.partnerName]);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file too large. Please choose an image smaller than 2MB.');
        e.target.value = ''; // Reset input
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        e.target.value = ''; // Reset input
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        alert('Error reading image file.');
        setImageFile(null);
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePartnerName = () => {
    if (name.trim()) {
      console.log('Saving partner name:', name.trim());
      store.setPartnerName(name.trim());
      alert('Partner name saved successfully!');
    } else {
      alert('Please enter a valid partner name');
    }
  };

  const handleAddProduct = () => {
    const price = parseFloat(priceInput);
    
    // Validation
    if (!itemName.trim()) {
      alert('Please enter a valid item name');
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }

    const newProduct = { 
      id: crypto.randomUUID(), 
      name: itemName.trim(), 
      price: price,
      image: imagePreview || undefined // Add image to product
    };
    
    console.log('Adding product:', newProduct);
    
    try {
      store.addProduct(newProduct);
      
      // Reset form
      setItemName('');
      setPriceInput('');
      setImageFile(null);
      setImagePreview(null);
      
      alert(`Product "${newProduct.name}" added successfully!`);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      console.log('Deleting product:', id);
      store.removeProduct(id);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link href="/pos" className={styles.back}>POS</Link>
        <h1 className={styles.title}>POS Settings</h1>
        <div/>
      </header>

      <div className={styles.settingsContainer}>
        <div className={styles.settingsRow}>
          <section className={styles.settingsSection}>
            <h2>Partner Name</h2>
            <div className={styles.row}> 
              <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Watercoin Makmur" />
              <button className={styles.primary} onClick={handleSavePartnerName}>Save</button>
            </div>
          </section>

          <section className={styles.settingsSection}>
            <h2>Add Item</h2>
            <div className={styles.row}>
              <input 
                className={styles.input} 
                value={itemName} 
                onChange={e => setItemName(e.target.value)} 
                placeholder="Item Name" 
              />
              <input 
                className={styles.input} 
                type="text" 
                value={priceInput} 
                onChange={e => {
                  // Allow only numbers and decimal point, remove leading zeros
                  let value = e.target.value;
                  // Allow empty string
                  if (value === '') {
                    setPriceInput('');
                    return;
                  }
                  // Only allow digits and single decimal point
                  if (/^\d*\.?\d*$/.test(value)) {
                    // Remove leading zeros except for decimal numbers like 0.5
                    if (value.includes('.')) {
                      // For decimal numbers, only remove leading zeros before decimal if multiple zeros
                      const parts = value.split('.');
                      const intPart = parts[0] || '';
                      const decPart = parts[1] || '';
                      const cleanedIntPart = intPart === '' ? '0' : intPart.replace(/^0+/, '') || '0';
                      value = cleanedIntPart + '.' + decPart;
                    } else if (value.length > 1 && value[0] === '0') {
                      // For non-decimal numbers, remove leading zeros
                      value = value.replace(/^0+/, '') || '0';
                    }
                    setPriceInput(value);
                  }
                }} 
                placeholder="Price (e.g., 6000)" 
              />
            </div>
            <div className={styles.row} style={{marginTop: '12px'}}>
              <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                <label style={{color: '#FFFFFF', marginBottom: '8px', fontSize: '0.9rem'}}>
                  Product Image (optional, max 2MB)
                </label>
                <div style={{display: 'flex', gap: '8px', alignItems: 'flex-start'}}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    style={{
                      padding: '8px', 
                      borderRadius: '8px', 
                      border: '1px solid #ccc',
                      backgroundColor: '#FFFFFF',
                      flex: 1
                    }}
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        // Reset file input
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {imagePreview && (
                  <div style={{marginTop: '8px'}}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '2px solid #0D6CA3'
                      }} 
                    />
                  </div>
                )}
              </div>
              <button className={styles.primary} onClick={handleAddProduct}>Add</button>
            </div>
          </section>
        </div>

        <div className={styles.settingsRow}>
          <section className={styles.settingsSection}>
            <h2>Products</h2>
            <ul className={styles.list}>
              {store.products.map(p => (
                <li key={p.id} className={styles.listItem}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    {p.image ? (
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        style={{
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'cover', 
                          borderRadius: '6px',
                          border: '1px solid #0D6CA3'
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: '#f0f0f0', 
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        No Img
                      </div>
                    )}
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: 'bold'}}>{p.name}</div>
                      <div style={{fontSize: '0.9rem', color: '#666'}}>
                        Rp {p.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <button className={styles.secondary} onClick={() => handleDeleteProduct(p.id, p.name)}>Delete</button>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.settingsSection}>
            <h2>Export & Statistics</h2>
            <div className={styles.row}>
              <button className={styles.secondary} onClick={() => store.exportWeeklyCsv()}>Download Weekly CSV</button>
              <button className={styles.secondary} onClick={() => store.generateWeeklyReport()}>View Chart</button>
            </div>
            <div id="chart-root" className={styles.chartRoot}></div>
          </section>
        </div>
      </div>
    </div>
  );
}


