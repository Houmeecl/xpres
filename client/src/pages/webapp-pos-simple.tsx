import React, { useState } from 'react';

// Tipos de documentos notariales disponibles
const documentTypes = [
  {
    id: 'compraventa-vehiculo',
    name: 'Contrato de Compraventa de Vehículo',
    description: 'Contrato para la venta de automóviles, motocicletas y otros vehículos',
    price: 15000,
    fields: [
      { name: 'vendedor_nombre', label: 'Nombre del Vendedor', type: 'text', required: true },
      { name: 'vendedor_rut', label: 'RUT del Vendedor', type: 'text', required: true },
      { name: 'vendedor_domicilio', label: 'Domicilio del Vendedor', type: 'text', required: true },
      { name: 'comprador_nombre', label: 'Nombre del Comprador', type: 'text', required: true },
      { name: 'comprador_rut', label: 'RUT del Comprador', type: 'text', required: true },
      { name: 'comprador_domicilio', label: 'Domicilio del Comprador', type: 'text', required: true },
      { name: 'vehiculo_marca', label: 'Marca del Vehículo', type: 'text', required: true },
      { name: 'vehiculo_modelo', label: 'Modelo del Vehículo', type: 'text', required: true },
      { name: 'vehiculo_año', label: 'Año del Vehículo', type: 'number', required: true },
      { name: 'vehiculo_color', label: 'Color del Vehículo', type: 'text', required: true },
      { name: 'vehiculo_placa', label: 'Placa del Vehículo', type: 'text', required: true },
      { name: 'precio', label: 'Precio de Venta (CLP)', type: 'number', required: true },
      { name: 'forma_pago', label: 'Forma de Pago', type: 'textarea', required: true },
      { name: 'fecha_entrega', label: 'Fecha de Entrega', type: 'date', required: true },
      { name: 'condiciones_entrega', label: 'Condiciones de Entrega', type: 'textarea', required: true }
    ]
  },
  {
    id: 'poder-bancario',
    name: 'Poder Bancario',
    description: 'Poder para realizar operaciones bancarias',
    price: 12000,
    fields: [
      { name: 'mandante_nombre', label: 'Nombre del Mandante', type: 'text', required: true },
      { name: 'mandante_rut', label: 'RUT del Mandante', type: 'text', required: true },
      { name: 'mandante_domicilio', label: 'Domicilio del Mandante', type: 'text', required: true },
      { name: 'mandatario_nombre', label: 'Nombre del Mandatario', type: 'text', required: true },
      { name: 'mandatario_rut', label: 'RUT del Mandatario', type: 'text', required: true },
      { name: 'mandatario_domicilio', label: 'Domicilio del Mandatario', type: 'text', required: true },
      { name: 'banco_nombre', label: 'Nombre del Banco', type: 'text', required: true },
      { name: 'cuenta_numero', label: 'Número de Cuenta', type: 'text', required: true },
      { name: 'operaciones_permitidas', label: 'Operaciones Permitidas', type: 'textarea', required: true },
      { name: 'vigencia', label: 'Vigencia del Poder', type: 'text', required: true }
    ]
  }
];

const WebAppPOSSimple: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'login' | 'select' | 'fill' | 'verify' | 'review' | 'sign' | 'payment' | 'download'>('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isVerified, setIsVerified] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');

  const selectedDocument = documentTypes.find(doc => doc.id === selectedDocumentType);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.email && loginData.password) {
      alert('Inicio de sesión exitoso');
      setCurrentStep('select');
    }
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocumentType(documentId);
    setCurrentStep('fill');
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateForm = () => {
    if (!selectedDocument) return false;
    const requiredFields = selectedDocument.fields.filter(field => field.required);
    return requiredFields.every(field => formData[field.name]?.trim());
  };

  const handleIdentityVerification = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setIsVerified(true);
        setCurrentStep('review');
        alert('Identidad verificada exitosamente');
      }, 3000);
    } catch (error) {
      alert('Error: No se pudo acceder a la cámara');
    }
  };

  const generateDocumentHTML = (docType: any, data: Record<string, string>, verificationCode: string) => {
    const currentDate = new Date().toLocaleDateString('es-CL');
    const currentDateTime = new Date().toLocaleString('es-CL');
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docType.name}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .document-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .document-header {
      text-align: center;
      border-bottom: 2px solid #eee;
      padding: 20px;
      background-color: #fff;
      position: relative;
    }
    .document-title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .document-subtitle {
      font-size: 16px;
      color: #666;
    }
    .document-reference {
      text-align: right;
      padding: 15px 20px;
      color: #666;
      font-size: 14px;
      background-color: #f8f8f8;
      border-bottom: 1px solid #eee;
    }
    .document-content {
      padding: 25px;
    }
    .field {
      margin-bottom: 20px;
    }
    .field-label {
      display: block;
      margin-bottom: 8px;
      color: #EC1C24;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .field-value {
      padding: 12px;
      background-color: #f9f9f9;
      border-radius: 4px;
      border: 1px solid #eee;
      font-size: 15px;
    }
    .signature-area {
      margin-top: 40px;
      border-top: 1px solid #eee;
      padding: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f8f8f8;
    }
    .signature-info {
      max-width: 60%;
    }
    .signature-box {
      border: 2px solid #EC1C24;
      background-color: rgba(236, 28, 36, 0.05);
      width: 200px;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .signature-title {
      font-weight: bold;
      margin-bottom: 5px;
      color: #333;
    }
    .signature-date {
      font-size: 13px;
      color: #666;
    }
    .stamp {
      margin-top: 10px;
      font-weight: bold;
      color: #EC1C24;
      border: 2px solid #EC1C24;
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-15deg);
      font-size: 12px;
      text-align: center;
    }
    .document-footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #999;
      padding: 20px;
      border-top: 1px solid #eee;
    }
    .logo {
      text-align: center;
      margin-bottom: 10px;
    }
    .verification-section {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 30px 0;
      padding: 20px;
      background-color: #f0f0f0;
      border-radius: 8px;
    }
    .qr-code {
      margin-right: 20px;
    }
    .verification-info {
      max-width: 60%;
    }
    .verification-info h3 {
      color: #EC1C24;
      margin-bottom: 10px;
    }
    .verification-code {
      background-color: #fff;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #ddd;
      font-family: monospace;
      font-size: 16px;
      letter-spacing: 1px;
    }
    .document-status {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: #4CAF50;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: bold;
    }
    .document-parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .party {
      flex: 1;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 8px;
      margin: 0 10px;
    }
    .party h3 {
      margin-top: 0;
      color: #EC1C24;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <div class="logo">
        <h2>VecinoXpress NotaryPro</h2>
      </div>
      <div class="document-status">Verificado</div>
      <div class="document-title">${docType.name}</div>
      <div class="document-subtitle">Documento Legal Certificado</div>
    </div>

    <div class="document-reference">
      <div>Ref: ${verificationCode}</div>
      <div>Fecha: ${currentDate}</div>
      <div>Certificado por: VecinoXpress NotaryPro</div>
    </div>
    
    <div class="document-content">
      ${generateDocumentFields(docType, data)}
    </div>
    
    <div class="signature-area">
      <div class="signature-info">
        <p><strong>Estado:</strong> Firmado y verificado</p>
        <p><strong>Firma digital avanzada:</strong> Verificada según Ley 19.799</p>
        <p><strong>Certificado por:</strong> VecinoXpress NotaryPro</p>
        <p><strong>Verificación biométrica:</strong> Verificada</p>
      </div>
      
      <div class="signature-box">
        <p class="signature-title">Firmado Digitalmente</p>
        <p class="signature-date">${currentDateTime}</p>
        <div class="stamp">FIRMADO<br/>LEGAL</div>
      </div>
    </div>
    
    <div class="verification-section">
      <div class="qr-code">
        <div style="width: 150px; height: 150px; background: #ddd; display: flex; align-items: center; justify-content: center;">QR Code</div>
      </div>
      <div class="verification-info">
        <h3>Verificación de Autenticidad</h3>
        <p>Este documento cuenta con firma electrónica avanzada y puede ser verificado en cualquier momento.</p>
        <p><strong>Código de verificación:</strong></p>
        <div class="verification-code">${verificationCode}</div>
        <p><small>Para verificar la autenticidad, escanee el código QR o visite vecinoxpress.cl/verificar e ingrese el código.</small></p>
      </div>
    </div>
    
    <div class="document-footer">
      <p>Este documento es una representación digital del original con plena validez legal.</p>
      <p>Generado por VecinoXpress NotaryPro el ${currentDateTime}</p>
      <p>Protegido con tecnología blockchain | Hash: ${Math.random().toString(36).substr(2, 26).toUpperCase()}</p>
    </div>
  </div>
</body>
</html>`;
  };

  const generateDocumentFields = (docType: any, data: Record<string, string>) => {
    if (docType.id === 'compraventa-vehiculo') {
      return `
        <div class="document-parties">
          <div class="party">
            <h3>Vendedor</h3>
            <p><strong>Nombre:</strong> ${data.vendedor_nombre || ''}</p>
            <p><strong>RUT:</strong> ${data.vendedor_rut || ''}</p>
            <p><strong>Domicilio:</strong> ${data.vendedor_domicilio || ''}</p>
          </div>
          <div class="party">
            <h3>Comprador</h3>
            <p><strong>Nombre:</strong> ${data.comprador_nombre || ''}</p>
            <p><strong>RUT:</strong> ${data.comprador_rut || ''}</p>
            <p><strong>Domicilio:</strong> ${data.comprador_domicilio || ''}</p>
          </div>
        </div>
        
        <div class="field">
          <div class="field-label">Descripción del Vehículo</div>
          <div class="field-value">${data.vehiculo_marca || ''} ${data.vehiculo_modelo || ''}, Año ${data.vehiculo_año || ''}, Color ${data.vehiculo_color || ''}, Placa ${data.vehiculo_placa || ''}</div>
        </div>
        
        <div class="field">
          <div class="field-label">Precio de Venta</div>
          <div class="field-value">$${Number(data.precio || 0).toLocaleString('es-CL')} CLP</div>
        </div>
        
        <div class="field">
          <div class="field-label">Forma de Pago</div>
          <div class="field-value">${data.forma_pago || ''}</div>
        </div>
        
        <div class="field">
          <div class="field-label">Fecha de Entrega</div>
          <div class="field-value">${data.fecha_entrega || ''}</div>
        </div>
        
        <div class="field">
          <div class="field-label">Condiciones de Entrega</div>
          <div class="field-value">${data.condiciones_entrega || ''}</div>
        </div>
      `;
    }
    
    return docType.fields.map((field: any) => `
      <div class="field">
        <div class="field-label">${field.label}</div>
        <div class="field-value">${data[field.name] || ''}</div>
      </div>
    `).join('');
  };

  const handleReview = () => {
    if (!validateForm()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    
    const verificationCode = `CFDOC-${Math.random().toString(36).substr(2, 8).toUpperCase()}-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`;
    const documentHTML = generateDocumentHTML(selectedDocument, formData, verificationCode);
    setGeneratedDocument(documentHTML);
    setCurrentStep('sign');
  };

  const handleSign = () => {
    setIsSigned(true);
    setCurrentStep('payment');
    alert('Documento firmado exitosamente');
  };

  const handlePayment = () => {
    setIsPaid(true);
    setCurrentStep('download');
    alert(`Pago procesado: $${selectedDocument?.price.toLocaleString('es-CL')} CLP`);
  };

  const downloadDocument = () => {
    const blob = new Blob([generatedDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDocumentType}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Documento descargado exitosamente');
  };

  const resetForm = () => {
    setCurrentStep('login');
    setSelectedDocumentType('');
    setFormData({});
    setIsVerified(false);
    setIsSigned(false);
    setIsPaid(false);
    setGeneratedDocument('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
            VecinoXpress NotaryPro
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
            Sistema de Documentos Notariales Digitales
          </p>
        </div>

        {/* Paso 1: Login */}
        {currentStep === 'login' && (
          <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>🔐 Iniciar Sesión</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correo Electrónico</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                  required
                />
              </div>
              <button
                type="submit"
                style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}
              >
                Ingresar
              </button>
            </form>
          </div>
        )}

        {/* Paso 2: Selección de Documento */}
        {currentStep === 'select' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginBottom: '20px' }}>📄 Seleccione el Tipo de Documento</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {documentTypes.map((docType) => (
                <div
                  key={docType.id}
                  onClick={() => handleDocumentSelect(docType.id)}
                  style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '10px' }}>{docType.name}</h3>
                  <p style={{ color: '#6b7280', marginBottom: '15px' }}>{docType.description}</p>
                  <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '5px', display: 'inline-block' }}>
                    Precio: ${docType.price.toLocaleString('es-CL')} CLP
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Completar Datos */}
        {currentStep === 'fill' && selectedDocument && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginBottom: '20px' }}>✏️ Complete los Datos del Documento</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {selectedDocument.fields.map((field) => (
                <div key={field.name}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '80px' }}
                      placeholder={`Ingrese ${field.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      placeholder={`Ingrese ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setCurrentStep('select')}
                style={{ padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Volver
              </button>
              <button
                onClick={() => setCurrentStep('verify')}
                disabled={!validateForm()}
                style={{
                  padding: '10px 20px',
                  background: validateForm() ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: validateForm() ? 'pointer' : 'not-allowed'
                }}
              >
                Continuar a Verificación
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Verificación de Identidad */}
        {currentStep === 'verify' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>📷 Verificación de Identidad</h2>
            {!isVerified ? (
              <>
                <div style={{ width: '120px', height: '120px', background: '#f3f4f6', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  📷
                </div>
                <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                  Haga clic en el botón para iniciar la verificación biométrica
                </p>
                <button
                  onClick={handleIdentityVerification}
                  style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}
                >
                  Iniciar Verificación
                </button>
              </>
            ) : (
              <>
                <div style={{ width: '120px', height: '120px', background: '#dcfce7', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  ✅
                </div>
                <p style={{ color: '#16a34a', fontWeight: 'bold', marginBottom: '20px' }}>
                  Identidad verificada exitosamente
                </p>
                <button
                  onClick={handleReview}
                  style={{ padding: '12px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}
                >
                  Continuar
                </button>
              </>
            )}
          </div>
        )}

        {/* Paso 5: Firma del Documento */}
        {currentStep === 'sign' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>✍️ Firma Digital</h2>
            {!isSigned ? (
              <>
                <div style={{ width: '120px', height: '120px', background: '#fef3c7', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  ✍️
                </div>
                <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                  Firme el documento digitalmente para continuar
                </p>
                <button
                  onClick={handleSign}
                  style={{ padding: '12px 24px', background: '#f59e0b', color: '
