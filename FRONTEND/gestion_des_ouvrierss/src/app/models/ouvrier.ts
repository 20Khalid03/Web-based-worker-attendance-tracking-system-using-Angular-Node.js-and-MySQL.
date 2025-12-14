export interface Ouvrier {
  id?: number;
  First_Name: string;
  Last_Name: string;
  CIN: string;
  telephone: string;
  E_mail: string;
  date_de_naissance: string;
  photo?: string;
  user?: {
    login: string;
    password: string;
  };
  nombre_absences:number;
}