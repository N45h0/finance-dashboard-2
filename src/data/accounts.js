const accounts = [
 {
   id: "6039",
   name: "Cuenta Principal",
   type: "Visa débito",
   expiry: "03/2029",
   income: ["Pagos Expande Digital", "Ex sueldo Elared"],
   services: [
     "Spotify Premium Familiar",
     "Claude Pro", 
     "Google One",
     "Plan Antel",
     "Refinanciamiento Antel"
   ]
 },
 {
   id: "2477",
   name: "Cuenta BPS",
   type: "Visa débito",
   income: ["Pasividades BPS"],
   services: ["ChatGPT Plus"],
   linkedLoans: ["BROU Viaje Argentina", "BROU Dentista", "BROU Buenos Aires"]
 },
 {
   id: "3879",
   name: "MasterCard Prepago",
   type: "Prepago",
   backup: true
 }
];

export default accounts;
