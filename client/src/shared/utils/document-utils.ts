
export function generateQRCodeSVG(data: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width='100' height='100' fill='white'/>
    <text x='10' y='50' fill='black' font-size='10'>QR: ${data}</text>
  </svg>`;
}
