export interface IUserSeed {
  dni: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: { name: string };
  address: string;
  neighborhood: { name: string };
  active: number;
}
