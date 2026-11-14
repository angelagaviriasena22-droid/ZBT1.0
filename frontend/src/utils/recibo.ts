import { jsPDF } from "jspdf";

import type { Usuario } from "../types/usuario";
import type { Viaje } from "../types/viaje";
import { fechaCorta, moneda } from "./formato";

const AZUL: [number, number, number] = [6, 11, 103];
const GRIS: [number, number, number] = [90, 90, 90];
const CLARO: [number, number, number] = [241, 234, 227];

function recortar(texto: string, max: number): string {
  return texto.length > max ? texto.slice(0, max - 3) + "..." : texto;
}

export function descargarRecibo(viaje: Viaje, usuario: Usuario): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const margen = 18;
  const derecha = ancho - margen;
  let y = 0;

  function nuevaPaginaSi(alto: number) {
    if (y + alto > 275) {
      doc.addPage();
      y = 20;
    }
  }

  function seccion(titulo: string) {
    nuevaPaginaSi(14);
    doc.setTextColor(...AZUL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(titulo, margen, y);
    y += 2;
    doc.setDrawColor(...AZUL);
    doc.setLineWidth(0.4);
    doc.line(margen, y, derecha, y);
    y += 7;
  }

  function fila(etiqueta: string, valor: string) {
    nuevaPaginaSi(7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...GRIS);
    doc.text(etiqueta, margen, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(valor || "-", margen + 42, y, { maxWidth: derecha - margen - 42 });
    y += 7;
  }

  // ---------- Encabezado ----------
  doc.setFillColor(...AZUL);
  doc.rect(0, 0, ancho, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Zafiro Bloom Tours", margen, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Comprobante de reserva", margen, 25);
  doc.setFontSize(10);
  doc.text(`Reserva No. ${viaje.id_vp}`, derecha, 16, { align: "right" });
  doc.text(
    `Emitido: ${new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
    derecha,
    25,
    { align: "right" }
  );
  y = 48;

  // ---------- Datos del cliente ----------
  seccion("Datos del cliente");
  fila("Nombre", `${usuario.nombre} ${usuario.apellidos ?? ""}`.trim());
  fila("Correo", usuario.correo);
  fila("Telefono", usuario.telefono ?? "");
  fila("Ciudad", usuario.ciudad ?? "");
  fila("Direccion", usuario.direccion ?? "");
  y += 4;

  // ---------- Datos del viaje ----------
  seccion("Datos del viaje");
  fila("Destino", viaje.nombre_destino);
  fila("Hotel", viaje.nombre_hotel);
  fila("Llegada", fechaCorta(viaje.fecha_inicial));
  fila("Salida", fechaCorta(viaje.fecha_final));
  fila("Duracion", `${viaje.noches} ${viaje.noches === 1 ? "noche" : "noches"}`);
  fila("Personas", String(viaje.num_personas));
  fila("Estado", viaje.estado.charAt(0).toUpperCase() + viaje.estado.slice(1));
  y += 4;

  // ---------- Habitaciones ----------
  seccion("Habitaciones reservadas");
  nuevaPaginaSi(10);
  doc.setFillColor(...CLARO);
  doc.rect(margen, y - 5, derecha - margen, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...AZUL);
  doc.text("Habitacion", margen + 2, y);
  doc.text("Personas", margen + 88, y);
  doc.text("Por noche", margen + 112, y);
  doc.text("Subtotal", derecha - 2, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  for (const h of viaje.habitaciones) {
    nuevaPaginaSi(8);
    const subtotal = Number(h.precio_noche) * viaje.noches;
    doc.text(recortar(h.nombre_habitacion, 38), margen + 2, y);
    doc.text(String(h.personas_asignadas), margen + 88, y);
    doc.text(moneda(h.precio_noche), margen + 112, y);
    doc.text(moneda(subtotal), derecha - 2, y, { align: "right" });
    y += 7;
  }

  // ---------- Total ----------
  y += 2;
  nuevaPaginaSi(16);
  doc.setDrawColor(...AZUL);
  doc.setLineWidth(0.6);
  doc.line(margen, y, derecha, y);
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...AZUL);
  doc.text("TOTAL", margen, y);
  doc.text(moneda(viaje.precio), derecha, y, { align: "right" });
  y += 14;

  // ---------- Pie ----------
  nuevaPaginaSi(20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRIS);
  doc.text(
    "Este documento es un comprobante de reserva generado por la plataforma Zafiro Bloom Tours.\nConservalo para presentarlo en el hotel. Gracias por viajar con nosotros.",
    margen,
    y,
    { maxWidth: derecha - margen }
  );

  doc.save(`recibo-zafiro-${viaje.id_vp}.pdf`);
}