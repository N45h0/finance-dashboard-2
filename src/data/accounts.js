const accounts = [
 {
   id: "6039",
   name: "Brou Débito 6039",
   type: "Visa débito",
   expiry: "03/2029",
   income: ["Pagos Expande Digital"],
   services: [
     "Spotify Premium Familiar",
     "Claude Pro", 
     "Google One",
     "Plan Antel",
     "Refinanciamiento Antel"
   ],
     linkedLoans: ["BROU Viaje Argentina", "BROU Dentista", "BROU Buenos Aires"]
 },
 {
   id: "2477",
   name: "Visa Santander Débito",
   type: "Visa débito",
   income: ["Pasividades BPS", "Sueldo Elared", "Pagos Expande Digital"],
   services: ["ChatGPT Plus"]
 },
 {
   id: "3879",
   name: "Prex Mastercard UY",
   type: "Prepago",
   backup: true
 }
];

export default accounts;
