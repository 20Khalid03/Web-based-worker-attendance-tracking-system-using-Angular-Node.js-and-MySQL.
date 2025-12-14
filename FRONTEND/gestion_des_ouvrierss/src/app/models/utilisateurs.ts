export interface Utilisateur {
  id: number; 
  login: string;
  password: string;
  First_Name: string;
  Last_Name: string;
  E_mail: string;
  role: 'admin' | 'ouvrier';  
}
