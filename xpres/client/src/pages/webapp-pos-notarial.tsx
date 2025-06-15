import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Eye, Camera, CheckCircle, AlertCircle, LogIn, CreditCard, FileSignature } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  // ... otros tipos de documentos ...
];

const WebAppPOSNotarial: React.FC = () => {
  // Estados para el flujo completo
  const [currentStep, setCurrentStep] = useState<'login' | 'select' | 'fill' | 'verify' | 'review' | 'sign' | 'payment' | 'download'>('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isVerified, setIsVerified] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

  // Manejadores de eventos
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simular login
    if (loginData.email && loginData.password) {
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      });
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

  const handleIdentityVerification = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setIsVerified(true);
        setCurrentStep('review');
        toast({
          title: "Identidad Verificada",
          description: "Su identidad ha sido verificada exitosamente",
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Error de Verificación",
        description: "No se pudo acceder a la cámara para verificación",
        variant: "destructive"
      });
    }
  };

  const handleSignDocument = async () => {
    try {
      // Simular proceso de firma
      setTimeout(() => {
        setIsSigned(true);
        setCurrentStep('payment');
        toast({
          title: "Documento Firmado",
          description: "El documento ha sido firmado exitosamente",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error de Firma",
        description: "No se pudo firmar el documento",
        variant: "destructive"
      });
    }
  };

  const handlePayment = async () => {
    try {
      const selectedDoc = documentTypes.find(doc => doc.id === selectedDocumentType);
      const amount = selectedDoc?.price || 0;

      // Simular integración con pasarela de pago
      setTimeout(() => {
        setIsPaid(true);
        setCurrentStep('download');
        toast({
          title: "Pago Exitoso",
          description: `Se ha procesado el pago de $${amount.toLocaleString('es-CL')} CLP`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error de Pago",
        description: "No se pudo procesar el pago",
        variant: "destructive"
      });
    }
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
    
    toast({
      title: "Documento Descargado",
      description: "El documento ha sido descargado exitosamente",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            VecinoXpress NotaryPro
          </h1>
          <p className="text-xl text-gray-600">
            Sistema de Documentos Notariales Digitales
          </p>
        </div>

        {/* Paso 1: Login */}
        {currentStep === 'login' && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-6 w-6" />
                Iniciar Sesión
              </CardTitle>
              <CardDescription>
                Ingrese sus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Ingresar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Paso 2: Selección de Documento */}
        {currentStep === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Seleccione el Tipo de Documento
              </CardTitle>
              <CardDescription>
                Elija el documento notarial que desea generar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentTypes.map((docType) => (
                  <Card 
                    key={docType.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleDocumentSelect(docType.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{docType.name}</CardTitle>
                      <CardDescription>{docType.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">
                        Precio: ${docType.price.toLocaleString('es-CL')} CLP
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 3: Completar Datos */}
        {currentStep === 'fill' && selectedDocumentType && (
          <Card>
            <CardHeader>
              <CardTitle>Complete los Datos del Documento</CardTitle>
              <CardDescription>
                Ingrese la información requerida para generar el documento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentTypes
                  .find(doc => doc.id === selectedDocumentType)
                  ?.fields.map(field => (
                    <div key={field.name}>
                      <Label htmlFor={field.name}>{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                        />
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('select')}>
                  Volver
                </Button>
                <Button onClick={() => setCurrentStep('verify')}>
                  Continuar a Verificación
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 4: Verificación de Identidad */}
        {currentStep === 'verify' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-6 w-6" />
                Verificación de Identidad
              </CardTitle>
              <CardDescription>
                Complete la verificación biométrica para continuar
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {!isVerified ? (
                <Button onClick={handleIdentityVerification}>
                  Iniciar Verificación
                </Button>
              ) : (
                <div className="text-green-600">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  Identidad Verificada
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Paso 5: Revisión del Documento */}
        {currentStep === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>Revisar Documento</CardTitle>
              <CardDescription>
                Verifique que toda la información sea correcta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border p-4 rounded-lg mb-4">
                {/* Mostrar preview del documento */}
                {/* ... contenido del documento ... */}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('fill')}>
                  Editar
                </Button>
                <Button onClick={() => setCurrentStep('sign')}>
                  Proceder a Firmar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 6: Firma del Documento */}
        {currentStep === 'sign' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-6 w-6" />
                Firma Digital
              </CardTitle>
              <CardDescription>
                Firme el documento digitalmente para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSigned ? (
                <Button onClick={handleSignDocument}>
                  Firmar Documento
                </Button>
              ) : (
                <div className="text-green-600">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  Documento Firmado
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Paso 7: Pago */}
        {currentStep === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Procesar Pago
              </CardTitle>
              <CardDescription>
                Complete el pago para recibir su documento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-lg font-semibold">
                  Total a pagar: ${documentTypes.find(doc => doc.id === selectedDocumentType)?.price.toLocaleString('es-CL')} CLP
                </p>
              </div>
              {!isPaid ? (
                <Button onClick={handlePayment}>
                  Realizar Pago
                </Button>
              ) : (
                <div className="text-green-600">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  Pago Procesado
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Paso 8: Descarga */}
        {currentStep === 'download' && (
          <Card>
            <CardHeader>
              <CardTitle>Descarga tu Documento</CardTitle>
              <CardDescription>
                Tu documento está listo para ser descargado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadDocument}>
                <Download className="h-4 w-4 mr-2" />
                Descargar Documento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WebAppPOSNotarial;
