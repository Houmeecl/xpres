
import React from "react";

export default function VecinosLandingStandalone() {
  return (
    <main className="text-gray-800 font-sans">
      {/* HERO */}
      <section className="bg-blue-50 py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">VecinoXpress</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6">
          Legaliza documentos, declara poderes o firma contratos desde tu almacén o minimarket.
        </p>
        <a href="/vecinos-standalone-login" className="btn-primary inline-block">
          Digitaliza tu negocio
        </a>
      </section>

      {/* BENEFICIOS */}
      <section className="py-16 px-6 bg-white">
        <h2 className="section-title text-center">Beneficios para tu negocio</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
          <div className="card">
            <h3 className="text-xl font-bold mb-2">Atención 24/7</h3>
            <p>Ofrece trámites legales en cualquier horario sin necesidad de salir del barrio.</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-2">Ingresos Extra</h3>
            <p>Por cada documento validado, tu local gana comisiones sin esfuerzo adicional.</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-2">Confianza Legal</h3>
            <p>Respaldo con firma digital avanzada y validez bajo Ley 19.799.</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 px-6 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para convertirte en un punto legal de confianza?</h2>
        <p className="mb-6 text-lg">Comienza hoy mismo y únete a la red VecinoXpress.</p>
        <a href="/vecinos-standalone-login" className="btn-secondary inline-block">
          Iniciar ahora
        </a>
      </section>
    </main>
  );
}
